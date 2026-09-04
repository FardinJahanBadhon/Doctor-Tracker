import { Request, Response, NextFunction } from "express";
import { env } from "../config/env";
import { verifyToken } from "../utils/jwt";
import { ApiError } from "../utils/ApiError";

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const token = req.cookies?.[env.cookieName];

  if (!token) {
    throw ApiError.unauthorized("Authentication required");
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    throw ApiError.unauthorized("Invalid or expired session");
  }
}
