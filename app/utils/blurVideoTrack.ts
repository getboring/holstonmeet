import { Observable } from 'rxjs'

// This module dynamically imports @tensorflow-models/body-segmentation
// and @mediapipe/selfie_segmentation to avoid ESM compatibility issues at build time.
// The mediapipe package has a broken ESM export (SelfieSegmentation is not exported).

let _segmenterPromise: Promise<any> | null = null

async function ensureSegmenter() {
	if (_segmenterPromise) return _segmenterPromise
	_segmenterPromise = (async () => {
		const bodySegmentation = await import(
			'@tensorflow-models/body-segmentation'
		)
		await import('@tensorflow/tfjs-backend-webgl')

		const segmenter = await bodySegmentation.createSegmenter(
			bodySegmentation.SupportedModels.MediaPipeSelfieSegmentation as any,
			{
				runtime: 'mediapipe',
				modelType: 'general',
				solutionPath:
					'https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation',
			} as any
		)
		return { bodySegmentation, segmenter }
	})()
	return _segmenterPromise
}

export default function blurVideoTrack(
	originalVideoStreamTrack: MediaStreamTrack
): Observable<MediaStreamTrack> {
	return new Observable((subscriber) => {
		;(async () => {
			const { bodySegmentation, segmenter } = await ensureSegmenter()

			const { height: h = 0, width: w = 0 } =
				originalVideoStreamTrack.getSettings()

			const video = document.createElement('video')
			video.height = h
			video.width = w
			video.muted = true
			video.setAttribute('playsinline', '')
			const loaded = new Promise((res) =>
				video.addEventListener('loadedmetadata', res, { once: true })
			)
			const mediaStream = new MediaStream()
			mediaStream.addTrack(originalVideoStreamTrack)
			video.srcObject = mediaStream
			video.play()
			await loaded

			const canvas = document.createElement('canvas')
			const _contex = canvas.getContext('2d')

			canvas.height = h
			canvas.width = w

			async function drawBlur() {
				const segmentation = await segmenter.segmentPeople(video)
				const foregroundThreshold = 0.6
				const backgroundBlurAmount = 12
				const edgeBlurAmount = 3
				const flipHorizontal = false

				await bodySegmentation.drawBokehEffect(
					canvas,
					video,
					segmentation,
					foregroundThreshold,
					backgroundBlurAmount,
					edgeBlurAmount,
					flipHorizontal
				)
			}

			const blurredTrack = canvas.captureStream().getVideoTracks()[0]

			let t = -1
			async function tick() {
				await drawBlur()
				t = window.setTimeout(tick, 1000 / 30)
			}

			await drawBlur()
			tick()

			originalVideoStreamTrack.addEventListener('ended', (e) => {
				blurredTrack.stop()
				blurredTrack.dispatchEvent(e)
			})

			subscriber.add(() => {
				clearTimeout(t)
			})
			subscriber.next(blurredTrack)
		})()
	})
}
