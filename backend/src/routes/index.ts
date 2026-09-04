import { Router } from "express";
import healthRoutes from "./healthRoutes";
import authRoutes from "./authRoutes";
import doctorRoutes from "./doctorRoutes";
import patientRoutes from "./patientRoutes";
import dashboardRoutes from "./dashboardRoutes";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/doctors", doctorRoutes);
router.use("/patients", patientRoutes);
router.use("/dashboard", dashboardRoutes);

export default router;
