import { redirect } from 'react-router'
import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router'
import { Form, Link, useActionData, useLoaderData } from 'react-router'
import { eq } from 'drizzle-orm'
import { Users, Organizations, getDb } from 'schema'
import { Button } from '~/components/Button'
import { Input } from '~/components/Input'
import { Label } from '~/components/Label'
import { createUserSession, getUserId, hashPassword } from '~/utils/auth.server'
import { createCsrfToken, validateCsrfToken } from '~/utils/csrf.server'
import { checkRateLimit } from '~/utils/rate-limit.server'
import { registerSchema } from '~/utils/validation'

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
	const userId = await getUserId(request, context.cloudflare.env)
	if (userId) return redirect('/dashboard')
	const { token, cookie } = await createCsrfToken(context.cloudflare.env)
	return { csrfToken: token, cookie }
}

export const action = async ({ request, context }: ActionFunctionArgs) => {
	if (!(await validateCsrfToken(request, context.cloudflare.env))) {
		return { error: 'Invalid or missing CSRF token', status: 403 as const }
	}

	const db = getDb(context)
	if (!db) return { error: 'Database unavailable', status: 500 as const }

	const { allowed } = await checkRateLimit(db, 'register')
	if (!allowed) {
		return { error: 'Too many registration attempts. Please try again later.', status: 429 as const }
	}

	const formData = await request.formData()
	const parsed = registerSchema.safeParse({
		name: formData.get('name'),
		email: formData.get('email'),
		password: formData.get('password'),
		orgName: formData.get('orgName'),
	})

	if (!parsed.success) {
		const firstError = parsed.error.issues[0]?.message ?? 'Invalid input'
		return { error: firstError, status: 400 as const }
	}

	const { name, email, password, orgName } = parsed.data

	const [existing] = await db
		.select()
		.from(Users)
		.where(eq(Users.email, email))

	if (existing) {
		return { error: 'An account with this email already exists', status: 409 as const }
	}

	const orgSlug = orgName
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '')

	if (orgSlug.length < 1) {
		return { error: 'Organization name must contain at least one alphanumeric character', status: 400 as const }
	}

	const [existingOrg] = await db
		.select()
		.from(Organizations)
		.where(eq(Organizations.slug, orgSlug))

	if (existingOrg) {
		return { error: 'An organization with that name already exists', status: 409 as const }
	}

	const passwordHash = await hashPassword(password)

	const result = await db.transaction(async (tx) => {
		const [org] = await tx
			.insert(Organizations)
			.values({ name: orgName, slug: orgSlug })
			.returning()

		const [user] = await tx
			.insert(Users)
			.values({
				name,
				email,
				passwordHash,
				role: 'owner',
				orgId: org.id,
			})
			.returning()

		return { org, user }
	})

	return createUserSession(result.user.id, '/dashboard', context.cloudflare.env)
}

export default function Register() {
	const loaderData = useLoaderData<typeof loader>()
	const actionData = useActionData<typeof action>()

	return (
		<div className="flex flex-col items-center justify-center h-full p-4 bg-linear-to-br from-indigo-50 via-white to-violet-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-indigo-950">
			<div className="w-full max-w-sm space-y-6">
				<div className="text-center">
					<h1 className="text-4xl font-bold text-zinc-900 dark:text-white">
						📹 HolstonMeet
					</h1>
					<p className="text-sm text-zinc-500 mt-2">
						Create your organization
					</p>
				</div>
				<div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 ring-1 ring-zinc-200/50 dark:ring-zinc-800/50 shadow-xl shadow-black/5 space-y-5">
					{'error' in (actionData ?? {}) && (
						<div className="p-3 rounded-lg text-sm bg-red-50 text-red-700 ring-1 ring-red-200 dark:bg-red-900/30 dark:text-red-300 dark:ring-red-800">
							{(actionData as { error: string }).error}
						</div>
					)}
					<Form method="post" className="space-y-4">
						<input type="hidden" name="csrf_token" value={loaderData.csrfToken} />
						<div className="space-y-1.5">
							<Label htmlFor="orgName">Organization Name</Label>
							<Input
								id="orgName"
								name="orgName"
								required
								autoFocus
								placeholder="Acme Corp"
							/>
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="name">Your Name</Label>
							<Input
								id="name"
								name="name"
								required
								autoComplete="name"
								placeholder="Jane Doe"
							/>
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								name="email"
								type="email"
								required
								autoComplete="email"
								placeholder="you@company.com"
							/>
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="password">Password</Label>
							<Input
								id="password"
								name="password"
								type="password"
								required
								autoComplete="new-password"
								placeholder="At least 8 characters"
							/>
						</div>
						<Button type="submit" className="w-full">
							Create Account
						</Button>
					</Form>
				</div>
				<p className="text-center text-sm text-zinc-500">
					Already have an account?{' '}
					<Link
						to="/login"
						className="font-medium text-indigo-600 hover:text-indigo-700"
					>
						Sign in
					</Link>
				</p>
			</div>
		</div>
	)
}
