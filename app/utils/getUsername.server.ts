import { getLegacySessionStorage } from '~/session'
import type { Env } from '~/types/Env'
import { ACCESS_AUTHENTICATED_USER_EMAIL_HEADER } from './constants'
import { safeRedirect } from './safeReturnUrl'

export async function setUsername(
	username: string,
	request: Request,
	env: Env,
	returnUrl: string = '/'
) {
	const storage = getLegacySessionStorage(env)
	const session = await storage.getSession(request.headers.get('Cookie'))
	session.set('username', username)
	throw safeRedirect(returnUrl, {
		headers: {
			'Set-Cookie': await storage.commitSession(session),
		},
	})
}

/**
 * Utility for getting the username. In prod, this basically
 * just consists of getting the Cf-Access-Authenticated-User-Email
 * header, but in dev we allow manually setting this via the
 * username query param.
 */
export default async function getUsername(request: Request, env: Env) {
	const accessUsername = request.headers.get(
		ACCESS_AUTHENTICATED_USER_EMAIL_HEADER
	)
	if (accessUsername) return accessUsername

	const storage = getLegacySessionStorage(env)
	const session = await storage.getSession(request.headers.get('Cookie'))
	const sessionUsername = session.get('username')
	if (typeof sessionUsername === 'string') return sessionUsername

	return null
}
