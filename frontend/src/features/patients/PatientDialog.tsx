"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PatientForm } from "./PatientForm";
import { useCreatePatientMutation, useUpdatePatientMutation } from "./patientApi";
import { Patient, PatientInput, PatientDoctorSummary } from "@/types/patient";
import { getErrorMessage } from "@/utils/getErrorMessage";

interface PatientDialogProps {
  open: boolean;
  onClose: () => void;
  patient?: Patient | null;
  /** Fixes the doctor field to this doctor — see PatientForm's `lockedDoctor` prop. */
  lockedDoctor?: PatientDoctorSummary;
}

export function PatientDialog({ open, onClose, patient, lockedDoctor }: PatientDialogProps) {
  const isEdit = Boolean(patient);
  const [createPatient, { isLoading: isCreating }] = useCreatePatientMutation();
  const [updatePatient, { isLoading: isUpdating }] = useUpdatePatientMutation();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isSubmitting = isCreating || isUpdating;

  const handleSubmit = async (values: PatientInput) => {
    setSubmitError(null);
    try {
      if (isEdit && patient) {
        await updatePatient({ id: patient._id, body: values }).unwrap();
        toast.success(`${values.name} was updated.`);
      } else {
        await createPatient(values).unwrap();
        toast.success(`${values.name} was added.`);
      }
      onClose();
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setSubmitError(null);
          onClose();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Patient" : lockedDoctor ? `Add Patient to ${lockedDoctor.name}` : "Add Patient"}</DialogTitle>
        </DialogHeader>
        <PatientForm
          defaultValues={patient ?? undefined}
          lockedDoctor={isEdit ? undefined : lockedDoctor}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitError={submitError}
          submitLabel={isEdit ? "Save Changes" : "Create Patient"}
        />
      </DialogContent>
    </Dialog>
  );
}
