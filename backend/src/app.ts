import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { corsOptions } from "./config/corsOptions";
import { env } from "./config/env";
import routes from "./routes";
import { notFound } from "./middleware/notFound";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
if (!env.isProduction) {
  app.use(morgan("dev"));
}

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

export default app;
