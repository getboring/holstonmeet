import type { Env } from './Env'

declare module 'react-router' {
	export interface AppLoadContext {
		cloudflare: {
			env: Env
			ctx: ExecutionContext
		}
	}
}
