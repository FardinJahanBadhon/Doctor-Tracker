/**
 * One-time demo data seed for a freshly created database (e.g. a new Atlas cluster with no
 * doctors/patients yet). Refuses to run against a database that already has doctors or
 * patients, so it can't accidentally double-seed or clobber real data.
 *
 * Usage: npm run seed-demo-data
 */
import mongoose from "mongoose";
import { connectDB } from "../config/db";
import { Doctor } from "../models/Doctor";
import { Patient } from "../models/Patient";

const doctors = [
  { name: "Dr. Sarah Mitchell", specialization: "Cardiology", hospital: "Boston General Hospital", phone: "+1-617-555-0101", email: "sarah.mitchell@doctortracker.com" },
  { name: "Dr. James Chen", specialization: "Neurology", hospital: "Mercy Medical Center", phone: "+1-617-555-0102", email: "james.chen@doctortracker.com" },
  { name: "Dr. Priya Sharma", specialization: "Pediatrics", hospital: "Sunrise Children's Hospital", phone: "+1-617-555-0103", email: "priya.sharma@doctortracker.com" },
  { name: "Dr. Michael Rodriguez", specialization: "Orthopedics", hospital: "City General Hospital", phone: "+1-617-555-0104", email: "michael.rodriguez@doctortracker.com" },
  { name: "Dr. Emily Watson", specialization: "Dermatology", hospital: "Riverside Clinic", phone: "+1-617-555-0105", email: "emily.watson@doctortracker.com" },
  { name: "Dr. David Kim", specialization: "Endocrinology", hospital: "Lakeside Medical Center", phone: "+1-617-555-0106", email: "david.kim@doctortracker.com" },
  { name: "Dr. Aisha Rahman", specialization: "Psychiatry", hospital: "Green Valley Behavioral Health", phone: "+1-617-555-0107", email: "aisha.rahman@doctortracker.com" },
  { name: "Dr. Robert Turner", specialization: "Oncology", hospital: "St. Mary's Cancer Center", phone: "+1-617-555-0108", email: "robert.turner@doctortracker.com" },
];

// doctorIndexes refer to positions in `doctors` above; two indexes means the patient is
// assigned to both, demonstrating the multi-doctor relationship.
const patients: {
  name: string;
  doctorIndexes: number[];
  condition: string;
  phone: string;
  email?: string;
  address?: string;
}[] = [
  { name: "Olivia Bennett", doctorIndexes: [0], condition: "Hypertension", phone: "+1-617-555-0201", email: "olivia.bennett@example.com", address: "12 Maple St, Boston, MA" },
  { name: "Liam Foster", doctorIndexes: [0, 5], condition: "Type 2 Diabetes", phone: "+1-617-555-0202", email: "liam.foster@example.com" },
  { name: "Sophia Ramirez", doctorIndexes: [1], condition: "Migraine", phone: "+1-617-555-0203", email: "sophia.ramirez@example.com", address: "48 Elm Ave, Cambridge, MA" },
  { name: "Noah Patel", doctorIndexes: [1], condition: "Epilepsy", phone: "+1-617-555-0204" },
  { name: "Ava Thompson", doctorIndexes: [2], condition: "Asthma", phone: "+1-617-555-0205", email: "ava.thompson@example.com" },
  { name: "Ethan Wright", doctorIndexes: [2], condition: "Chickenpox", phone: "+1-617-555-0206" },
  { name: "Isabella Nguyen", doctorIndexes: [3], condition: "Fractured Wrist", phone: "+1-617-555-0207", email: "isabella.nguyen@example.com", address: "9 Birch Rd, Somerville, MA" },
  { name: "Mason Clark", doctorIndexes: [3], condition: "Knee Arthritis", phone: "+1-617-555-0208" },
  { name: "Mia Torres", doctorIndexes: [4], condition: "Eczema", phone: "+1-617-555-0209", email: "mia.torres@example.com" },
  { name: "Lucas Bailey", doctorIndexes: [4], condition: "Psoriasis", phone: "+1-617-555-0210" },
  { name: "Charlotte Hughes", doctorIndexes: [5], condition: "Hypothyroidism", phone: "+1-617-555-0211", email: "charlotte.hughes@example.com" },
  { name: "Benjamin Reed", doctorIndexes: [5, 0], condition: "Type 1 Diabetes", phone: "+1-617-555-0212" },
  { name: "Amelia Cooper", doctorIndexes: [6], condition: "Generalized Anxiety Disorder", phone: "+1-617-555-0213", email: "amelia.cooper@example.com", address: "77 Cedar Ln, Newton, MA" },
  { name: "Henry Morgan", doctorIndexes: [6], condition: "Depression", phone: "+1-617-555-0214" },
  { name: "Emma Rivera", doctorIndexes: [7], condition: "Breast Cancer (in remission)", phone: "+1-617-555-0215", email: "emma.rivera@example.com" },
  { name: "Alexander Brooks", doctorIndexes: [7], condition: "Lymphoma", phone: "+1-617-555-0216" },
  { name: "Harper Bell", doctorIndexes: [0, 1], condition: "Stroke Recovery", phone: "+1-617-555-0217", email: "harper.bell@example.com" },
  { name: "Daniel Ward", doctorIndexes: [3, 4], condition: "Post-Surgical Skin Healing", phone: "+1-617-555-0218" },
  { name: "Grace Peterson", doctorIndexes: [2, 6], condition: "ADHD", phone: "+1-617-555-0219", address: "3 Willow Ct, Brookline, MA" },
  { name: "Jack Sullivan", doctorIndexes: [5], condition: "Metabolic Syndrome", phone: "+1-617-555-0220" },
  { name: "Chloe Ramsey", doctorIndexes: [1], condition: "Parkinson's Disease", phone: "+1-617-555-0221", email: "chloe.ramsey@example.com" },
  { name: "Samuel Diaz", doctorIndexes: [7, 0], condition: "Chemotherapy Cardiac Monitoring", phone: "+1-617-555-0222" },
];

async function run() {
  await connectDB();

  const [existingDoctors, existingPatients] = await Promise.all([Doctor.countDocuments(), Patient.countDocuments()]);
  if (existingDoctors > 0 || existingPatients > 0) {
    console.log(`[seed-demo-data] database already has ${existingDoctors} doctor(s) and ${existingPatients} patient(s) — refusing to seed. Aborting.`);
    await mongoose.disconnect();
    return;
  }

  const createdDoctors = await Doctor.insertMany(doctors);
  console.log(`[seed-demo-data] created ${createdDoctors.length} doctors`);

  const patientDocs = patients.map((p) => ({
    name: p.name,
    doctors: p.doctorIndexes.map((i) => createdDoctors[i]._id),
    condition: p.condition,
    phone: p.phone,
    email: p.email,
    address: p.address,
  }));
  const createdPatients = await Patient.insertMany(patientDocs);
  console.log(`[seed-demo-data] created ${createdPatients.length} patients`);

  await mongoose.disconnect();
}

run().catch((error) => {
  console.error("[seed-demo-data] failed:", error);
  process.exit(1);
});
