import { reactRouter } from '@react-router/dev/vite'
import { cloudflare } from '@cloudflare/vite-plugin'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
	plugins: [
		cloudflare(),
		reactRouter(),
		tailwindcss(),
		{
			name: 'stub-mediapipe',
			config: () => ({
				resolve: {
					alias: {
						'@mediapipe/selfie_segmentation': path.resolve(
							'./app/utils/stubs/mediapipe-selfie-segmentation.ts'
						),
					},
				},
			}),
		},
	],
	resolve: {
		tsconfigPaths: true,
	},
	build: {
		outDir: 'build',
	},
	optimizeDeps: {
		exclude: ['@mediapipe/selfie_segmentation'],
	},
	ssr: {
		noExternal: [
			'@mediapipe/selfie_segmentation',
			'@tensorflow-models/body-segmentation',
			'@tensorflow/tfjs-core',
			'@tensorflow/tfjs-backend-webgl',
		],
	},
})
