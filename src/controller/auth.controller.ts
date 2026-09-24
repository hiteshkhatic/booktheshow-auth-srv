import type { Request, Response, NextFunction } from "express"
import { login, logout, refreshSession, register, verifyAccessToken } from "../services/auth.service.js"
import { asyncHandler } from "../utils/asyncHandle.js"

export const registerController = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await register(req.body)
    res.status(201).json({ user })
  },
)

export const loginController = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await login(req.body)
    res.status(200).json({ user })
  },
)

export const handleRefresh = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const oldRefreshToken = req.body?.refreshToken;

    if (!oldRefreshToken) {
      return res.status(401).json({ message: "Refresh token is missing" })
    }

    const { accessToken, refreshToken: newRefreshToken } = await refreshSession(oldRefreshToken);

    res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        // secure: process.env.NODE_ENV === "production",
        secure: false,
        // sameSite: "strict",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ accessToken, newRefreshToken});
  } catch (error) {
    next(error);
  }
}

export const handleLogout = asyncHandler(
  async (req: Request, res: Response) => {
    const refreshToken =
      req.cookies?.refreshToken || req.body?.refreshToken;

      if (!refreshToken) {
        return res.status(400).json({ message: "No refresht token here"});
      }

    
    const isRevokedSuccessfully = await logout(refreshToken);

    if (!isRevokedSuccessfully) {
      return res.status(400).json({ message: "invalid or expired refresh token"});
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    return res.status(200).json({
      message: "Logged out successfully",
    });
  }
);

export const handleVerify = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization || req.body?.accessToken;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authorization token is missing",
      });
    }

    const accessToken = authHeader.substring(7);

    const result = verifyAccessToken(accessToken);

    return res.status(200).json({
      valid: true,
      userId: result.userId,
    });
  } catch (error) {
    next(error);
  }
};