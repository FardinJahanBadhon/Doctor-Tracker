import { Doctor } from "../models/Doctor";
import { Patient } from "../models/Patient";
import { DateRange } from "../validators/dashboardValidator";

export interface DashboardOverview {
  totalDoctors: number;
  totalPatients: number;
}

export interface PatientsPerDoctorRow {
  doctorId: string;
  doctorName: string;
  specialization: string;
  count: number;
}

export interface DateStatisticRow {
  date: string;
  doctorsAdded: number;
  patientsAdded: number;
}

const DEFAULT_PATIENTS_PER_DOCTOR_LIMIT = 10;

/**
 * Total doctors + total patients. Two counts across two different collections is the
 * floor for this data — there's no single query that spans both — but they run in
 * parallel via Promise.all rather than one-after-another.
 */
export async function getOverview(): Promise<DashboardOverview> {
  const [totalDoctors, totalPatients] = await Promise.all([Doctor.countDocuments(), Patient.countDocuments()]);
  return { totalDoctors, totalPatients };
}

/**
 * Top N doctors by patient count, computed entirely in MongoDB with one aggregation
 * pipeline — no per-doctor round trips from application code.
 *
 * The leading $match excludes patient records with no `doctor` reference (legacy rows
 * that predate that field — see Feature 8/9) *before* grouping. This matters beyond
 * correctness of the data itself: without it, those records collapse into one large
 * `_id: null` bucket that can dominate the top of the sort, and a small `limit` (e.g. 1)
 * would then return zero rows — the null bucket consumes the limit and is later dropped
 * by $unwind once $lookup finds no matching doctor for it. Filtering first also shrinks
 * $group's working set and can use the existing {doctor:1, createdAt:-1} index.
 */
export async function getPatientsPerDoctor(limit = DEFAULT_PATIENTS_PER_DOCTOR_LIMIT): Promise<PatientsPerDoctorRow[]> {
  return Patient.aggregate([
    { $match: { doctor: { $exists: true, $ne: null } } },
    { $group: { _id: "$doctor", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: "doctors",
        localField: "_id",
        foreignField: "_id",
        as: "doctor",
      },
    },
    { $unwind: "$doctor" },
    {
      $project: {
        _id: 0,
        doctorId: "$_id",
        doctorName: "$doctor.name",
        specialization: "$doctor.specialization",
        count: 1,
      },
    },
  ]);
}

function rangeToStart(range: DateRange): Date {
  const now = new Date();
  if (range === "7d") return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  if (range === "30d") return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const start = new Date(now);
  start.setMonth(start.getMonth() - 12);
  return start;
}

function dateFormat(range: DateRange): string {
  // 12-month view groups by month; the shorter ranges group by day.
  return range === "12m" ? "%Y-%m" : "%Y-%m-%d";
}

/**
 * Doctors added and patients added per day (or per month for the 12-month range),
 * within the window. Each collection is summarized by its own single aggregation
 * pipeline ($match on the indexed `createdAt` range, then $group by formatted date);
 * the two pipelines run in parallel and are merged into one sorted, frontend-ready
 * array afterward — merging in application code is far cheaper than trying to force
 * a cross-collection date series out of MongoDB in a single pipeline.
 */
export async function getStatsByDate(range: DateRange = "30d"): Promise<DateStatisticRow[]> {
  const start = rangeToStart(range);
  const format = dateFormat(range);

  const [doctorStats, patientStats] = await Promise.all([
    Doctor.aggregate([
      { $match: { createdAt: { $gte: start } } },
      { $group: { _id: { $dateToString: { format, date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Patient.aggregate([
      { $match: { createdAt: { $gte: start } } },
      { $group: { _id: { $dateToString: { format, date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const merged = new Map<string, DateStatisticRow>();
  for (const row of doctorStats) {
    merged.set(row._id, { date: row._id, doctorsAdded: row.count, patientsAdded: 0 });
  }
  for (const row of patientStats) {
    const existing = merged.get(row._id);
    if (existing) existing.patientsAdded = row.count;
    else merged.set(row._id, { date: row._id, doctorsAdded: 0, patientsAdded: row.count });
  }

  return Array.from(merged.values()).sort((a, b) => a.date.localeCompare(b.date));
}
