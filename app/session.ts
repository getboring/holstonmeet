// Deprecated: use ~/utils/auth.server instead.
// Kept for backward compatibility with getUsername.server.ts
// which uses the old cookie-based username session.
import { createCookieSessionStorage } from '@remix-run/cloudflare'

export const { getSession, commitSession, destroySession } =
	createCookieSessionStorage({
		cookie: {
			name: '__session',
			secrets: ['holstonmeet_legacy_session'],
			sameSite: true,
			httpOnly: true,
			secure: true,
			path: '/',
		},
	})
