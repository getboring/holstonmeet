import type { LoaderFunctionArgs } from 'react-router'
import { Link, Outlet, useLoaderData } from 'react-router'
import { eq } from 'drizzle-orm'
import { Rooms, getDb } from 'schema'
import { requireUser, getOrg } from '~/utils/auth.server'

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
	const user = await requireUser(request, context.cloudflare.env)
	const org = await getOrg(request, context.cloudflare.env)
	const db = getDb(context)

	let rooms: Array<{
		id: number
		name: string
		slug: string
		created: string
		isActive: boolean
	}> = []

	if (db && org) {
		rooms = await db
			.select({
				id: Rooms.id,
				name: Rooms.name,
				slug: Rooms.slug,
				created: Rooms.created,
				isActive: Rooms.isActive,
			})
			.from(Rooms)
			.where(eq(Rooms.orgId, org.id))
	}

	return ({ rooms, org })
}

export default function RoomsLayout() {
	return <Outlet />
}
