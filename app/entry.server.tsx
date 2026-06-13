import type { EntryContext } from 'react-router'
import { ServerRouter } from 'react-router'
import { renderToString } from 'react-dom/server'
import { RELEASE, SENTRY_DSN } from './utils/constants'

function securityHeaders(headers: Headers): void {
	headers.set('X-Content-Type-Options', 'nosniff')
	headers.set('X-Frame-Options', 'DENY')
	headers.set('X-XSS-Protection', '1; mode=block')
	headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
	headers.set(
		'Permissions-Policy',
		'camera=self, microphone=self, geolocation=(), payment=()'
	)
	headers.set(
		'Content-Security-Policy',
		[
			"default-src 'self'",
			"script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com",
			"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
			"img-src 'self' data: blob:",
			"font-src 'self' https://fonts.gstatic.com",
			"connect-src 'self' wss://*.partykit.dev https://rtc.live.cloudflare.com",
			"frame-ancestors 'none'",
		].join('; ')
	)
}

export default function handleRequest(
	request: Request,
	responseStatusCode: number,
	responseHeaders: Headers,
	remixContext: EntryContext
) {
	const requestId =
		request.headers.get('X-Request-Id') || crypto.randomUUID()
	const startTime = performance.now()

	try {
		let markup = renderToString(
			<ServerRouter context={remixContext} url={request.url} />
		).replace(
			'__CLIENT_ENV__',
			`
			<script>
				window.ENV = ${JSON.stringify({
					RELEASE: RELEASE ?? 'dev',
					SENTRY_DSN: SENTRY_DSN,
				})}
			</script>
		`
		)

		// Apply security headers
		securityHeaders(responseHeaders)

		// Request ID and timing
		responseHeaders.set('X-Request-Id', requestId)
		const duration = performance.now() - startTime
		responseHeaders.set('X-Response-Time', `${duration.toFixed(2)}ms`)

		responseHeaders.set('Content-Type', 'text/html; charset=utf-8')
		return new Response('<!DOCTYPE html>' + markup, {
			status: responseStatusCode,
			headers: responseHeaders,
		})
	} catch (error) {
		console.error(JSON.stringify({
			eventName: 'entryServerError',
			requestId,
			error: error instanceof Error ? error.message : String(error),
		}))
		responseHeaders.set('Content-Type', 'text/html; charset=utf-8')
		securityHeaders(responseHeaders)
		return new Response(
			'<!DOCTYPE html>' +
				`<body>
					<p>Something went really wrong. We've been notified and are working on it!</p>
				</body>`,
			{
				status: 500,
				headers: responseHeaders,
			}
		)
	}
}
