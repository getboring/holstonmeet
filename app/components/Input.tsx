import { forwardRef } from 'react'
import { cn } from '~/utils/style'

export const Input = forwardRef<
	HTMLInputElement,
	JSX.IntrinsicElements['input']
>(({ className, ...rest }, ref) => (
	<input
		className={cn(
			'w-full',
			'rounded-lg',
			'border',
			'border-zinc-300 dark:border-zinc-600',
			'text-zinc-900 dark:text-zinc-100',
			'bg-white dark:bg-zinc-800',
			'px-3',
			'py-2',
			'text-sm',
			'placeholder:text-zinc-400 dark:placeholder:text-zinc-500',
			'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
			'transition-shadow duration-150',
			className
		)}
		{...rest}
		ref={ref}
	/>
))

Input.displayName = 'Input'
