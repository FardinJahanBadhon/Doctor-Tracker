import { z } from "zod";

export const createDoctorSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  specialization: z.string().trim().min(2, "Specialization must be at least 2 characters").max(100),
  hospital: z.string().trim().min(2, "Hospital must be at least 2 characters").max(150),
  phone: z
    .string()
    .trim()
    .min(6, "Phone must be at least 6 characters")
    .max(20)
    .regex(/^[0-9+\-() ]+$/, "Phone can only contain digits, spaces, and + - ( )"),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
});

export const updateDoctorSchema = createDoctorSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, { message: "Provide at least one field to update" });

export const doctorIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid doctor id"),
});

const isoDate = z
  .string()
  .refine((value) => !Number.isNaN(Date.parse(value)), "Must be a valid date (YYYY-MM-DD)");

export const listDoctorsQuerySchema = z.object({
  search: z.string().trim().min(1).optional(),
  specialization: z.string().trim().min(1).optional(),
  hospital: z.string().trim().min(1).optional(),
  dateFrom: isoDate.optional(),
  dateTo: isoDate.optional(),
  page: z.string().regex(/^\d+$/, "page must be a positive integer").optional(),
  limit: z.string().regex(/^\d+$/, "limit must be a positive integer").optional(),
});

export type CreateDoctorInput = z.infer<typeof createDoctorSchema>;
export type UpdateDoctorInput = z.infer<typeof updateDoctorSchema>;
export type ListDoctorsQuery = z.infer<typeof listDoctorsQuerySchema>;
