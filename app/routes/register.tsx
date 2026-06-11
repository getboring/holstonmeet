import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/cloudflare'
import { json, redirect } from '@remix-run/cloudflare'
import { Form, Link, useActionData } from '@remix-run/react'
import { eq } from 'drizzle-orm'
import { Users, Organizations, getDb } from 'schema'
import { Button } from '~/components/Button'
import { Input } from '~/components/Input'
import { Label } from '~/components/Label'
import { createUserSession, getUserId, hashPassword } from '~/utils/auth.server'

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
	const userId = await getUserId(request, context.env)
	if (userId) return redirect('/dashboard')
	return json({})
}

export const action = async ({ request, context }: ActionFunctionArgs) => {
	const db = getDb(context)
	if (!db) return json({ error: 'Database unavailable' }, { status: 500 })

	const formData = await request.formData()
	const name = formData.get('name')
	const email = formData.get('email')
	const password = formData.get('password')
	const orgName = formData.get('orgName')

	if (
		typeof name !== 'string' ||
		typeof email !== 'string' ||
		typeof password !== 'string' ||
		typeof orgName !== 'string'
	) {
		return json({ error: 'Invalid form data' }, { status: 400 })
	}

	const normalizedEmail = email.toLowerCase().trim()

	if (password.length < 8) {
		return json({ error: 'Password must be at least 8 characters' }, { status: 400 })
	}

	if (name.trim().length < 1) {
		return json({ error: 'Name is required' }, { status: 400 })
	}

	if (orgName.trim().length < 1) {
		return json({ error: 'Organization name is required' }, { status: 400 })
	}

	const [existing] = await db.select().from(Users).where(eq(Users.email, normalizedEmail))
	if (existing) {
		return json({ error: 'An account with this email already exists' }, { status: 409 })
	}

	const orgSlug = orgName
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '')

	if (orgSlug.length < 1) {
		return json({ error: 'Organization name must contain alphanumeric characters' }, { status: 400 })
	}

	// Check org slug uniqueness
	const [existingOrg] = await db
		.select()
		.from(Organizations)
		.where(eq(Organizations.slug, orgSlug))
	if (existingOrg) {
		return json({ error: 'An organization with that name already exists' }, { status: 409 })
	}

	const passwordHash = await hashPassword(password)

	const [org] = await db
		.insert(Organizations)
		.values({
			name: orgName.trim(),
			slug: orgSlug,
		})
		.returning()

	const [user] = await db
		.insert(Users)
		.values({
			name: name.trim(),
			email: normalizedEmail,
			passwordHash,
			role: 'owner',
			orgId: org.id,
		})
		.returning()

	return createUserSession(user.id, '/dashboard', context.env)
}

export default function Register() {
	const actionData = useActionData<typeof action>()

	return (
		<div className="flex flex-col items-center justify-center h-full p-4 bg-gradient-to-br from-indigo-50 via-white to-violet-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-indigo-950">
			<div className="w-full max-w-sm space-y-6">
				<div className="text-center">
					<h1 className="text-4xl font-bold text-zinc-900 dark:text-white">📹 HolstonMeet</h1>
					<p className="text-sm text-zinc-500 mt-2">Create your organization</p>
				</div>
				<div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 ring-1 ring-zinc-200/50 dark:ring-zinc-800/50 shadow-xl shadow-black/5 space-y-5">
					{actionData?.error && (
						<div className="p-3 rounded-lg text-sm bg-red-50 text-red-700 ring-1 ring-red-200 dark:bg-red-900/30 dark:text-red-300 dark:ring-red-800">
							{actionData.error}
						</div>
					)}
					<Form method="post" className="space-y-4">
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
							<Input id="name" name="name" required autoComplete="name" placeholder="Jane Doe" />
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
					<Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-700">
						Sign in
					</Link>
				</p>
			</div>
		</div>
	)
}
