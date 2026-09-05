import { FilterQuery } from "mongoose";
import { Request } from "express";
import { Doctor, IDoctor } from "../models/Doctor";
import { Patient } from "../models/Patient";
import { ApiError } from "../utils/ApiError";
import { getPagination, buildMeta, PaginationMeta } from "../utils/pagination";
import { CreateDoctorInput, ListDoctorsQuery, UpdateDoctorInput } from "../validators/doctorValidator";

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildFilter(query: ListDoctorsQuery): FilterQuery<IDoctor> {
  const filter: FilterQuery<IDoctor> = {};

  if (query.search) {
    filter.$text = { $search: query.search };
  }
  if (query.specialization) {
    filter.specialization = { $regex: `^${escapeRegex(query.specialization)}$`, $options: "i" };
  }
  if (query.hospital) {
    filter.hospital = { $regex: `^${escapeRegex(query.hospital)}$`, $options: "i" };
  }
  if (query.dateFrom || query.dateTo) {
    filter.createdAt = {};
    if (query.dateFrom) filter.createdAt.$gte = new Date(query.dateFrom);
    if (query.dateTo) {
      const endOfDay = new Date(query.dateTo);
      endOfDay.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = endOfDay;
    }
  }

  return filter;
}

export async function createDoctor(payload: CreateDoctorInput): Promise<IDoctor> {
  return Doctor.create(payload);
}

export async function listDoctors(req: Request): Promise<{ doctors: IDoctor[]; meta: PaginationMeta }> {
  const { page, limit, skip } = getPagination(req);
  const query = req.query as ListDoctorsQuery;
  const filter = buildFilter(query);

  // Relevance-sort matches when searching (uses the text index's score); otherwise newest first.
  const cursor = query.search
    ? Doctor.find(filter, { score: { $meta: "textScore" } }).sort({ score: { $meta: "textScore" } })
    : Doctor.find(filter).sort({ createdAt: -1 });

  // .lean() — these results are only ever JSON-serialized in the controller, never
  // mutated or re-saved, so skipping Mongoose document hydration (change tracking,
  // getters, prototype methods) is pure savings, especially across a whole page of results.
  const [doctors, total] = await Promise.all([
    cursor.skip(skip).limit(limit).lean(),
    Doctor.countDocuments(filter),
  ]);

  return { doctors, meta: buildMeta(total, page, limit) };
}

export async function getDoctorById(id: string): Promise<IDoctor> {
  const doctor = await Doctor.findById(id).lean();
  if (!doctor) throw ApiError.notFound("Doctor not found");
  return doctor;
}

export async function updateDoctor(id: string, payload: UpdateDoctorInput): Promise<IDoctor> {
  const doctor = await Doctor.findByIdAndUpdate(id, payload, { new: true, runValidators: true }).lean();
  if (!doctor) throw ApiError.notFound("Doctor not found");
  return doctor;
}

export async function deleteDoctor(id: string): Promise<void> {
  const doctor = await Doctor.findByIdAndDelete(id).lean();
  if (!doctor) throw ApiError.notFound("Doctor not found");
  // A patient can belong to multiple doctors now, so deleting one doctor should only drop
  // that reference, not the whole patient record. Only patients left with zero doctors
  // afterward are removed, to keep the "at least one doctor" invariant that writes enforce.
  await Patient.updateMany({ doctors: id }, { $pull: { doctors: id } });
  await Patient.deleteMany({ doctors: { $size: 0 } });
}
