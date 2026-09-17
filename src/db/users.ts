import { text, pgTable, uuid, timestamp, pgEnum} from "drizzle-orm/pg-core"

export const roleEnum = pgEnum('role', ['admin', 'user'])

export const usersTable = pgTable("users", {
    id: uuid().primaryKey().defaultRandom(),
    email: text().notNull().unique(),
    password_hash: text().notNull(),
    role: roleEnum().notNull().default('user'),
    created_at: timestamp().defaultNow(),
});