import { NextFunction, Request, Response } from "express";
import { ZodTypeAny } from "zod";
import { ApiError } from "../utils/ApiError";

interface ValidationSchemas {
  body?: ZodTypeAny;
  params?: ZodTypeAny;
  query?: ZodTypeAny;
}

function parseOrThrow(schema: ZodTypeAny, value: unknown): unknown {
  const result = schema.safeParse(value);
  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    }));
    throw ApiError.badRequest("Validation failed", errors);
  }
  return result.data;
}

/**
 * Validates req.body / req.params / req.query against Zod schemas.
 * Accepts either a single schema (validates req.body, for backwards compatibility)
 * or an object naming which parts of the request to validate.
 */
export function validate(schemas: ZodTypeAny | ValidationSchemas) {
  const normalized: ValidationSchemas = "safeParse" in schemas ? { body: schemas } : schemas;

  return (req: Request, _res: Response, next: NextFunction): void => {
    if (normalized.body) req.body = parseOrThrow(normalized.body, req.body);
    if (normalized.params) req.params = parseOrThrow(normalized.params, req.params) as typeof req.params;
    if (normalized.query) req.query = parseOrThrow(normalized.query, req.query) as typeof req.query;
    next();
  };
}
