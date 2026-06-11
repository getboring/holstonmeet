import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { forwardRef } from 'react'
import { cn } from '~/utils/style'

const Arrow = forwardRef<SVGSVGElement, DropdownMenu.DropdownMenuArrowProps>(
	({ className, ...rest }, ref) => (
		<DropdownMenu.Arrow
			ref={ref}
			className={cn('fill-white dark:fill-zinc-800', className)}
			{...rest}
		/>
	)
)

Arrow.displayName = 'Arrow'

const Content = forwardRef<
	HTMLDivElement,
	DropdownMenu.DropdownMenuContentProps
>(({ className, ...rest }, ref) => (
	<DropdownMenu.Content
		ref={ref}
		className={cn(
			'bg-white',
			'dark:bg-zinc-800',
			'rounded-xl',
			'p-1.5',
			'space-y-0.5',
			'shadow-xl shadow-black/10 dark:shadow-black/30',
			'ring-1 ring-zinc-200/50 dark:ring-zinc-700/50',
			'will-change-[opacity,transform]',
			'data-[side=top]:animate-slideDownAndFade',
			'data-[side=right]:animate-slideLeftAndFade',
			'data-[side=bottom]:animate-slideUpAndFade',
			'data-[side=left]:animate-slideRightAndFade',
			className
		)}
		{...rest}
	/>
))

Content.displayName = 'Content'

const Item = forwardRef<HTMLDivElement, DropdownMenu.DropdownMenuItemProps>(
	({ className, ...rest }, ref) => (
		<DropdownMenu.Item
			ref={ref}
			className={cn(
				'group',
				'text-sm',
				'leading-none',
				'text-zinc-700',
				'dark:text-zinc-200',
				'rounded-lg',
				'flex',
				'items-center',
				'h-9',
				'relative',
				'px-3',
				'select-none',
				'outline-none',
				'transition-colors',
				'data-[disabled]:text-zinc-400',
				'data-[disabled]:cursor-not-allowed',
				'dark:data-[disabled]:text-zinc-500',
				'data-[highlighted]:bg-indigo-50',
				'data-[highlighted]:text-indigo-700',
				'dark:data-[highlighted]:bg-indigo-900/50',
				'dark:data-[highlighted]:text-indigo-300',
				className
			)}
			{...rest}
		/>
	)
)

Item.displayName = 'Item'

export default {
	...DropdownMenu,
	Arrow,
	Content,
	Item,
}
