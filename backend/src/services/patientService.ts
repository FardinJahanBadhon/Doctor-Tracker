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
    filter.doctor = query.doctorId;
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
  // One query instead of two: the existence check and the doctor summary needed for the
  // response were previously two separate round trips (Doctor.exists, then .populate()
  // re-fetching the same doctor). Fetching once with the summary fields already selected
  // serves both purposes — assigning it onto the ref path is exactly what .populate() does
  // internally, just without the extra query.
  const doctor = await Doctor.findById(payload.doctor).select(DOCTOR_SUMMARY_FIELDS).lean();
  if (!doctor) throw ApiError.notFound("Doctor not found");

  const patient = await Patient.create(payload);
  // Assigning a fetched doctor directly onto a *Document's* ref path doesn't mark it
  // "populated" the way .populate() does — Mongoose's schema-level ObjectId cast would
  // silently reduce it back to a bare id on serialization. Converting to a plain object
  // first sidesteps that cast, so the manually-attached summary actually survives to JSON.
  const patientObj = patient.toObject();
  patientObj.doctor = doctor;
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
    cursor.skip(skip).limit(limit).populate("doctor", DOCTOR_SUMMARY_FIELDS).lean(),
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
  const filter = { ...buildFilter(query), doctor: doctorId };

  const cursor = query.search
    ? Patient.find(filter, { score: { $meta: "textScore" } }).sort({ score: { $meta: "textScore" } })
    : Patient.find(filter).sort({ createdAt: -1 });

  // Populated for consistency with the other list endpoints — every patient object the
  // frontend receives has the same shape regardless of which endpoint returned it. This
  // also fixes a real bug: the edit form (opened from this doctor's own page) reads
  // `patient.doctor._id` to preselect the doctor field, which silently failed when
  // `doctor` was still a bare id here.
  const [patients, total] = await Promise.all([
    cursor.skip(skip).limit(limit).populate("doctor", DOCTOR_SUMMARY_FIELDS).lean(),
    Patient.countDocuments(filter),
  ]);

  return { patients, meta: buildMeta(total, page, limit) };
}

export async function getPatientById(id: string): Promise<IPatient> {
  const patient = await Patient.findById(id).populate("doctor", DOCTOR_SUMMARY_FIELDS).lean();
  if (!patient) throw ApiError.notFound("Patient not found");
  return patient;
}

export async function updatePatient(id: string, payload: UpdatePatientInput): Promise<IPatient> {
  if (payload.doctor) {
    await assertDoctorExists(payload.doctor);
  }

  const patient = await Patient.findByIdAndUpdate(id, payload, { new: true, runValidators: true })
    .populate("doctor", DOCTOR_SUMMARY_FIELDS)
    .lean();
  if (!patient) throw ApiError.notFound("Patient not found");
  return patient;
}

export async function deletePatient(id: string): Promise<void> {
  const patient = await Patient.findByIdAndDelete(id).lean();
  if (!patient) throw ApiError.notFound("Patient not found");
}
