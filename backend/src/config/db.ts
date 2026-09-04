import mongoose from "mongoose";
import { env } from "./env";

export async function connectDB(): Promise<void> {
  mongoose.set("strictQuery", true);

  mongoose.connection.on("connected", () => {
    console.log(`[db] connected to MongoDB at ${mongoose.connection.host}/${mongoose.connection.name}`);
  });

  mongoose.connection.on("error", (error) => {
    console.error("[db] connection error:", error);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("[db] disconnected from MongoDB");
  });

  await mongoose.connect(env.mongodbUri, {
    // Fail fast instead of hanging on an unreachable database.
    serverSelectionTimeoutMS: 5000,
  });
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
}

const READY_STATE_LABELS: Record<number, string> = {
  0: "disconnected",
  1: "connected",
  2: "connecting",
  3: "disconnecting",
  99: "uninitialized",
};

export function getDBStatus(): { status: string; name: string | null } {
  const readyState = mongoose.connection.readyState;
  return {
    status: READY_STATE_LABELS[readyState] ?? "unknown",
    name: readyState === 1 ? mongoose.connection.name : null,
  };
}
