import { Router } from "express";
import * as patientController from "../controllers/patientController";
import { authenticate } from "../middleware/authenticate";
import { validate } from "../middleware/validate";
import {
  createPatientSchema,
  updatePatientSchema,
  patientIdParamSchema,
  listPatientsQuerySchema,
} from "../validators/patientValidator";

const router = Router();

// Only authenticated admins may access any patient route.
router.use(authenticate);

router.post("/", validate({ body: createPatientSchema }), patientController.createPatient);
router.get("/", validate({ query: listPatientsQuerySchema }), patientController.listPatients);
router.get("/:id", validate({ params: patientIdParamSchema }), patientController.getPatient);
router.put(
  "/:id",
  validate({ params: patientIdParamSchema, body: updatePatientSchema }),
  patientController.updatePatient
);
router.delete("/:id", validate({ params: patientIdParamSchema }), patientController.deletePatient);

export default router;
