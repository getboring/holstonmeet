import * as RadixCheckbox from '@radix-ui/react-checkbox'
import type { FC } from 'react'
import { cn } from '~/utils/style'
import { Icon } from './Icon/Icon'

export const Checkbox: FC<RadixCheckbox.CheckboxProps> = ({
	className,
	...rest
}) => (
	<RadixCheckbox.Root
		className={cn(
			'w-5 h-5',
			'rounded-md',
			'border',
			'border-zinc-300 dark:border-zinc-600',
			'bg-white dark:bg-zinc-800',
			'flex items-center justify-center',
			'shadow-sm',
			'hover:border-indigo-400 dark:hover:border-indigo-500',
			'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900',
			'transition-colors duration-150',
			'data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600',
			className
		)}
		{...rest}
	>
		<RadixCheckbox.Indicator className="text-white">
			<Icon type="CheckIcon" className="h-3.5 w-3.5" />
		</RadixCheckbox.Indicator>
	</RadixCheckbox.Root>
)
