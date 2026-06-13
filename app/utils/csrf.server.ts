import { createCookieSessionStorage } from 'react-router'
import { mode } from './mode'
import type { Env } from '~/types/Env'

const DEFAULT_CSRF_SECRET = 'holstonmeet-csrf-fallback'
const COOKIE_NAME = '__hm_csrf'

function getCsrfStorage(env?: Env) {
	const secret = env?.SESSION_SECRET || DEFAULT_CSRF_SECRET
	return createCookieSessionStorage({
		cookie: {
			name: COOKIE_NAME,
			secrets: [secret],
			sameSite: 'lax',
			httpOnly: true,
			secure: mode === 'production',
			maxAge: 60 * 60, // 1 hour
			path: '/',
		},
	})
}

export async function createCsrfToken(env?: Env): Promise<{
	token: string
	cookie: string
}> {
	const storage = getCsrfStorage(env)
	const session = await storage.getSession()
	const token = crypto.randomUUID()
	session.set('csrf', token)
	return { token, cookie: await storage.commitSession(session) }
}

export async function validateCsrfToken(request: Request, env?: Env): Promise<boolean> {
	const storage = getCsrfStorage(env)
	const session = await storage.getSession(request.headers.get('Cookie'))
	const storedToken = session.get('csrf')
	if (!storedToken || typeof storedToken !== 'string') return false

	const formData = await request.clone().formData()
	const formToken = formData.get('csrf_token')
	if (!formToken || typeof formToken !== 'string') return false

	return storedToken === formToken
}
