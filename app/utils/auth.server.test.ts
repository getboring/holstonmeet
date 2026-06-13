import { Crypto } from '@peculiar/webcrypto'
import { describe, expect, it, vi, beforeAll } from 'vitest'
import { hashPassword, verifyPassword } from './auth.server'

beforeAll(() => {
	vi.stubGlobal('crypto', new Crypto())
})

describe('hashPassword', () => {
	it('returns a salt:hash format string', async () => {
		const result = await hashPassword('testpassword')
		expect(result).toMatch(/^[a-f0-9]+:[a-f0-9]+$/)
	})

	it('generates different hashes for the same password', async () => {
		const hash1 = await hashPassword('testpassword')
		const hash2 = await hashPassword('testpassword')
		expect(hash1).not.toBe(hash2)
	})

	it('generates a 32-char salt hex and 32-char hash hex', async () => {
		const result = await hashPassword('test')
		const [salt, hash] = result.split(':')
		expect(salt).toHaveLength(32)
		expect(hash).toHaveLength(64)
	})
})

describe('verifyPassword', () => {
	it('returns true for correct password', async () => {
		const stored = await hashPassword('correcthorse')
		const result = await verifyPassword('correcthorse', stored)
		expect(result).toBe(true)
	})

	it('returns false for wrong password', async () => {
		const stored = await hashPassword('correcthorse')
		const result = await verifyPassword('wrongpassword', stored)
		expect(result).toBe(false)
	})

	it('returns false for malformed stored hash', async () => {
		const result = await verifyPassword('password', 'not-a-valid-hash')
		expect(result).toBe(false)
	})

	it('returns false for empty stored hash', async () => {
		const result = await verifyPassword('password', '')
		expect(result).toBe(false)
	})
})
