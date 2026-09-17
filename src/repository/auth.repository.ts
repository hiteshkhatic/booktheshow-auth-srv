import { usersTable } from '../db/users.js';
import {db} from '../conn.js';
import { and, eq, gt } from 'drizzle-orm';
import type { CreateUserDTO } from '../dto/auth.dto.js';
import { refreshTokensTable } from '../db/refresh_tokens.js';

export const findUserByEmail = async (email: string) => {
	const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
	return user ?? null;
}; 

export const findUserById = async (userId: string) => {
	const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
	return user ?? null;
}

export const createUser = async (data: CreateUserDTO & { password_hash: string}) => {
	const [user] = await db.insert(usersTable).values({
		email: data.email,
		password_hash: data.password_hash,
	}).returning();
	return user;
}

export const storeRefreshToken = async (userId: string,  refreshToken: string, expiresAt: Date) => {
	return db.insert(refreshTokensTable).values({
		user_id: userId,
		token_hash: refreshToken,
		expires_at: expiresAt,
	})
}

export const findValidRefreshToken = async (userId: string, tokenHash: string) => {
	const [token] = await db
		.select()
		.from(refreshTokensTable)
		.where(
			and(
				eq(refreshTokensTable.user_id, userId),
				eq(refreshTokensTable.token_hash, tokenHash),
				eq(refreshTokensTable.revoked, false),
				gt(refreshTokensTable.expires_at, new Date())
			)
		);
		return token ?? null;
};

export const revokeRefreshToken = async (tokenId: string) => {
	console.log()
	await db.update(refreshTokensTable).set( { revoked: true }).where(eq(refreshTokensTable.id, tokenId));
};

export const revokeAllUserRefreshTokens = async (userId: string) => {
	return await db 
		.update(refreshTokensTable)
		.set({ revoked: true})
		.where(eq(refreshTokensTable.user_id, userId));
};

export const revokeRefreshTokenByHash = async (
  tokenHash: string
) => {
  return await db
    .update(refreshTokensTable)
    .set({ revoked: true })
    .where(eq(refreshTokensTable.token_hash, tokenHash));
};
