import type { ActionFunctionArgs } from 'react-router'
import { destroyUserSession } from '~/utils/auth.server'
import { validateCsrfToken } from '~/utils/csrf.server'

export const action = async ({ request, context }: ActionFunctionArgs) => {
	if (!(await validateCsrfToken(request, context.cloudflare.env))) {
		return new Response('Invalid or missing CSRF token', { status: 403 })
	}
	return destroyUserSession(request, context.cloudflare.env)
}

export const loader = async () => {
	return new Response(null, {
		status: 302,
		headers: { Location: '/dashboard' },
	})
}
