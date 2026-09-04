import { Request, Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { getDBStatus } from "../config/db";

export const getHealth = asyncHandler(async (_req: Request, res: Response) => {
  const database = getDBStatus();

  res.json({
    success: true,
    server: {
      status: "running",
      uptimeSeconds: Math.round(process.uptime()),
    },
    api: {
      status: "ok",
    },
    database,
    timestamp: new Date().toISOString(),
  });
});
