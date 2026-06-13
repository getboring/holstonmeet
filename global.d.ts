declare module '*.mp3' {
	const url: string
	export default url
}

declare module '*.css' {
	const url: string
	export default url
}

declare module 'virtual:react-router/server-build' {
	const build: unknown
	export default build
}

interface ImportMetaEnv {
	readonly MODE: string
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}
