/**
 * Seed script for demo accounts.
 * Run locally with: npx tsx seed.ts
 *
 * Creates 5 demo organizations with owner accounts.
 * Creates all tables if they don't exist (schema push), then seeds data.
 */

import { webcrypto } from 'node:crypto'
if (typeof globalThis.crypto === 'undefined') {
	;(globalThis as any).crypto = webcrypto
}

import { glob } from 'glob'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { eq } from 'drizzle-orm'
import { Users, Organizations } from './schema'

type DemoAccount = {
	orgName: string
	orgSlug: string
	name: string
	email: string
	password: string
	role: 'owner' | 'admin' | 'member'
}

const DEMO_ACCOUNTS: DemoAccount[] = [
	{
		orgName: 'Holston Demo',
		orgSlug: 'holston-demo',
		name: 'Cody Boring',
		email: 'cody@holstonplatforms.com',
		password: 'HolstonDemo2026!',
		role: 'owner',
	},
	{
		orgName: 'Acme Corp',
		orgSlug: 'acme-corp',
		name: 'Alice Johnson',
		email: 'alice@acme.com',
		password: 'AcmeMeet2026!',
		role: 'owner',
	},
	{
		orgName: 'Globex Industries',
		orgSlug: 'globex-industries',
		name: 'Bob Martinez',
		email: 'bob@globex.com',
		password: 'GlobexPass2026!',
		role: 'owner',
	},
	{
		orgName: 'Initech Solutions',
		orgSlug: 'initech-solutions',
		name: 'Carol Chen',
		email: 'carol@initech.com',
		password: 'InitechMeet2026!',
		role: 'owner',
	},
	{
		orgName: 'Wayne Enterprises',
		orgSlug: 'wayne-enterprises',
		name: 'David Kim',
		email: 'david@wayne.com',
		password: 'WayneDemo2026!',
		role: 'owner',
	},
]

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS "Organizations" (
	"id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	"created" text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"modified" text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"deleted" text,
	"name" text NOT NULL,
	"slug" text NOT NULL UNIQUE,
	"plan" text NOT NULL DEFAULT 'free',
	"maxRooms" integer NOT NULL DEFAULT 5,
	"maxParticipantsPerRoom" integer NOT NULL DEFAULT 10
);
CREATE TABLE IF NOT EXISTS "Users" (
	"id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	"created" text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"modified" text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"deleted" text,
	"email" text NOT NULL UNIQUE,
	"name" text NOT NULL,
	"passwordHash" text NOT NULL,
	"role" text NOT NULL DEFAULT 'member',
	"orgId" integer REFERENCES "Organizations"("id")
);
CREATE TABLE IF NOT EXISTS "Rooms" (
	"id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	"created" text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"modified" text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"deleted" text,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"orgId" integer NOT NULL REFERENCES "Organizations"("id"),
	"createdBy" integer NOT NULL REFERENCES "Users"("id"),
	"isActive" integer NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS "RateLimits" (
	"id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	"key" text NOT NULL,
	"created" text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE TABLE IF NOT EXISTS "AnalyticsRefreshes" (
	"id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	"created" text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"modified" text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"deleted" text,
	"version" text NOT NULL
);
CREATE TABLE IF NOT EXISTS "AnalyticsSimpleCallFeedback" (
	"id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	"created" text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"modified" text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"deleted" text,
	"version" text NOT NULL,
	"experiencedIssues" integer NOT NULL,
	"meetingId" text
);
CREATE TABLE IF NOT EXISTS "Meetings" (
	"id" text PRIMARY KEY NOT NULL,
	"created" text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"modified" text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"deleted" text,
	"userCount" integer NOT NULL,
	"ended" text
);
`

async function hashPassword(password: string): Promise<string> {
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

async function main() {
	const files = await glob(
		'.wrangler/state/v3/d1/miniflare-D1DatabaseObject/*.sqlite'
	)
	const dbFile = files.find((f) => !f.includes('metadata.sqlite'))
	if (!dbFile) {
		console.error(
			'No local D1 database found. Run `pnpm dev` first, then run this seed script.'
		)
		process.exit(1)
	}

	console.log(`Using database: ${dbFile}`)
	const sqlite = new Database(dbFile)
	const db = drizzle(sqlite)

	// Create all tables
	sqlite.exec(SCHEMA_SQL)
	console.log('Schema applied (all tables created if missing).')

	let created = 0
	for (const account of DEMO_ACCOUNTS) {
		const [existingOrg] = await db
			.select()
			.from(Organizations)
			.where(eq(Organizations.slug, account.orgSlug))

		if (existingOrg) {
			console.log(`  [skip] "${account.orgName}" already exists (id: ${existingOrg.id})`)
			continue
		}

		const [org] = await db
			.insert(Organizations)
			.values({
				name: account.orgName,
				slug: account.orgSlug,
			})
			.returning()

		const passwordHash = await hashPassword(account.password)
		await db.insert(Users).values({
			name: account.name,
			email: account.email,
			passwordHash,
			role: account.role,
			orgId: org.id,
		})

		created++
		console.log(`  [create] ${account.name} (${account.email}) -> Org: ${account.orgName}`)
	}

	console.log(`\nSeeded ${created} demo accounts.\n`)
	console.log('Demo Accounts:')
	console.log('─'.repeat(60))
	for (const account of DEMO_ACCOUNTS) {
		console.log(`  ${account.email.padEnd(30)} ${account.password}`)
	}
	console.log('─'.repeat(60))

	sqlite.close()
}

main().catch((err) => {
	console.error(err)
	process.exit(1)
})
