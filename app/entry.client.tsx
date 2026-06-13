import { HydratedRouter } from 'react-router/dom'
import { startTransition } from 'react'
import { hydrateRoot } from 'react-dom/client'

startTransition(() => {
	hydrateRoot(document, <HydratedRouter />)
})
