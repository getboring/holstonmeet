import * as RadixDialog from '@radix-ui/react-dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { forwardRef } from 'react'
import { cn, style } from '~/utils/style'

export const DialogOverlay = style(
	RadixDialog.DialogOverlay,
	'fixed inset-0 bg-black/40 backdrop-blur-sm'
)

export const DialogContent = forwardRef<
	HTMLDivElement,
	RadixDialog.DialogContentProps
>((props, ref) => (
	<RadixDialog.DialogContent
		ref={ref}
		className={cn(
			'fixed',
			'rounded-2xl',
			'top-1/2',
			'left-1/2',
			'-translate-x-1/2',
			'-translate-y-1/2',
			'min-w-[min(400px,95vw)]',
			'max-w-[95vw]',
			'max-h-[85vh]',
			'overflow-y-auto',
			'p-6',
			'bg-white dark:bg-zinc-900',
			'shadow-2xl shadow-black/10 dark:shadow-black/40',
			'ring-1 ring-zinc-200/50 dark:ring-zinc-700/50'
		)}
	>
		{props.children}
		<DialogClose />
	</RadixDialog.DialogContent>
))

DialogContent.displayName = 'DialogContent'

export const DialogTitle = style(
	RadixDialog.Title,
	'text-zinc-900 dark:text-white font-semibold text-xl'
)

const DialogClose = () => (
	<RadixDialog.Close className="absolute top-3 right-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full h-8 w-8 flex items-center justify-center transition-colors">
		<VisuallyHidden>Close</VisuallyHidden>
		<span className="text-zinc-400 dark:text-zinc-500 text-lg" aria-hidden>
			x
		</span>
	</RadixDialog.Close>
)

export const Dialog = RadixDialog.Root
export const Trigger = RadixDialog.Trigger
export const Portal = ({
	container: _container,
	...rest
}: React.ComponentProps<typeof RadixDialog.Portal>) => (
	<RadixDialog.Portal
		container={
			typeof document !== 'undefined'
				? document.getElementById('root')
				: undefined
		}
		{...rest}
	/>
)

export const Description = style(
	RadixDialog.Description,
	'text-sm text-zinc-500 dark:text-zinc-400'
)
