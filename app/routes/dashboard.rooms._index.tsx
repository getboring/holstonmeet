import type { LoaderFunctionArgs } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'
import { Link, useLoaderData } from '@remix-run/react'
import { eq } from 'drizzle-orm'
import { Rooms, getDb } from 'schema'
import { requireUser, getOrg } from '~/utils/auth.server'
import { Button } from '~/components/Button'

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
	const user = await requireUser(request, context.env)
	const org = await getOrg(request, context.env)
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

	return json({ rooms, org })
}

export default function RoomsIndex() {
	const { rooms, org } = useLoaderData<typeof loader>()

	return (
		<div className="max-w-4xl mx-auto space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">Rooms</h1>
					<p className="text-zinc-500 text-sm mt-1">
						{rooms.length} of {org?.maxRooms ?? 5} rooms used
					</p>
				</div>
				<Link to="/dashboard/rooms/new">
					<Button>New Room</Button>
				</Link>
			</div>

			{rooms.length === 0 ? (
				<div className="text-center py-12 border border-dashed border-zinc-300 dark:border-zinc-600 rounded-lg">
					<p className="text-zinc-500">No rooms yet</p>
					<Link to="/dashboard/rooms/new" className="mt-2 inline-block">
						<Button>Create your first room</Button>
					</Link>
				</div>
			) : (
				<div className="grid gap-3">
					{rooms.map((room) => (
				<div
						key={room.id}
						className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-zinc-900 ring-1 ring-zinc-200/50 dark:ring-zinc-800/50 shadow-sm"
					>
							<div>
								<h3 className="font-medium">{room.name}</h3>
								<p className="text-sm text-zinc-500">/{room.slug}</p>
							</div>
							<div className="flex items-center gap-3">
								<span
									className={`text-xs px-2 py-1 rounded ${
										room.isActive
											? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
											: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
									}`}
								>
									{room.isActive ? 'Active' : 'Inactive'}
								</span>
								<a href={`/${room.slug}`} target="_blank" rel="noopener">
									<Button displayType="secondary" className="text-xs">
										Open
									</Button>
								</a>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	)
}
