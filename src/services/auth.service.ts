import { toUserResponseDTO } from "../dto/auth.dto.js"
import {
  createUser,
  findUserByEmail,
  findUserById,
  findValidRefreshToken,
  revokeAllUserRefreshTokens,
  revokeRefreshToken,
  revokeRefreshTokenByHash,
  storeRefreshToken,
} from "../repository/auth.repository.js"
import { AppError } from "../utils/appError.js"
import { type RegisterInput } from "../validation/auth.validation.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { signRefreshToken } from "../utils/refreshToken.js"
import crypto from "node:crypto"
export const register = async (input: RegisterInput) => {
  const existing = await findUserByEmail(input.email)
  if (existing) {
    throw new AppError("Email already exists", 409)
  }

  const password_hash = await bcrypt.hash(input.password, 10)
  const user = await createUser({ ...input, password_hash })

  return toUserResponseDTO(user)
}

const hashToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex")

export const login = async (input: RegisterInput) => {
  const user = await findUserByEmail(input.email)
  if (!user) {
    throw new AppError("Invalid email or password", 401)
  }

  const valid = await bcrypt.compare(input.password, user.password_hash)
  if (!valid) throw new AppError("Invalid email or password", 401)

  const secret = process.env.JWT_ACCESS_SECRET
  if (!secret) {
    throw new AppError("no token in .env", 404)
  }
  const accessToken = jwt.sign({ sub: user.id, role: user.role }, secret, {
    expiresIn: "15m",
  })

  const refreshToken = signRefreshToken(user.id)

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  await storeRefreshToken(user.id, hashToken(refreshToken), expiresAt)
  return { user: toUserResponseDTO(user), accessToken, refreshToken }
}

export const refreshSession = async (refreshToken: string) => {
  let payload: { sub: string }
  const secret = process.env.JWT_REFRESH_SECRET!

  if (!secret) {
    throw new AppError(
      "System configuration fault: Missing refresh secret",
      500,
    )
  }

  try {
    payload = jwt.verify(refreshToken, secret) as { sub: string }
  } catch {
    throw new AppError("invalid or expired refresh token", 401)
  }

  const tokenHash = hashToken(refreshToken)
  const stored = await findValidRefreshToken(payload.sub, tokenHash)

  const user = await findUserById(payload.sub);

if (!user) {
  throw new AppError("User not found", 401);
}


  if (!stored) {
    await revokeAllUserRefreshTokens(payload.sub)
    throw new AppError(
      "Session breach or invalid token detected. Please re-authenticate",
      401,
    )
  }

  await revokeRefreshToken(stored.id)

  const secret2 = process.env.JWT_ACCESS_SECRET!
  if (!secret2) {
    throw new AppError("System configuration fault: Missing access secret", 500)
  }

  const newAccessToken = jwt.sign(
  { sub: payload.sub },
  secret2,
  { expiresIn: "15m" }
);
  const newRefreshToken = signRefreshToken(payload.sub)
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  await storeRefreshToken(payload.sub, hashToken(newRefreshToken), expiresAt)

  return { accessToken: newAccessToken, refreshToken: newRefreshToken }
}

export const logout = async (refreshToken: string) => {
  const tokenHash = hashToken(refreshToken)

  await revokeRefreshTokenByHash(tokenHash)
}

export const verifyAccessToken = (accessToken: string) => {
  const secret = process.env.JWT_ACCESS_SECRET

  if (!secret) {
    throw new AppError("System configuration fault: Missing access secret", 500)
  }

  try {
    const payload = jwt.verify(accessToken, secret) as {
      sub: string;
      role: string;
    }

    return {
      userId: payload.sub,
      role: payload.role,
    }
  } catch {
    throw new AppError("Invalid or expired access token", 401)
  }
}
