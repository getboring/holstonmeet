import * as RadixSwitch from '@radix-ui/react-switch'
import type { FC } from 'react'
import { cn } from '~/utils/style'

export const Toggle: FC<RadixSwitch.SwitchProps> = ({ className, ...rest }) => (
	<RadixSwitch.Root
		className={cn(
			'w-11',
			'h-6',
			'bg-zinc-200 dark:bg-zinc-700',
			'rounded-full',
			'relative',
			'shadow-inner',
			'data-[state=checked]:bg-indigo-600',
			'transition-colors duration-200',
			'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900',
			className
		)}
		{...rest}
	>
		<RadixSwitch.Thumb
			className={cn(
				'block',
				'w-5',
				'h-5',
				'bg-white',
				'rounded-full',
				'shadow-xs',
				'transition-transform duration-200',
				'translate-x-[2px]',
				'data-[state=checked]:translate-x-[22px]'
			)}
		/>
	</RadixSwitch.Root>
)
