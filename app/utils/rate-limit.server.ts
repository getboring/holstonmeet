import { and, count, eq, gt } from 'drizzle-orm'
import type { DrizzleD1Database } from 'drizzle-orm/d1'
import { RateLimits } from 'schema'

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000 // 15 minutes
const MAX_ATTEMPTS_PER_WINDOW = 10

export async function checkRateLimit(
	db: DrizzleD1Database<Record<string, never>>,
	key: string
): Promise<{ allowed: boolean; remaining: number }> {
	const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString()

	const [result] = await db
		.select({ value: count() })
		.from(RateLimits)
		.where(and(eq(RateLimits.key, key), gt(RateLimits.created, windowStart)))

	const windowCount = result?.value ?? 0
	return {
		allowed: windowCount < MAX_ATTEMPTS_PER_WINDOW,
		remaining: Math.max(0, MAX_ATTEMPTS_PER_WINDOW - windowCount),
	}
}

export async function recordRateLimitAttempt(
	db: DrizzleD1Database<Record<string, never>>,
	key: string
): Promise<void> {
	await db.insert(RateLimits).values({ key })
}
