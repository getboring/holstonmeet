import type { LoaderFunctionArgs } from 'react-router'
import { routePartyTracksRequest } from 'partytracks/server'

const proxy = async ({ request, context }: LoaderFunctionArgs) =>
	routePartyTracksRequest({
		appId: context.cloudflare.env.CALLS_APP_ID,
		token: context.cloudflare.env.CALLS_APP_SECRET,
		realtimeApiBaseUrl: context.cloudflare.env.CALLS_API_URL,
		request,
	})

export const loader = proxy
export const action = proxy
