import { describe, expect, it } from 'vitest'
import { loginSchema, registerSchema, roomSchema } from './validation'

describe('loginSchema', () => {
	it('accepts valid email and password', () => {
		const result = loginSchema.safeParse({
			email: 'test@example.com',
			password: 'password123',
		})
		expect(result.success).toBe(true)
	})

	it('trims whitespace from email', () => {
		const result = loginSchema.safeParse({
			email: 'test@example.com',
			password: 'password123',
		})
		expect(result.success).toBe(true)
		if (result.success) expect(result.data.email).toBe('test@example.com')
	})

	it('rejects invalid email', () => {
		const result = loginSchema.safeParse({
			email: 'not-an-email',
			password: 'password123',
		})
		expect(result.success).toBe(false)
	})

	it('rejects empty email', () => {
		const result = loginSchema.safeParse({
			email: '',
			password: 'password123',
		})
		expect(result.success).toBe(false)
	})

	it('rejects empty password', () => {
		const result = loginSchema.safeParse({
			email: 'test@example.com',
			password: '',
		})
		expect(result.success).toBe(false)
	})
})

describe('registerSchema', () => {
	it('accepts valid registration data', () => {
		const result = registerSchema.safeParse({
			name: 'Jane Doe',
			email: 'jane@example.com',
			password: 'securepass123',
			orgName: 'Acme Corp',
		})
		expect(result.success).toBe(true)
	})

	it('rejects short password', () => {
		const result = registerSchema.safeParse({
			name: 'Jane',
			email: 'jane@example.com',
			password: 'short',
			orgName: 'Acme',
		})
		expect(result.success).toBe(false)
	})

	it('rejects long name', () => {
		const result = registerSchema.safeParse({
			name: 'A'.repeat(101),
			email: 'jane@example.com',
			password: 'securepass123',
			orgName: 'Acme',
		})
		expect(result.success).toBe(false)
	})

	it('trims name and orgName', () => {
		const result = registerSchema.safeParse({
			name: '  Jane Doe  ',
			email: 'jane@example.com',
			password: 'securepass123',
			orgName: '  Acme Corp  ',
		})
		expect(result.success).toBe(true)
		if (result.success) {
			expect(result.data.name).toBe('Jane Doe')
			expect(result.data.orgName).toBe('Acme Corp')
		}
	})
})

describe('roomSchema', () => {
	it('accepts valid room name', () => {
		const result = roomSchema.safeParse({ name: 'Team Standup' })
		expect(result.success).toBe(true)
	})

	it('rejects empty name', () => {
		const result = roomSchema.safeParse({ name: '' })
		expect(result.success).toBe(false)
	})

	it('rejects name over 100 chars', () => {
		const result = roomSchema.safeParse({ name: 'A'.repeat(101) })
		expect(result.success).toBe(false)
	})

	it('trims whitespace', () => {
		const result = roomSchema.safeParse({ name: '  Team Room  ' })
		expect(result.success).toBe(true)
		if (result.success) expect(result.data.name).toBe('Team Room')
	})
})
