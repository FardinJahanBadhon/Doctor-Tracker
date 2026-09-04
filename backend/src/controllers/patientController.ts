import { Request, Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import * as patientService from "../services/patientService";

export const createPatient = asyncHandler(async (req: Request, res: Response) => {
  const patient = await patientService.createPatient(req.body);
  res.status(201).json({ success: true, patient });
});

export const listPatients = asyncHandler(async (req: Request, res: Response) => {
  const { patients, meta } = await patientService.listPatients(req);
  res.status(200).json({ success: true, patients, ...meta });
});

export const getPatient = asyncHandler(async (req: Request, res: Response) => {
  const patient = await patientService.getPatientById(req.params.id);
  res.status(200).json({ success: true, patient });
});

export const updatePatient = asyncHandler(async (req: Request, res: Response) => {
  const patient = await patientService.updatePatient(req.params.id, req.body);
  res.status(200).json({ success: true, patient });
});

export const deletePatient = asyncHandler(async (req: Request, res: Response) => {
  await patientService.deletePatient(req.params.id);
  res.status(200).json({ success: true, message: "Patient deleted successfully" });
});
