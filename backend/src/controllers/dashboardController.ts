import { Request, Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import * as dashboardService from "../services/dashboardService";
import { DateRange } from "../validators/dashboardValidator";

export const getOverview = asyncHandler(async (_req: Request, res: Response) => {
  const overview = await dashboardService.getOverview();
  res.status(200).json({ success: true, ...overview });
});

export const getPatientsPerDoctor = asyncHandler(async (req: Request, res: Response) => {
  const limit = req.query.limit ? Number(req.query.limit) : undefined;
  const data = await dashboardService.getPatientsPerDoctor(limit);
  res.status(200).json({ success: true, data });
});

export const getDateStatistics = asyncHandler(async (req: Request, res: Response) => {
  const range = (req.query.range as DateRange | undefined) ?? "30d";
  const data = await dashboardService.getStatsByDate(range);
  res.status(200).json({ success: true, range, data });
});
