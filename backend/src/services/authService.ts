import { Admin, IAdmin } from "../models/Admin";
import { ApiError } from "../utils/ApiError";
import { signToken } from "../utils/jwt";

export interface SanitizedAdmin {
  id: string;
  name: string;
  email: string;
  role: "admin";
}

function sanitize(admin: IAdmin): SanitizedAdmin {
  return {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
  };
}

export async function login(email: string, password: string): Promise<{ admin: SanitizedAdmin; token: string }> {
  const admin = await Admin.findOne({ email }).select("+passwordHash");
  if (!admin) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const isValid = await admin.comparePassword(password);
  if (!isValid) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const token = signToken({ adminId: admin.id, role: admin.role });
  return { admin: sanitize(admin), token };
}

export async function getAdminById(id: string): Promise<SanitizedAdmin> {
  const admin = await Admin.findById(id);
  if (!admin) {
    throw ApiError.unauthorized("Session is no longer valid");
  }
  return sanitize(admin);
}
