import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { env } from "../config/env";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
    return;
  }

  if (err && typeof err === "object" && "code" in err && (err as { code: number }).code === 11000) {
    res.status(409).json({ success: false, message: "A record with this value already exists" });
    return;
  }

  console.error("[unhandled error]", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    ...(env.isProduction ? {} : { stack: err instanceof Error ? err.stack : undefined }),
  });
}
