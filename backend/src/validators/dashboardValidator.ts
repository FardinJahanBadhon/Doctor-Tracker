import { z } from "zod";

export const patientsPerDoctorQuerySchema = z.object({
  limit: z.string().regex(/^\d+$/, "limit must be a positive integer").optional(),
});

export const dateStatisticsQuerySchema = z.object({
  range: z.enum(["7d", "30d", "12m"]).optional(),
});

export type PatientsPerDoctorQuery = z.infer<typeof patientsPerDoctorQuerySchema>;
export type DateStatisticsQuery = z.infer<typeof dateStatisticsQuerySchema>;
export type DateRange = NonNullable<DateStatisticsQuery["range"]>;
