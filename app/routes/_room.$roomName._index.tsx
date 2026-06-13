import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import type { LoaderFunctionArgs } from 'react-router'
import { useNavigate, useParams, useSearchParams } from 'react-router'
import { useObservableAsValue } from 'partytracks/react'
import invariant from 'tiny-invariant'
import { AudioIndicator } from '~/components/AudioIndicator'
import { Button } from '~/components/Button'
import { CameraButton } from '~/components/CameraButton'
import { CopyButton } from '~/components/CopyButton'
import { Disclaimer } from '~/components/Disclaimer'
import { Icon } from '~/components/Icon/Icon'
import { MicButton } from '~/components/MicButton'

import { SelfView } from '~/components/SelfView'
import { SettingsButton } from '~/components/SettingsDialog'
import { Spinner } from '~/components/Spinner'
import { Tooltip } from '~/components/Tooltip'
import { useRoomContext } from '~/hooks/useRoomContext'
import { useRoomUrl } from '~/hooks/useRoomUrl'
import getUsername from '~/utils/getUsername.server'

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
	const username = await getUsername(request, context.cloudflare.env)
	invariant(username)
	return ({ username, callsAppId: context.cloudflare.env.CALLS_APP_ID })
}

let refreshCheckDone = false
function trackRefreshes() {
	if (refreshCheckDone) return
	if (typeof document === 'undefined') return

	const key = `previously loaded`
	const initialValue = sessionStorage.getItem(key)
	const refreshed = initialValue !== null
	sessionStorage.setItem(key, Date.now().toString())

	if (refreshed) {
		fetch(`/api/reportRefresh`, {
			method: 'POST',
		})
	}

	refreshCheckDone = true
}

export default function Lobby() {
	const { roomName } = useParams()
	const navigate = useNavigate()
	const { setJoined, userMedia, room, partyTracks } = useRoomContext()
	const { videoStreamTrack, audioStreamTrack, audioEnabled } = userMedia
	const session = useObservableAsValue(partyTracks.session$)
	const sessionError = useObservableAsValue(partyTracks.sessionError$)
	trackRefreshes()

	const joinedUsers = new Set(
		room.otherUsers.filter((u) => u.tracks.audio).map((u) => u.name)
	).size

	const roomUrl = useRoomUrl()

	const [params] = useSearchParams()

	return (
		<div className="flex flex-col items-center justify-center h-full p-4 bg-linear-to-br from-indigo-50 via-white to-violet-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-indigo-950">
			<div className="flex-1"></div>
			<div className="space-y-6 w-full max-w-md">
				<div className="text-center">
					<h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
						{roomName}
					</h1>
					<p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
						{`${joinedUsers} ${
							joinedUsers === 1 ? 'user' : 'users'
						} in the room.`}{' '}
					</p>
				</div>
				<div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-indigo-500/10 ring-1 ring-zinc-200/50 dark:ring-zinc-700/50">
					<SelfView
						className="aspect-[4/3] w-full"
						videoTrack={videoStreamTrack}
					/>

					<div className="absolute left-3 top-3">
						{!sessionError && !session?.sessionId ? (
							<Spinner className="text-zinc-100" />
						) : (
							audioStreamTrack && (
								<>
									{audioEnabled ? (
										<AudioIndicator audioTrack={audioStreamTrack} />
									) : (
										<Tooltip content="Mic is turned off">
											<div className="text-white indication-shadow">
												<Icon type="micOff" />
												<VisuallyHidden>Mic is turned off</VisuallyHidden>
											</div>
										</Tooltip>
									)}
								</>
							)
						)}
					</div>
				</div>
				{sessionError && (
					<div className="p-3 rounded-lg text-sm bg-red-50 text-red-700 ring-1 ring-red-200 dark:bg-red-900/30 dark:text-red-300 dark:ring-red-800">
						{sessionError}
					</div>
				)}
				{(userMedia.audioUnavailableReason ||
					userMedia.videoUnavailableReason) && (
					<div className="p-3 rounded-lg text-sm bg-zinc-50 text-zinc-600 ring-1 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700">
						{userMedia.audioUnavailableReason === 'NotAllowedError' &&
							userMedia.videoUnavailableReason === undefined && (
								<p>Mic permission was denied.</p>
							)}
						{userMedia.videoUnavailableReason === 'NotAllowedError' &&
							userMedia.audioUnavailableReason === undefined && (
								<p>Camera permission was denied.</p>
							)}
						{userMedia.audioUnavailableReason === 'NotAllowedError' &&
							userMedia.videoUnavailableReason === 'NotAllowedError' && (
								<p>Mic and camera permissions were denied.</p>
							)}
						{userMedia.audioUnavailableReason === 'NotAllowedError' && (
							<p>
								Enable permission
								{userMedia.audioUnavailableReason &&
								userMedia.videoUnavailableReason
									? 's'
									: ''}{' '}
								and reload the page to join.
							</p>
						)}
						{userMedia.audioUnavailableReason === 'DevicesExhaustedError' && (
							<p>No working microphone found.</p>
						)}
						{userMedia.videoUnavailableReason === 'DevicesExhaustedError' && (
							<p>No working webcam found.</p>
						)}
						{userMedia.audioUnavailableReason === 'UnknownError' && (
							<p>Unknown microphone error.</p>
						)}
						{userMedia.videoUnavailableReason === 'UnknownError' && (
							<p>Unknown webcam error.</p>
						)}
					</div>
				)}
				<div className="flex gap-3 justify-center">
					<Button
						onClick={() => {
							setJoined(true)
							navigate(
								'room' + (params.size > 0 ? '?' + params.toString() : '')
							)
						}}
						disabled={!session?.sessionId}
						className="px-8"
					>
						Join Now
					</Button>
					<MicButton />
					<CameraButton />
					<SettingsButton />
					<Tooltip content="Copy URL">
						<CopyButton contentValue={roomUrl}></CopyButton>
					</Tooltip>
				</div>
			</div>
			<div className="flex flex-col justify-end flex-1">
				<Disclaimer className="pt-6" />
			</div>
		</div>
	)
}
