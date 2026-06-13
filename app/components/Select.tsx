import * as RadixSelect from '@radix-ui/react-select'
import type { ReactNode } from 'react'
import { forwardRef } from 'react'
import { cn } from '~/utils/style'
import { Icon } from './Icon/Icon'
import { Tooltip } from './Tooltip'

export const Select = forwardRef<
	HTMLButtonElement,
	RadixSelect.SelectProps & {
		id?: string
		placeholder?: string
		className?: string
		children: ReactNode
		tooltipContent?: string
	}
>(
	(
		{ id, className, placeholder, children, disabled, tooltipContent, ...rest },
		ref
	) => {
		return (
			<RadixSelect.Root disabled={disabled} {...rest}>
				<Tooltip content={tooltipContent}>
					<RadixSelect.Trigger
						ref={ref}
						id={id}
						className={cn(
							'max-w-full inline-flex items-center justify-center px-3 text-sm leading-none h-9 gap-1.5 rounded-lg',
							'bg-white text-zinc-800 border border-zinc-300',
							'dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-600',
							'shadow-xs',
							'focus:outline-none focus:ring-2 focus:ring-indigo-500',
							'transition-shadow duration-150',
							disabled && 'opacity-50 cursor-not-allowed',
							className
						)}
					>
						<span className="whitespace-nowrap overflow-hidden text-ellipsis">
							<RadixSelect.Value placeholder={placeholder}></RadixSelect.Value>
						</span>
						<RadixSelect.Icon className="text-zinc-400">
							<Icon type="ChevronDownIcon" />
						</RadixSelect.Icon>
					</RadixSelect.Trigger>
				</Tooltip>
				<RadixSelect.Portal>
					<RadixSelect.Content
						className="overflow-hidden bg-white dark:bg-zinc-800 shadow-xl shadow-black/10 dark:shadow-black/30 rounded-xl ring-1 ring-zinc-200/50 dark:ring-zinc-700/50"
						position="popper"
						sideOffset={4}
					>
						<RadixSelect.ScrollUpButton className="flex items-center justify-center h-6 text-zinc-400 cursor-default">
							<Icon type="ChevronUpIcon" />
						</RadixSelect.ScrollUpButton>
						<RadixSelect.Viewport className="py-1.5 px-1.5">
							{children}
						</RadixSelect.Viewport>
						<RadixSelect.ScrollDownButton className="flex items-center justify-center h-6 text-zinc-400 cursor-default">
							<Icon type="ChevronDownIcon" />
						</RadixSelect.ScrollDownButton>
					</RadixSelect.Content>
				</RadixSelect.Portal>
			</RadixSelect.Root>
		)
	}
)

Select.displayName = 'Select'

export const Option = forwardRef<HTMLDivElement, RadixSelect.SelectItemProps>(
	({ children, className, ...props }, forwardedRef) => (
		<RadixSelect.Item
			className={cn(
				'text-sm leading-none text-zinc-700 dark:text-zinc-200 flex items-center min-h-[2rem] pl-8 pr-3 relative select-none rounded-lg',
				'data-[disabled]:pointer-events-none data-[disabled]:text-zinc-400',
				'data-[highlighted]:outline-none',
				'data-[highlighted]:bg-indigo-50 data-[highlighted]:text-indigo-700',
				'dark:data-[highlighted]:bg-indigo-900/50 dark:data-[highlighted]:text-indigo-300',
				'transition-colors',
				className
			)}
			{...props}
			ref={forwardedRef}
		>
			<RadixSelect.ItemText>{children}</RadixSelect.ItemText>
			<RadixSelect.ItemIndicator className="absolute left-2 w-5 inline-flex items-center justify-center text-indigo-600 dark:text-indigo-400">
				<Icon type="CheckIcon" />
			</RadixSelect.ItemIndicator>
		</RadixSelect.Item>
	)
)

Option.displayName = 'Option'
