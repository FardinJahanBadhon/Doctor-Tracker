/**
 * One-time migration for the single-doctor -> multi-doctor schema change on Patient.
 * Existing documents carry a scalar reference to one doctor under one of two legacy field
 * names — `doctor` (the field this schema used until this change) or `doctorId` (found in
 * this dev database's seed data, from an even earlier convention) — instead of the new
 * `doctors` array. This rewrites each to `doctors: [<id>]` and drops the old field, so every
 * patient document satisfies the new "at least one doctor" invariant.
 *
 * Talks to the raw collection rather than the `Patient` model, since the model's schema
 * no longer declares either legacy field and would silently strip it from anything read
 * through it.
 *
 * Usage: npm run migrate-patient-doctors
 */
import mongoose from "mongoose";
import { connectDB } from "../config/db";

async function run() {
  await connectDB();
  const collection = mongoose.connection.collection("patients");

  let migrated = 0;
  for (const legacyField of ["doctor", "doctorId"]) {
    const legacyDocs = await collection.find({ [legacyField]: { $exists: true } }).toArray();
    console.log(`[migrate-patient-doctors] found ${legacyDocs.length} document(s) with a legacy '${legacyField}' field`);

    for (const doc of legacyDocs) {
      await collection.updateOne(
        { _id: doc._id },
        { $set: { doctors: [doc[legacyField]] }, $unset: { [legacyField]: "" } }
      );
    }
    migrated += legacyDocs.length;
  }

  console.log(`[migrate-patient-doctors] migrated ${migrated} document(s) total`);
  await mongoose.disconnect();
}

run().catch((error) => {
  console.error("[migrate-patient-doctors] failed:", error);
  process.exit(1);
});
