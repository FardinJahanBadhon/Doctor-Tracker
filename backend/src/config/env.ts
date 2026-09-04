import dotenv from "dotenv";

dotenv.config();

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 5000),
  mongodbUri: required("MONGODB_URI", "mongodb://127.0.0.1:27017/doctor_tracker"),
  clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:3000",
  isProduction: process.env.NODE_ENV === "production",
  jwtSecret: required("JWT_SECRET", "dev-only-secret-change-me"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "1d",
  cookieName: process.env.COOKIE_NAME ?? "dt_token",
};
