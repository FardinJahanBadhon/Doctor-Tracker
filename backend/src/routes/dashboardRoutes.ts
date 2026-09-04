import { Router } from "express";
import * as dashboardController from "../controllers/dashboardController";
import { authenticate } from "../middleware/authenticate";
import { validate } from "../middleware/validate";
import { patientsPerDoctorQuerySchema, dateStatisticsQuerySchema } from "../validators/dashboardValidator";

const router = Router();

// Only authenticated admins may access dashboard analytics.
router.use(authenticate);

router.get("/overview", dashboardController.getOverview);
router.get(
  "/patients-per-doctor",
  validate({ query: patientsPerDoctorQuerySchema }),
  dashboardController.getPatientsPerDoctor
);
router.get(
  "/date-statistics",
  validate({ query: dateStatisticsQuerySchema }),
  dashboardController.getDateStatistics
);

export default router;
