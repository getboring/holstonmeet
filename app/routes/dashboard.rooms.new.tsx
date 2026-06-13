import { redirect } from 'react-router'
import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router'
import { Form, useActionData, useLoaderData } from 'react-router'
import { and, count, eq } from 'drizzle-orm'
import { Rooms, getDb } from 'schema'
import { requireUser, getOrg } from '~/utils/auth.server'
import { validateCsrfToken } from '~/utils/csrf.server'
import { Button } from '~/components/Button'
import { Input } from '~/components/Input'
import { Label } from '~/components/Label'
import { roomSchema } from '~/utils/validation'

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
	await requireUser(request, context.cloudflare.env)
	const org = await getOrg(request, context.cloudflare.env)
	return { org }
}

export const action = async ({ request, context }: ActionFunctionArgs) => {
	if (!(await validateCsrfToken(request, context.cloudflare.env))) {
		return { error: 'Invalid or missing CSRF token', status: 403 as const }
	}

	const user = await requireUser(request, context.cloudflare.env)
	const org = await getOrg(request, context.cloudflare.env)
	const db = getDb(context)

	if (!db || !org) {
		return { error: 'Database or organization unavailable', status: 500 as const }
	}

	const formData = await request.formData()
	const parsed = roomSchema.safeParse({ name: formData.get('name') })

	if (!parsed.success) {
		const firstError = parsed.error.issues[0]?.message ?? 'Invalid input'
		return { error: firstError, status: 400 as const }
	}

	const [roomCountResult] = await db
		.select({ count: count() })
		.from(Rooms)
		.where(eq(Rooms.orgId, org.id))

	if ((roomCountResult?.count ?? 0) >= org.maxRooms) {
		return { error: `Room limit reached (${org.maxRooms}). Upgrade your plan for more.`, status: 403 as const }
	}

	const slug = parsed.data.name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '')

	const [existingSlug] = await db
		.select()
		.from(Rooms)
		.where(and(eq(Rooms.orgId, org.id), eq(Rooms.slug, slug)))

	if (existingSlug) {
		return { error: 'A room with that name already exists in your organization', status: 409 as const }
	}

	await db.insert(Rooms).values({
		name: parsed.data.name,
		slug,
		orgId: org.id,
		createdBy: user.id,
	})

	return redirect('/dashboard/rooms')
}

export default function NewRoom() {
	const { org } = useLoaderData<typeof loader>()
	const actionData = useActionData<typeof action>()

	return (
		<div className="max-w-md mx-auto space-y-6">
			<div>
				<h1 className="text-2xl font-bold">Create Room</h1>
				<p className="text-zinc-500 text-sm mt-1">
					A room is a persistent meeting space for your team.
				</p>
			</div>

			{'error' in (actionData ?? {}) && (
				<div className="p-3 rounded-lg text-sm bg-red-50 text-red-700 ring-1 ring-red-200 dark:bg-red-900/30 dark:text-red-300 dark:ring-red-800">
					{(actionData as { error: string }).error}
				</div>
			)}

			<Form method="post" className="space-y-4">
				<div className="space-y-1.5">
					<Label htmlFor="name">Room Name</Label>
					<Input
						id="name"
						name="name"
						required
						autoFocus
						placeholder="e.g. Team Standup"
					/>
				</div>
				<div className="flex gap-3">
					<Button type="submit">Create Room</Button>
					<a href="/dashboard/rooms">
						<Button displayType="secondary">Cancel</Button>
					</a>
				</div>
			</Form>
		</div>
	)
}
