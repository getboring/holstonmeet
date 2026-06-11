export const loader = () => {
	const body = `User-agent: *
Allow: /
Disallow: /dashboard
Disallow: /api/
Disallow: /login
Disallow: /register
Disallow: /logout

Sitemap: https://holstonmeet.com/sitemap.xml
`
	return new Response(body, {
		headers: {
			'Content-Type': 'text/plain',
			'Cache-Control': 'public, max-age=86400',
		},
	})
}
