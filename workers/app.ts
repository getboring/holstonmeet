import { createRequestHandler } from 'react-router'
import type { Env } from '~/types/Env'

const requestHandler = createRequestHandler(
	// @ts-expect-error - virtual module resolved at build time by Vite
	() => import('virtual:react-router/server-build'),
	import.meta.env.MODE
)

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext) {
		return requestHandler(request, {
			cloudflare: { env, ctx },
		})
	},
} satisfies ExportedHandler<Env>
