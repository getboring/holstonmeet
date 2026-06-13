import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Button } from './Button'

export interface EnsurePermissionsProps {
	children?: ReactNode
	onMicSelected: (deviceId: string) => void
	onCameraSelected: (deviceId: string) => void
}

type PermissionState = 'denied' | 'granted' | 'prompt' | 'unable-to-determine'

async function getExistingPermissionState(): Promise<PermissionState> {
	try {
		const query = await navigator.permissions.query({
			name: 'microphone' as any,
		})
		return query.state
	} catch (error) {
		return 'unable-to-determine'
	}
}

export function EnsurePermissions(props: EnsurePermissionsProps) {
	const [permissionState, setPermissionState] =
		useState<PermissionState | null>(null)

	const mountedRef = useRef(true)

	useEffect(() => {
		getExistingPermissionState().then((result) => {
			if (mountedRef.current) setPermissionState(result)
		})
		return () => {
			mountedRef.current = false
		}
	}, [])

	if (permissionState === null) return null

	if (permissionState === 'denied') {
		return (
			<div className="grid items-center h-full bg-linear-to-br from-indigo-50 via-white to-violet-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-indigo-950">
				<div className="mx-auto space-y-3 max-w-80 text-center">
					<h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
						Permission denied
					</h1>
					<p className="text-sm text-zinc-500">
						You will need to go into your browser settings and manually
						re-enable permission.
					</p>
				</div>
			</div>
		)
	}

	if (permissionState === 'prompt') {
		return (
			<div className="grid items-center h-full bg-linear-to-br from-indigo-50 via-white to-violet-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-indigo-950">
				<div className="mx-auto max-w-80 text-center space-y-6">
					<div className="space-y-2">
						<h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
							Camera & Mic Access
						</h2>
						<p className="text-sm text-zinc-500">
							In order to use HolstonMeet, you will need to grant permission to
							your camera and microphone. You will be prompted for access.
						</p>
					</div>
					<Button
						onClick={() => {
							navigator.mediaDevices
								.getUserMedia({
									video: true,
									audio: true,
								})
								.then((ms) => {
									if (mountedRef.current) setPermissionState('granted')
									const micId = ms.getAudioTracks()[0].getSettings().deviceId
									if (micId) props.onMicSelected(micId)
									const cameraId = ms.getVideoTracks()[0].getSettings().deviceId
									if (cameraId) props.onCameraSelected(cameraId)
									ms.getTracks().forEach((t) => t.stop())
								})
								.catch(() => {
									if (mountedRef.current) setPermissionState('denied')
								})
						}}
					>
						Allow access
					</Button>
				</div>
			</div>
		)
	}

	return props.children
}
