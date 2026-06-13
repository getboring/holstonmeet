import { redirect } from 'react-router'
import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router'
import { Form, Link, useActionData, useLoaderData } from 'react-router'
import { eq } from 'drizzle-orm'
import { Users, getDb } from 'schema'
import { Button } from '~/components/Button'
import { Input } from '~/components/Input'
import { Label } from '~/components/Label'
import { createUserSession, getUserId, verifyPassword } from '~/utils/auth.server'
import { createCsrfToken, validateCsrfToken } from '~/utils/csrf.server'
import { checkRateLimit, recordRateLimitAttempt } from '~/utils/rate-limit.server'
import { loginSchema } from '~/utils/validation'

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

	const formData = await request.formData()
	const parsed = loginSchema.safeParse({
		email: formData.get('email'),
		password: formData.get('password'),
	})

	if (!parsed.success) {
		const firstError = parsed.error.issues[0]?.message ?? 'Invalid input'
		return { error: firstError, status: 400 as const }
	}

	const rateLimitKey = `login:${parsed.data.email}`
	const { allowed } = await checkRateLimit(db, rateLimitKey)
	if (!allowed) {
		return { error: 'Too many login attempts. Please try again later.', status: 429 as const }
	}

	const [user] = await db
		.select()
		.from(Users)
		.where(eq(Users.email, parsed.data.email))

	if (!user) {
		await recordRateLimitAttempt(db, rateLimitKey)
		return { error: 'Invalid email or password', status: 401 as const }
	}

	const valid = await verifyPassword(parsed.data.password, user.passwordHash)
	if (!valid) {
		await recordRateLimitAttempt(db, rateLimitKey)
		return { error: 'Invalid email or password', status: 401 as const }
	}

	return createUserSession(user.id, '/dashboard', context.cloudflare.env)
}

export default function Login() {
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
						Sign in to your account
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
