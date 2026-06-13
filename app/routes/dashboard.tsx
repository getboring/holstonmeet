import type { LoaderFunctionArgs } from 'react-router'
import { Link, Outlet, useLoaderData } from 'react-router'
import { requireUser, getOrg } from '~/utils/auth.server'
import { Button } from '~/components/Button'

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
	const user = await requireUser(request, context.cloudflare.env)
	const org = await getOrg(request, context.cloudflare.env)
	return ({ user, org })
}

export default function DashboardLayout() {
	const { user, org } = useLoaderData<typeof loader>()

	return (
		<div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950">
			<header className="flex items-center justify-between px-6 py-3 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-200/50 dark:border-zinc-800/50 sticky top-0 z-50">
				<div className="flex items-center gap-4">
					<Link to="/dashboard" className="text-lg font-bold">
						📹 HolstonMeet
					</Link>
					{org && (
						<span className="text-sm text-zinc-500">
							{org.name}
						</span>
					)}
				</div>
				<div className="flex items-center gap-3">
					<span className="text-sm text-zinc-500 hidden sm:inline">{user.name}</span>
					<nav className="flex items-center gap-2">
						<Link to="/dashboard/rooms">
							<Button displayType="ghost" className="text-xs">
								Rooms
							</Button>
						</Link>
						<Link to="/dashboard/settings">
							<Button displayType="ghost" className="text-xs">
								Settings
							</Button>
						</Link>
					</nav>
					<form method="post" action="/logout">
						<Button displayType="ghost" className="text-xs text-zinc-400 hover:text-red-600">
							Logout
						</Button>
					</form>
				</div>
			</header>
			<main className="flex-1 overflow-auto p-6">
				<Outlet />
			</main>
		</div>
	)
}
