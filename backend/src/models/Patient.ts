import { Schema, model, Types } from "mongoose";
import { IDoctor } from "./Doctor";

type DoctorSummary = Pick<IDoctor, "_id" | "name" | "specialization" | "hospital">;

// Plain schema shape, not extended with Document — see Doctor.ts for why. `doctors` is
// typed as either the raw references or populated summaries since both occur in practice
// (populated on reads, bare ids on writes).
export interface IPatient {
  _id: Types.ObjectId;
  name: string;
  doctors: Types.ObjectId[] | DoctorSummary[];
  condition: string;
  phone: string;
  email?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

const patientSchema = new Schema<IPatient>(
  {
    name: { type: String, required: true, trim: true },
    doctors: {
      type: [{ type: Schema.Types.ObjectId, ref: "Doctor" }],
      required: true,
      // `required` on an array path only checks it's defined, not non-empty — hence the
      // explicit length check to keep "at least one doctor" an actual invariant.
      validate: {
        validator: (value: unknown[]) => Array.isArray(value) && value.length > 0,
        message: "At least one doctor must be assigned",
      },
    },
    condition: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    address: { type: String, trim: true },
  },
  { timestamps: true }
);

// Fast "patients belonging to doctor X, newest first" — the nested list endpoint's query shape.
// Mongo builds a multikey index here automatically since `doctors` is an array.
patientSchema.index({ doctors: 1, createdAt: -1 });
// Default newest-first sort on the flat /api/patients list.
patientSchema.index({ createdAt: -1 });
// Full-text search across the fields the Search API supports (name, email, phone, condition).
// Named explicitly so a future field-set change alters this index in place instead of
// silently leaving a stale one behind (MongoDB allows only one text index per collection).
patientSchema.index(
  { name: "text", email: "text", phone: "text", condition: "text" },
  { name: "patient_search_text_index" }
);
// Speeds up the condition filter.
patientSchema.index({ condition: 1 });

export const Patient = model<IPatient>("Patient", patientSchema);
