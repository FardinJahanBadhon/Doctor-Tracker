"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DoctorForm } from "./DoctorForm";
import { useCreateDoctorMutation, useUpdateDoctorMutation } from "./doctorApi";
import { Doctor, DoctorInput } from "@/types/doctor";
import { getErrorMessage } from "@/utils/getErrorMessage";

interface DoctorDialogProps {
  open: boolean;
  onClose: () => void;
  doctor?: Doctor | null;
}

export function DoctorDialog({ open, onClose, doctor }: DoctorDialogProps) {
  const isEdit = Boolean(doctor);
  const [createDoctor, { isLoading: isCreating }] = useCreateDoctorMutation();
  const [updateDoctor, { isLoading: isUpdating }] = useUpdateDoctorMutation();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isSubmitting = isCreating || isUpdating;

  const handleSubmit = async (values: DoctorInput) => {
    setSubmitError(null);
    try {
      if (isEdit && doctor) {
        await updateDoctor({ id: doctor._id, body: values }).unwrap();
        toast.success(`${values.name} was updated.`);
      } else {
        await createDoctor(values).unwrap();
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Doctor" : "Add Doctor"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update this doctor's profile details." : "Add a new doctor profile to the system."}
          </DialogDescription>
        </DialogHeader>
        <DoctorForm
          defaultValues={doctor ?? undefined}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitError={submitError}
          submitLabel={isEdit ? "Save Changes" : "Create Doctor"}
        />
      </DialogContent>
    </Dialog>
  );
}
