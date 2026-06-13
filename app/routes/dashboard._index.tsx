import type { LoaderFunctionArgs } from 'react-router'
import { Link, useLoaderData } from 'react-router'
import { desc, eq, count } from 'drizzle-orm'
import { Meetings, Rooms, getDb } from 'schema'
import { requireUser, getOrg } from '~/utils/auth.server'
import { Button } from '~/components/Button'

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
	const user = await requireUser(request, context.cloudflare.env)
	const org = await getOrg(request, context.cloudflare.env)
	const db = getDb(context)

	let roomCount = 0
	let recentMeetings: Array<{
		id: string
		created: string
		peakUserCount: number
		ended: string | null
	}> = []

	if (db && org) {
		const [roomCountResult] = await db
			.select({ count: count() })
			.from(Rooms)
			.where(eq(Rooms.orgId, org.id))
		roomCount = roomCountResult?.count ?? 0

		recentMeetings = await db
			.select({
				id: Meetings.id,
				created: Meetings.created,
				peakUserCount: Meetings.peakUserCount,
				ended: Meetings.ended,
			})
			.from(Meetings)
			.orderBy(desc(Meetings.created))
			.limit(10)
	}

	return ({ user, org, roomCount, recentMeetings })
}

export default function DashboardIndex() {
	const { user, org, roomCount, recentMeetings } =
		useLoaderData<typeof loader>()

	return (
		<div className="max-w-4xl mx-auto space-y-8">
			<div>
				<h1 className="text-2xl font-bold">Welcome back, {user.name}</h1>
				<p className="text-zinc-500 mt-1">
					{org
						? `${org.name} — ${org.plan} plan`
						: 'Set up your organization to get started'}
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div className="p-5 rounded-xl bg-white dark:bg-zinc-900 ring-1 ring-zinc-200/50 dark:ring-zinc-800/50 shadow-xs">
					<p className="text-sm text-zinc-500">Rooms</p>
					<p className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">{roomCount}</p>
					<p className="text-xs text-zinc-400 mt-0.5">
						{org ? `of ${org.maxRooms} max` : ''}
					</p>
				</div>
				<div className="p-5 rounded-xl bg-white dark:bg-zinc-900 ring-1 ring-zinc-200/50 dark:ring-zinc-800/50 shadow-xs">
					<p className="text-sm text-zinc-500">Max Participants</p>
					<p className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">
						{org?.maxParticipantsPerRoom ?? 10}
					</p>
					<p className="text-xs text-zinc-400 mt-0.5">per room</p>
				</div>
				<div className="p-5 rounded-xl bg-white dark:bg-zinc-900 ring-1 ring-zinc-200/50 dark:ring-zinc-800/50 shadow-xs">
					<p className="text-sm text-zinc-500">Plan</p>
					<p className="text-2xl font-bold text-zinc-900 dark:text-white mt-1 capitalize">
						{org?.plan ?? 'free'}
					</p>
				</div>
			</div>

			<div className="flex gap-4">
				<Link to="/dashboard/rooms/new">
					<Button>New Room</Button>
				</Link>
				<Link to="/dashboard/rooms">
					<Button displayType="secondary">View All Rooms</Button>
				</Link>
			</div>

			<div>
				<h2 className="text-lg font-semibold mb-4">Recent Meetings</h2>
				{recentMeetings.length === 0 ? (
					<p className="text-zinc-500 text-sm">
						No meetings yet. Create a room to get started.
					</p>
				) : (
					<div className="rounded-xl bg-white dark:bg-zinc-900 ring-1 ring-zinc-200/50 dark:ring-zinc-800/50 shadow-xs overflow-hidden">
						<table className="w-full text-sm">
							<thead className="bg-zinc-50 dark:bg-zinc-800">
								<tr>
									<th className="text-left p-3 font-medium">Meeting ID</th>
									<th className="text-left p-3 font-medium">Created</th>
									<th className="text-left p-3 font-medium">Peak Users</th>
									<th className="text-left p-3 font-medium">Status</th>
								</tr>
							</thead>
							<tbody>
								{recentMeetings.map((meeting) => (
									<tr
										key={meeting.id}
										className="border-t border-zinc-200 dark:border-zinc-700"
									>
										<td className="p-3 font-mono text-xs">
											{meeting.id.slice(0, 8)}...
										</td>
										<td className="p-3 text-zinc-500">
											{new Date(meeting.created).toLocaleDateString()}
										</td>
										<td className="p-3">{meeting.peakUserCount}</td>
										<td className="p-3">
											{meeting.ended ? (
												<span className="text-zinc-400">Ended</span>
											) : (
												<span className="text-green-600">Active</span>
											)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</div>
	)
}
