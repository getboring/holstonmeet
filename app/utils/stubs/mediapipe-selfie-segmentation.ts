// Stub for @mediapipe/selfie_segmentation
// The actual package is loaded at runtime via dynamic import.
// This stub exists to satisfy the build-time import resolution from @tensorflow-models/body-segmentation.

export class SelfieSegmentation {
	static instance: any = null

	static async create(options: any): Promise<any> {
		// Load the real package at runtime
		const mod = await import('@mediapipe/selfie_segmentation')
		return (mod as any).SelfieSegmentation.create(options)
	}
}

export default SelfieSegmentation
