import { z } from 'zod'

export const loginSchema = z.object({
	email: z
		.string()
		.min(1, 'Email is required')
		.email('Invalid email address')
		.toLowerCase()
		.trim(),
	password: z.string().min(1, 'Password is required'),
})

export const registerSchema = z.object({
	name: z
		.string()
		.min(1, 'Name is required')
		.max(100, 'Name must be under 100 characters')
		.trim(),
	email: z
		.string()
		.min(1, 'Email is required')
		.email('Invalid email address')
		.toLowerCase()
		.trim(),
	password: z
		.string()
		.min(8, 'Password must be at least 8 characters')
		.max(128, 'Password must be under 128 characters'),
	orgName: z
		.string()
		.min(1, 'Organization name is required')
		.max(100, 'Organization name must be under 100 characters')
		.trim(),
})

export const roomSchema = z.object({
	name: z
		.string()
		.min(1, 'Room name is required')
		.max(100, 'Room name must be under 100 characters')
		.trim(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type RoomInput = z.infer<typeof roomSchema>
