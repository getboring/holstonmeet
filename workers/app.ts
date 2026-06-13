import type { Env } from '~/types/Env'

export { ChatRoom } from '~/durableObjects/ChatRoom.server'

let _handler: ReturnType<typeof import('react-router').createRequestHandler> | null = null

async function getHandler() {
	if (!_handler) {
		const serverBuild = await import('../build/server/index.js')
		const { createRequestHandler } = await import('react-router')
		_handler = createRequestHandler(serverBuild as any, 'production')
	}
	return _handler
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext) {
		const handler = await getHandler()
		return handler(request, {
			cloudflare: { env, ctx },
		})
	},
} satisfies ExportedHandler<Env>
