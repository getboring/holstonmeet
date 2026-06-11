/**
 * Result type — the Boring Stack convention.
 * Business logic never throws. Returns Result<T> instead.
 *
 * Usage:
 *   return ok(contact)
 *   return err('NOT_FOUND', 'Contact not found')
 */

export type Result<T> =
	| { success: true; data: T }
	| { success: false; error: AppError }

export interface AppError {
	code: string
	message: string
	details?: Record<string, unknown>
}

export function ok<T>(data: T): Result<T> {
	return { success: true, data }
}

export function err<T>(
	code: string,
	message: string,
	details?: Record<string, unknown>
): Result<T> {
	return { success: false, error: { code, message, details } }
}

export const ErrorCodes = {
	NOT_FOUND: 'NOT_FOUND',
	VALIDATION_ERROR: 'VALIDATION_ERROR',
	UNAUTHORIZED: 'UNAUTHORIZED',
	FORBIDDEN: 'FORBIDDEN',
	CONFLICT: 'CONFLICT',
	INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const

/**
 * Map a Result<T> to an HTTP Response for Remix loaders/actions.
 */
export function resultToJson<T>(
	result: Result<T>,
	successStatus = 200
): Response {
	if (result.success) {
		return new Response(JSON.stringify({ success: true, data: result.data }), {
			status: successStatus,
			headers: { 'Content-Type': 'application/json' },
		})
	}

	const statusMap: Record<string, number> = {
		NOT_FOUND: 404,
		VALIDATION_ERROR: 400,
		UNAUTHORIZED: 401,
		FORBIDDEN: 403,
		CONFLICT: 409,
		INTERNAL_ERROR: 500,
	}

	const status = statusMap[result.error.code] || 500

	return new Response(
		JSON.stringify({ success: false, error: result.error }),
		{
			status,
			headers: { 'Content-Type': 'application/json' },
		}
	)
}
