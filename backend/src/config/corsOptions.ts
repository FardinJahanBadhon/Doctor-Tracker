import { CorsOptions } from "cors";
import { env } from "./env";

export const corsOptions: CorsOptions = {
  origin: env.clientOrigin,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
};
