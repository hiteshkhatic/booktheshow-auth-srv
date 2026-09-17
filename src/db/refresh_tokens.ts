import { uuid, text, boolean, pgTable, timestamp } from 'drizzle-orm/pg-core';
import { usersTable } from './users.js';

export const refreshTokensTable = pgTable('refresh_tokens', {
  id: uuid().primaryKey().defaultRandom(),
  user_id: uuid('user_id').references(() => usersTable.id).notNull(),
  token_hash: text('token_hash').notNull(),
  expires_at: timestamp('expires_at').notNull(),
  revoked: boolean().default(false),
  created_at: timestamp().defaultNow(),
});