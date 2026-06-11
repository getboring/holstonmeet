CREATE TABLE `Organizations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`modified` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`deleted` text,
	`name` text NOT NULL,
	`slug` text NOT NULL UNIQUE,
	`plan` text NOT NULL DEFAULT 'free',
	`maxRooms` integer NOT NULL DEFAULT 5,
	`maxParticipantsPerRoom` integer NOT NULL DEFAULT 10
);
--> statement-breakpoint
CREATE TABLE `Users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`modified` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`deleted` text,
	`email` text NOT NULL UNIQUE,
	`name` text NOT NULL,
	`passwordHash` text NOT NULL,
	`role` text NOT NULL DEFAULT 'member',
	`orgId` integer REFERENCES Organizations(id)
);
--> statement-breakpoint
CREATE TABLE `Rooms` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`modified` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`deleted` text,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`orgId` integer NOT NULL REFERENCES Organizations(id),
	`createdBy` integer NOT NULL REFERENCES Users(id),
	`isActive` integer NOT NULL DEFAULT 1
);
