import { createCookieSessionStorage, redirect } from '@remix-run/cloudflare'
import { eq } from 'drizzle-orm'
import { Users, Organizations, getDb } from 'schema'
import type { Env } from '~/types/Env'
import { type Result, ok, err, ErrorCodes } from './result'

function getStorage(env: Env) {
	const secret = env.SESSION_SECRET
	if (!secret) {
		console.error(
			'FATAL: SESSION_SECRET env var is not set. Sessions will be insecure.'
		)
	}
	return createCookieSessionStorage({
		cookie: {
			name: '__hm_session',
			secrets: [secret ?? crypto.randomUUID()],
			sameSite: 'lax',
			httpOnly: true,
			secure: true,
			maxAge: 60 * 60 * 24 * 30,
			path: '/',
		},
	})
}

export async function createUserSession(
	userId: number,
	redirectTo: string,
	env: Env
) {
	const storage = getStorage(env)
	const session = await storage.getSession()
	session.set('userId', userId)
	return redirect(redirectTo, {
		headers: {
			'Set-Cookie': await storage.commitSession(session),
		},
	})
}

export async function getUserSession(request: Request, env: Env) {
	const storage = getStorage(env)
	return storage.getSession(request.headers.get('Cookie'))
}

export async function getUserId(
	request: Request,
	env: Env
): Promise<number | null> {
	const session = await getUserSession(request, env)
	const userId = session.get('userId')
	if (!userId || typeof userId !== 'number') return null
	return userId
}

export async function requireUserId(
	request: Request,
	env: Env
): Promise<number> {
	const userId = await getUserId(request, env)
	if (!userId) {
		throw redirect('/login')
	}
	return userId
}

export async function getUser(
	request: Request,
	env: Env
): Promise<Result<NonNullable<Awaited<ReturnType<typeof getUserFromDb>>>>> {
	const userId = await getUserId(request, env)
	if (!userId) return err(ErrorCodes.UNAUTHORIZED, 'Not authenticated')
	const user = await getUserFromDb(env, userId)
	if (!user) return err(ErrorCodes.NOT_FOUND, 'User not found')
	return ok(user)
}

async function getUserFromDb(env: Env, userId: number) {
	const db = getDb({ env })
	if (!db) return null
	const [user] = await db.select().from(Users).where(eq(Users.id, userId))
	return user ?? null
}

export async function requireUser(request: Request, env: Env) {
	const result = await getUser(request, env)
	if (!result.success) {
		throw redirect('/login')
	}
	return result.data
}

export async function getOrg(request: Request, env: Env) {
	const userResult = await getUser(request, env)
	if (!userResult.success || !userResult.data.orgId) return null
	const db = getDb({ env })
	if (!db) return null
	const [org] = await db
		.select()
		.from(Organizations)
		.where(eq(Organizations.id, userResult.data.orgId))
	return org ?? null
}

export async function destroyUserSession(request: Request, env: Env) {
	const storage = getStorage(env)
	const session = await storage.getSession(request.headers.get('Cookie'))
	return redirect('/login', {
		headers: {
			'Set-Cookie': await storage.destroySession(session),
		},
	})
}

export async function hashPassword(password: string): Promise<string> {
	const encoder = new TextEncoder()
	const salt = crypto.getRandomValues(new Uint8Array(16))
	const keyMaterial = await crypto.subtle.importKey(
		'raw',
		encoder.encode(password),
		'PBKDF2',
		false,
		['deriveBits']
	)
	const hash = await crypto.subtle.deriveBits(
		{
			name: 'PBKDF2',
			salt,
			iterations: 100_000,
			hash: 'SHA-256',
		},
		keyMaterial,
		256
	)
	const saltHex = Array.from(salt)
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('')
	const hashHex = Array.from(new Uint8Array(hash))
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('')
	return `${saltHex}:${hashHex}`
}

export async function verifyPassword(
	password: string,
	stored: string
): Promise<boolean> {
	const [saltHex, expectedHash] = stored.split(':')
	if (!saltHex || !expectedHash) return false
	const salt = new Uint8Array(
		saltHex.match(/.{2}/g)!.map((byte) => parseInt(byte, 16))
	)
	const encoder = new TextEncoder()
	const keyMaterial = await crypto.subtle.importKey(
		'raw',
		encoder.encode(password),
		'PBKDF2',
		false,
		['deriveBits']
	)
	const hash = await crypto.subtle.deriveBits(
		{
			name: 'PBKDF2',
			salt,
			iterations: 100_000,
			hash: 'SHA-256',
		},
		keyMaterial,
		256
	)
	const hashHex = Array.from(new Uint8Array(hash))
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('')
	return hashHex === expectedHash
}
