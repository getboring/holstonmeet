import type { ActionFunctionArgs } from '@remix-run/cloudflare'
import { destroyUserSession } from '~/utils/auth.server'

export const action = async ({ request, context }: ActionFunctionArgs) => {
	return destroyUserSession(request, context.env)
}

export const loader = async () => {
	// Redirect GET requests to dashboard
	return new Response(null, {
		status: 302,
		headers: { Location: '/dashboard' },
	})
}
