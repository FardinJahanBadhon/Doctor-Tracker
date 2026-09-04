import { Schema, model, Document } from "mongoose";

export interface IDoctor extends Document {
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const doctorSchema = new Schema<IDoctor>(
  {
    name: { type: String, required: true, trim: true },
    specialization: { type: String, required: true, trim: true },
    hospital: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  },
  { timestamps: true }
);

// Full-text search across the fields the Search API supports (name, specialization, hospital, email).
// Named explicitly — MongoDB allows only one text index per collection, so a stable name
// avoids conflicts if the field set ever changes (a same-named index is altered in place;
// only a name mismatch would try to create a second, conflicting text index).
doctorSchema.index(
  { name: "text", specialization: "text", hospital: "text", email: "text" },
  { name: "doctor_search_text_index" }
);
// Speeds up the specialization/hospital filter combination.
doctorSchema.index({ specialization: 1, hospital: 1 });
// Speeds up date-range filtering and the default newest-first sort.
doctorSchema.index({ createdAt: -1 });

export const Doctor = model<IDoctor>("Doctor", doctorSchema);
