import type { LoaderFunction } from 'react-router'

export const loader = (async ({ request, context }) => {
	if (!context.cloudflare.env.FEEDBACK_STORAGE) {
		throw new Response('404: Missing KV Binding', { status: 404 })
	}

	const url = new URL(request.url)
	const id = url.searchParams.get('id')
	if (id === null) {
		throw new Response('missing id param', {
			status: 400,
		})
	}

	const debugInfo = await context.cloudflare.env.FEEDBACK_STORAGE.get(id)
	if (debugInfo === null) {
		throw new Response('404: Report not found', { status: 404 })
	}

	return new Response(debugInfo, {
		headers: {
			'Content-Type': 'application/json',
		},
	})
}) satisfies LoaderFunction
