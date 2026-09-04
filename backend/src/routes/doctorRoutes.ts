import { Router } from "express";
import * as doctorController from "../controllers/doctorController";
import { authenticate } from "../middleware/authenticate";
import { validate } from "../middleware/validate";
import {
  createDoctorSchema,
  updateDoctorSchema,
  doctorIdParamSchema,
  listDoctorsQuerySchema,
} from "../validators/doctorValidator";
import { listPatientsQuerySchema } from "../validators/patientValidator";

const router = Router();

// Only authenticated admins may access any doctor route.
router.use(authenticate);

router.post("/", validate({ body: createDoctorSchema }), doctorController.createDoctor);
router.get("/", validate({ query: listDoctorsQuerySchema }), doctorController.listDoctors);
router.get("/:id", validate({ params: doctorIdParamSchema }), doctorController.getDoctor);
router.put(
  "/:id",
  validate({ params: doctorIdParamSchema, body: updateDoctorSchema }),
  doctorController.updateDoctor
);
router.delete("/:id", validate({ params: doctorIdParamSchema }), doctorController.deleteDoctor);

// Nested resource: GET /api/doctors/:id/patients — the patients belonging to this doctor.
router.get(
  "/:id/patients",
  validate({ params: doctorIdParamSchema, query: listPatientsQuerySchema }),
  doctorController.listDoctorPatients
);

export default router;
