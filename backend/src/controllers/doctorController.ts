import { Request, Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import * as doctorService from "../services/doctorService";
import * as patientService from "../services/patientService";

export const createDoctor = asyncHandler(async (req: Request, res: Response) => {
  const doctor = await doctorService.createDoctor(req.body);
  res.status(201).json({ success: true, doctor });
});

export const listDoctors = asyncHandler(async (req: Request, res: Response) => {
  const { doctors, meta } = await doctorService.listDoctors(req);
  res.status(200).json({ success: true, doctors, ...meta });
});

export const getDoctor = asyncHandler(async (req: Request, res: Response) => {
  const doctor = await doctorService.getDoctorById(req.params.id);
  res.status(200).json({ success: true, doctor });
});

export const updateDoctor = asyncHandler(async (req: Request, res: Response) => {
  const doctor = await doctorService.updateDoctor(req.params.id, req.body);
  res.status(200).json({ success: true, doctor });
});

export const deleteDoctor = asyncHandler(async (req: Request, res: Response) => {
  await doctorService.deleteDoctor(req.params.id);
  res.status(200).json({ success: true, message: "Doctor deleted successfully" });
});

export const listDoctorPatients = asyncHandler(async (req: Request, res: Response) => {
  const { patients, meta } = await patientService.listPatientsForDoctor(req.params.id, req);
  res.status(200).json({ success: true, patients, ...meta });
});
