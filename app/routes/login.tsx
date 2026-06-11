import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/cloudflare'
import { json, redirect } from '@remix-run/cloudflare'
import { Form, Link, useActionData } from '@remix-run/react'
import { eq } from 'drizzle-orm'
import { Users, getDb } from 'schema'
import { Button } from '~/components/Button'
import { Input } from '~/components/Input'
import { Label } from '~/components/Label'
import { createUserSession, getUserId, verifyPassword } from '~/utils/auth.server'
import { loginSchema } from '~/utils/validation'

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
	const userId = await getUserId(request, context.env)
	if (userId) return redirect('/dashboard')
	return json({})
}

export const action = async ({ request, context }: ActionFunctionArgs) => {
	const db = getDb(context)
	if (!db) return json({ error: 'Database unavailable' }, { status: 500 })

	const formData = await request.formData()
	const parsed = loginSchema.safeParse({
		email: formData.get('email'),
		password: formData.get('password'),
	})

	if (!parsed.success) {
		const firstError = parsed.error.issues[0]?.message ?? 'Invalid input'
		return json({ error: firstError }, { status: 400 })
	}

	const [user] = await db
		.select()
		.from(Users)
		.where(eq(Users.email, parsed.data.email))

	if (!user) {
		return json({ error: 'Invalid email or password' }, { status: 401 })
	}

	const valid = await verifyPassword(parsed.data.password, user.passwordHash)
	if (!valid) {
		return json({ error: 'Invalid email or password' }, { status: 401 })
	}

	return createUserSession(user.id, '/dashboard', context.env)
}

export default function Login() {
	const actionData = useActionData<typeof action>()

	return (
		<div className="flex flex-col items-center justify-center h-full p-4 bg-gradient-to-br from-indigo-50 via-white to-violet-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-indigo-950">
			<div className="w-full max-w-sm space-y-6">
				<div className="text-center">
					<h1 className="text-4xl font-bold text-zinc-900 dark:text-white">
						📹 HolstonMeet
					</h1>
					<p className="text-sm text-zinc-500 mt-2">
						Sign in to your account
					</p>
				</div>
				<div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 ring-1 ring-zinc-200/50 dark:ring-zinc-800/50 shadow-xl shadow-black/5 space-y-5">
					{actionData?.error && (
						<div className="p-3 rounded-lg text-sm bg-red-50 text-red-700 ring-1 ring-red-200 dark:bg-red-900/30 dark:text-red-300 dark:ring-red-800">
							{actionData.error}
						</div>
					)}
					<Form method="post" className="space-y-4">
						<div className="space-y-1.5">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								name="email"
								type="email"
								required
								autoComplete="email"
								autoFocus
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
								autoComplete="current-password"
								placeholder="Enter your password"
							/>
						</div>
						<Button type="submit" className="w-full">
							Sign In
						</Button>
					</Form>
				</div>
				<p className="text-center text-sm text-zinc-500">
					Don't have an account?{' '}
					<Link
						to="/register"
						className="font-medium text-indigo-600 hover:text-indigo-700"
					>
						Register
					</Link>
				</p>
			</div>
		</div>
	)
}
