// Legacy session storage for CF Access username bridge.
// Uses env-sourced secret when available, falls back to ephemeral.
import { createCookieSessionStorage } from 'react-router'
import { mode } from '~/utils/mode'
import type { Env } from '~/types/Env'

/**
 * Get the legacy session storage for the CF Access username bridge.
 * In production, requires LEGACY_SESSION_SECRET env var.
 * In development, uses an ephemeral secret (sessions won't persist across restarts).
 */
export function getLegacySessionStorage(env?: Env) {
	const secret = env?.LEGACY_SESSION_SECRET
	if (!secret && mode === 'production') {
		throw new Error(
			'FATAL: LEGACY_SESSION_SECRET env var is required in production.'
		)
	}
	return createCookieSessionStorage({
		cookie: {
			name: '__session',
			secrets: [secret ?? crypto.randomUUID()],
			sameSite: true,
			httpOnly: true,
			secure: true,
			path: '/',
		},
	})
}
