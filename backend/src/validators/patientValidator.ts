import { z } from "zod";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

export const createPatientSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  doctor: objectId,
  condition: z.string().trim().min(2, "Condition must be at least 2 characters").max(150),
  phone: z
    .string()
    .trim()
    .min(6, "Phone must be at least 6 characters")
    .max(20)
    .regex(/^[0-9+\-() ]+$/, "Phone can only contain digits, spaces, and + - ( )"),
  email: z.string().trim().toLowerCase().email("Enter a valid email address").optional(),
  address: z.string().trim().max(250).optional(),
});

export const updatePatientSchema = createPatientSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, { message: "Provide at least one field to update" });

export const patientIdParamSchema = z.object({
  id: objectId,
});

const isoDate = z
  .string()
  .refine((value) => !Number.isNaN(Date.parse(value)), "Must be a valid date (YYYY-MM-DD)");

export const listPatientsQuerySchema = z.object({
  search: z.string().trim().min(1).optional(),
  condition: z.string().trim().min(1).optional(),
  // Only meaningful on the flat /api/patients route — the nested /doctors/:id/patients
  // route already fixes the doctor via the URL and ignores this if present.
  doctorId: objectId.optional(),
  dateFrom: isoDate.optional(),
  dateTo: isoDate.optional(),
  page: z.string().regex(/^\d+$/, "page must be a positive integer").optional(),
  limit: z.string().regex(/^\d+$/, "limit must be a positive integer").optional(),
});

export type CreatePatientInput = z.infer<typeof createPatientSchema>;
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>;
export type ListPatientsQuery = z.infer<typeof listPatientsQuerySchema>;
