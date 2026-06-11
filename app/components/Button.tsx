import type { LinkProps } from '@remix-run/react'
import { Link } from '@remix-run/react'
import { forwardRef } from 'react'
import { cn } from '~/utils/style'

const displayTypeMap = {
	primary: [
		'text-white',
		'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800',
		'shadow-sm hover:shadow-md',
	],
	secondary: [
		'text-zinc-700 dark:text-zinc-200',
		'bg-white hover:bg-zinc-50 dark:bg-zinc-800 dark:hover:bg-zinc-700',
		'border border-zinc-200 dark:border-zinc-700',
		'shadow-sm',
	],
	ghost: [
		'text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white',
		'bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800',
	],
	danger: [
		'text-white',
		'bg-red-600 hover:bg-red-700 active:bg-red-800',
		'shadow-sm',
	],
}

export type ButtonProps = Omit<JSX.IntrinsicElements['button'], 'ref'> & {
	displayType?: keyof typeof displayTypeMap
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, displayType = 'primary', disabled, onClick, ...rest }, ref) => (
		<button
			className={cn(
				'rounded-lg',
				'font-medium',
				'text-sm',
				'py-2 px-4',
				'transition-all duration-150',
				'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900',
				disabled && 'cursor-not-allowed opacity-50',
				displayTypeMap[displayType].join(' '),
				className
			)}
			aria-disabled={disabled}
			onClick={disabled ? (e) => e.preventDefault() : onClick}
			{...rest}
			ref={ref}
		/>
	)
)

Button.displayName = 'Button'

export const ButtonLink = forwardRef<
	HTMLAnchorElement,
	LinkProps & {
		displayType?: keyof typeof displayTypeMap
	}
>(({ className, displayType = 'primary', ...rest }, ref) => (
	// eslint-disable-next-line jsx-a11y/anchor-has-content
	<Link
		className={cn(
			'inline-flex items-center justify-center',
			'rounded-lg',
			'font-medium',
			'text-sm',
			'py-2 px-4',
			'transition-all duration-150',
			'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900',
			displayTypeMap[displayType].join(' '),
			className
		)}
		{...rest}
		ref={ref}
	/>
))

ButtonLink.displayName = 'ButtonLink'
