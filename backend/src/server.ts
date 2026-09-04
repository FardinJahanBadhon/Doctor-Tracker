import app from "./app";
import { connectDB, disconnectDB } from "./config/db";
import { env } from "./config/env";

async function start() {
  try {
    await connectDB();

    const server = app.listen(env.port, () => {
      console.log(`[server] listening on http://localhost:${env.port}`);
    });

    const shutdown = (signal: string) => {
      console.log(`[server] received ${signal}, shutting down gracefully...`);
      server.close(async () => {
        await disconnectDB();
        console.log("[server] shutdown complete");
        process.exit(0);
      });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    console.error("[server] failed to start:", error);
    process.exit(1);
  }
}

start();
