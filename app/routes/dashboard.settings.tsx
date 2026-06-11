import type { LoaderFunctionArgs } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'
import { useLoaderData } from '@remix-run/react'
import { requireUser, getOrg } from '~/utils/auth.server'

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
	const user = await requireUser(request, context.env)
	const org = await getOrg(request, context.env)
	return json({ user, org })
}

export default function Settings() {
	const { user, org } = useLoaderData<typeof loader>()

	return (
		<div className="max-w-2xl mx-auto space-y-8">
			<div>
				<h1 className="text-2xl font-bold">Settings</h1>
				<p className="text-zinc-500 text-sm mt-1">
					Manage your account and organization settings.
				</p>
			</div>

			<div className="space-y-6">
				<section className="p-5 rounded-xl bg-white dark:bg-zinc-900 ring-1 ring-zinc-200/50 dark:ring-zinc-800/50 shadow-sm">
					<h2 className="font-semibold mb-4 text-zinc-900 dark:text-white">Account</h2>
					<div className="grid grid-cols-2 gap-2 text-sm">
						<span className="text-zinc-500">Name</span>
						<span>{user.name}</span>
						<span className="text-zinc-500">Email</span>
						<span>{user.email}</span>
						<span className="text-zinc-500">Role</span>
						<span className="capitalize">{user.role}</span>
					</div>
				</section>

				{org && (
				<section className="p-5 rounded-xl bg-white dark:bg-zinc-900 ring-1 ring-zinc-200/50 dark:ring-zinc-800/50 shadow-sm">
					<h2 className="font-semibold mb-4 text-zinc-900 dark:text-white">Organization</h2>
						<div className="grid grid-cols-2 gap-2 text-sm">
							<span className="text-zinc-500">Name</span>
							<span>{org.name}</span>
							<span className="text-zinc-500">Slug</span>
							<span className="font-mono">{org.slug}</span>
							<span className="text-zinc-500">Plan</span>
							<span className="capitalize">{org.plan}</span>
							<span className="text-zinc-500">Max Rooms</span>
							<span>{org.maxRooms}</span>
							<span className="text-zinc-500">Max Participants</span>
							<span>{org.maxParticipantsPerRoom} per room</span>
						</div>
					</section>
				)}
			</div>
		</div>
	)
}
