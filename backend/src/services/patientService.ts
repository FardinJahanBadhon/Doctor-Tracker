import { FilterQuery } from "mongoose";
import { Request } from "express";
import { Patient, IPatient } from "../models/Patient";
import { Doctor } from "../models/Doctor";
import { ApiError } from "../utils/ApiError";
import { getPagination, buildMeta, PaginationMeta } from "../utils/pagination";
import { CreatePatientInput, ListPatientsQuery, UpdatePatientInput } from "../validators/patientValidator";

const DOCTOR_SUMMARY_FIELDS = "name specialization hospital";

async function assertDoctorExists(doctorId: string): Promise<void> {
  const exists = await Doctor.exists({ _id: doctorId });
  if (!exists) throw ApiError.notFound("Doctor not found");
}

async function assertDoctorsExist(doctorIds: string[]): Promise<void> {
  const count = await Doctor.countDocuments({ _id: { $in: doctorIds } });
  if (count !== doctorIds.length) throw ApiError.notFound("One or more doctors not found");
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildFilter(query: ListPatientsQuery): FilterQuery<IPatient> {
  const filter: FilterQuery<IPatient> = {};

  if (query.search) {
    filter.$text = { $search: query.search };
  }
  if (query.condition) {
    filter.condition = { $regex: `^${escapeRegex(query.condition)}$`, $options: "i" };
  }
  if (query.doctorId) {
    filter.doctors = query.doctorId;
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

export async function createPatient(payload: CreatePatientInput): Promise<IPatient> {
  // One query instead of two: the existence check and the doctor summaries needed for the
  // response were previously two separate round trips (Doctor.exists, then .populate()
  // re-fetching the same doctors). Fetching once with the summary fields already selected
  // serves both purposes — assigning it onto the ref path is exactly what .populate() does
  // internally, just without the extra query.
  const doctors = await Doctor.find({ _id: { $in: payload.doctors } }).select(DOCTOR_SUMMARY_FIELDS).lean();
  if (doctors.length !== payload.doctors.length) throw ApiError.notFound("One or more doctors not found");

  const patient = await Patient.create(payload);
  // Assigning fetched doctors directly onto a *Document's* ref path doesn't mark it
  // "populated" the way .populate() does — Mongoose's schema-level cast would silently
  // reduce it back to bare ids on serialization. Converting to a plain object first
  // sidesteps that cast, so the manually-attached summaries actually survive to JSON.
  const patientObj = patient.toObject();
  const doctorsById = new Map(doctors.map((doctor) => [String(doctor._id), doctor]));
  // Preserve the order the doctors were submitted in, rather than $in's arbitrary order.
  patientObj.doctors = payload.doctors.map((id) => doctorsById.get(id)!);
  return patientObj;
}

export async function listPatients(req: Request): Promise<{ patients: IPatient[]; meta: PaginationMeta }> {
  const { page, limit, skip } = getPagination(req);
  const query = req.query as ListPatientsQuery;
  const filter = buildFilter(query);

  // Relevance-sort matches when searching (uses the text index's score); otherwise newest first.
  const cursor = query.search
    ? Patient.find(filter, { score: { $meta: "textScore" } }).sort({ score: { $meta: "textScore" } })
    : Patient.find(filter).sort({ createdAt: -1 });

  const [patients, total] = await Promise.all([
    cursor.skip(skip).limit(limit).populate("doctors", DOCTOR_SUMMARY_FIELDS).lean(),
    Patient.countDocuments(filter),
  ]);

  return { patients, meta: buildMeta(total, page, limit) };
}

export async function listPatientsForDoctor(
  doctorId: string,
  req: Request
): Promise<{ patients: IPatient[]; meta: PaginationMeta }> {
  await assertDoctorExists(doctorId);
  const { page, limit, skip } = getPagination(req);
  const query = req.query as ListPatientsQuery;
  // The doctor is fixed by the URL — any `doctorId` in the query string is ignored.
  // Matching an array field against a scalar id returns docs where the array contains it.
  const filter = { ...buildFilter(query), doctors: doctorId };

  const cursor = query.search
    ? Patient.find(filter, { score: { $meta: "textScore" } }).sort({ score: { $meta: "textScore" } })
    : Patient.find(filter).sort({ createdAt: -1 });

  // Populated for consistency with the other list endpoints — every patient object the
  // frontend receives has the same shape regardless of which endpoint returned it. This
  // also fixes a real bug: the edit form (opened from this doctor's own page) reads
  // `patient.doctors[]._id` to preselect the doctors field, which silently failed when
  // `doctors` was still bare ids here.
  const [patients, total] = await Promise.all([
    cursor.skip(skip).limit(limit).populate("doctors", DOCTOR_SUMMARY_FIELDS).lean(),
    Patient.countDocuments(filter),
  ]);

  return { patients, meta: buildMeta(total, page, limit) };
}

export async function getPatientById(id: string): Promise<IPatient> {
  const patient = await Patient.findById(id).populate("doctors", DOCTOR_SUMMARY_FIELDS).lean();
  if (!patient) throw ApiError.notFound("Patient not found");
  return patient;
}

export async function updatePatient(id: string, payload: UpdatePatientInput): Promise<IPatient> {
  if (payload.doctors) {
    await assertDoctorsExist(payload.doctors);
  }

  const patient = await Patient.findByIdAndUpdate(id, payload, { new: true, runValidators: true })
    .populate("doctors", DOCTOR_SUMMARY_FIELDS)
    .lean();
  if (!patient) throw ApiError.notFound("Patient not found");
  return patient;
}

export async function deletePatient(id: string): Promise<void> {
  const patient = await Patient.findByIdAndDelete(id).lean();
  if (!patient) throw ApiError.notFound("Patient not found");
}
