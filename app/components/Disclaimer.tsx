import type { FC } from 'react'
import { cn } from '~/utils/style'

interface DisclaimerProps {
	className?: string
}

export const Disclaimer: FC<DisclaimerProps> = ({ className }) => {
	return (
		<p
			className={cn(
				'text-xs text-zinc-400 dark:text-zinc-500 max-w-prose',
				className
			)}
		>
			HolstonMeet by{' '}
			<a className="underline" href="https://holstonplatforms.com">
				Holston Platforms
			</a>
			. Secure, real-time video meetings powered by Cloudflare.
		</p>
	)
}
