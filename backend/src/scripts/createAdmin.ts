/**
 * Creates (or updates the password of) an Admin account.
 * There is no public registration endpoint — admins are provisioned via this script,
 * matching "only Admin users can log in" with no self-service signup.
 *
 * Usage:
 *   npm run create-admin -- --name "Jane Doe" --email jane@doctortracker.com --password Secret123
 * Or set ADMIN_NAME / ADMIN_EMAIL / ADMIN_PASSWORD env vars and run with no flags.
 */
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDB } from "../config/db";
import { Admin } from "../models/Admin";

function parseArgs(): Record<string, string> {
  const args: Record<string, string> = {};
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i].startsWith("--")) {
      const key = argv[i].slice(2);
      const value = argv[i + 1];
      args[key] = value;
      i += 1;
    }
  }
  return args;
}

async function run() {
  const args = parseArgs();
  const name = args.name ?? process.env.ADMIN_NAME;
  const email = args.email ?? process.env.ADMIN_EMAIL;
  const password = args.password ?? process.env.ADMIN_PASSWORD;

  if (!name || !email || !password) {
    console.error("Missing required fields. Provide --name --email --password, or ADMIN_NAME/ADMIN_EMAIL/ADMIN_PASSWORD env vars.");
    process.exit(1);
  }
  if (password.length < 6) {
    console.error("Password must be at least 6 characters.");
    process.exit(1);
  }

  await connectDB();

  const passwordHash = await bcrypt.hash(password, 10);
  const existing = await Admin.findOne({ email });

  if (existing) {
    existing.name = name;
    existing.passwordHash = passwordHash;
    await existing.save();
    console.log(`[create-admin] updated existing admin: ${email}`);
  } else {
    await Admin.create({ name, email, passwordHash, role: "admin" });
    console.log(`[create-admin] created admin: ${email}`);
  }

  await mongoose.disconnect();
}

run().catch((error) => {
  console.error("[create-admin] failed:", error);
  process.exit(1);
});
