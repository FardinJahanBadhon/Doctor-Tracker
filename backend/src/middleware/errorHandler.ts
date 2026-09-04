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

  // Every route already validates :id params and ref-field bodies with Zod before they
  // reach Mongoose, so these shouldn't fire in practice — but a raw CastError/ValidationError
  // slipping through (e.g. a future query path that forgets that guard) should still come
  // back as a client error with a useful message, not an opaque 500.
  if (err && typeof err === "object" && "name" in err) {
    const name = (err as { name: string }).name;
    if (name === "CastError") {
      res.status(400).json({ success: false, message: "Invalid identifier supplied" });
      return;
    }
    if (name === "ValidationError") {
      const validationErr = err as unknown as { errors: Record<string, { path: string; message: string }> };
      const errors = Object.values(validationErr.errors).map((e) => ({ path: e.path, message: e.message }));
      res.status(400).json({ success: false, message: "Validation failed", errors });
      return;
    }
  }

  console.error("[unhandled error]", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    ...(env.isProduction ? {} : { stack: err instanceof Error ? err.stack : undefined }),
  });
}
