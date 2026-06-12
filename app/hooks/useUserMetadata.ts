import { useOutletContext } from '@remix-run/react'
import { useEffect, useState } from 'react'

interface UserMetadata {
	displayName: string
	firstName?: string
	lastName?: string
	timeZone?: string
	photob64?: string
}

export function useUserMetadata(email: string) {
	const { userDirectoryUrl } = useOutletContext<{ userDirectoryUrl?: string }>()
	const [data, setData] = useState<UserMetadata>({ displayName: email })

	useEffect(() => {
		if (!userDirectoryUrl) return
		const controller = new AbortController()

		fetch(`${userDirectoryUrl}?email=${encodeURIComponent(email)}`, {
			credentials: 'include',
			signal: controller.signal,
		})
			.then((r) => {
				if (!r.headers.get('Content-Type')?.startsWith('application/json'))
					return null
				return r.json() as Promise<UserMetadata>
			})
			.then((parsed: UserMetadata | null) => {
				if (parsed) {
					setData({
						...parsed,
						displayName: `${parsed.firstName} ${parsed.lastName}`,
					})
				}
			})
			.catch(() => {})

		return () => controller.abort()
	}, [userDirectoryUrl, email])

	return data
}
