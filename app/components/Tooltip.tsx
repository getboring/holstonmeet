import * as RadixTooltip from '@radix-ui/react-tooltip'
import type { FC, ReactNode } from 'react'

interface TooltipProps {
	open?: boolean
	onOpenChange?: (open: boolean) => void
	content?: ReactNode
	children: ReactNode
}

export const Tooltip: FC<TooltipProps> = ({
	children,
	content,
	open,
	onOpenChange,
}) => {
	if (content === undefined) return <>{children}</>

	return (
		<RadixTooltip.Provider delayDuration={300}>
			<RadixTooltip.Root open={open} onOpenChange={onOpenChange}>
				<RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
				<RadixTooltip.Portal>
					<RadixTooltip.Content
						className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-medium px-2.5 py-1.5 rounded-lg shadow-lg"
						sideOffset={6}
					>
						{content}
						<RadixTooltip.Arrow className="fill-zinc-900 dark:fill-zinc-100" />
					</RadixTooltip.Content>
				</RadixTooltip.Portal>
			</RadixTooltip.Root>
		</RadixTooltip.Provider>
	)
}
