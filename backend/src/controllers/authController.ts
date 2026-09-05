import { Request, Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { ApiError } from "../utils/ApiError";
import * as authService from "../services/authService";
import { env } from "../config/env";
import { LoginInput } from "../validators/authValidator";

const COOKIE_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 1 day, matches default JWT_EXPIRES_IN

// Frontend and backend are on different origins in production (e.g. a Vercel domain and a
// Render domain), so the session cookie must be sent cross-site. Browsers only allow that
// with SameSite=None, which in turn requires Secure — hence both tied to isProduction rather
// than a plain "lax" that would silently never reach the API in a cross-origin deployment.
function setAuthCookie(res: Response, token: string): void {
  res.cookie(env.cookieName, token, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.isProduction ? "none" : "lax",
    maxAge: COOKIE_MAX_AGE_MS,
  });
}

export const loginHandler = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as LoginInput;

  const { admin, token } = await authService.login(email, password);
  setAuthCookie(res, token);

  res.json({ success: true, admin });
});

export const meHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();

  const admin = await authService.getAdminById(req.user.adminId);
  res.json({ success: true, admin });
});

export const logoutHandler = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie(env.cookieName, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.isProduction ? "none" : "lax",
  });
  res.json({ success: true, message: "Logged out" });
});
