import { sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/d1'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import type { Env } from '~/types/Env'

const metadataColumns = {
	id: integer('id').primaryKey({ autoIncrement: true }),
	created: text('created')
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	modified: text('modified')
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	deleted: text('deleted'),
}

export const AnalyticsRefreshes = sqliteTable('AnalyticsRefreshes', {
	...metadataColumns,
	version: text('version').notNull(),
})

export const AnalyticsSimpleCallFeedback = sqliteTable(
	'AnalyticsSimpleCallFeedback',
	{
		...metadataColumns,
		version: text('version').notNull(),
		experiencedIssues: integer('experiencedIssues').notNull(),
		meetingId: text('meetingId').references(() => Meetings.id),
	}
)

export const Meetings = sqliteTable('Meetings', {
	...metadataColumns,
	id: text('id').primaryKey(),
	peakUserCount: integer('userCount').notNull(),
	ended: text('ended'),
})

export const Users = sqliteTable('Users', {
	...metadataColumns,
	email: text('email').notNull().unique(),
	name: text('name').notNull(),
	passwordHash: text('passwordHash').notNull(),
	role: text('role', { enum: ['owner', 'admin', 'member'] })
		.notNull()
		.default('member'),
	orgId: integer('orgId').references(() => Organizations.id),
})

export const Organizations = sqliteTable('Organizations', {
	...metadataColumns,
	name: text('name').notNull(),
	slug: text('slug').notNull().unique(),
	plan: text('plan', { enum: ['free', 'pro', 'enterprise'] })
		.notNull()
		.default('free'),
	maxRooms: integer('maxRooms').notNull().default(5),
	maxParticipantsPerRoom: integer('maxParticipantsPerRoom')
		.notNull()
		.default(10),
})

export const Rooms = sqliteTable('Rooms', {
	...metadataColumns,
	name: text('name').notNull(),
	slug: text('slug').notNull(),
	orgId: integer('orgId')
		.references(() => Organizations.id)
		.notNull(),
	createdBy: integer('createdBy')
		.references(() => Users.id)
		.notNull(),
	isActive: integer('isActive', { mode: 'boolean' }).notNull().default(true),
})

export function getDb(context: { env: Env }) {
	if (!context.env.DB) {
		return null
	}
	return drizzle(context.env.DB)
}
