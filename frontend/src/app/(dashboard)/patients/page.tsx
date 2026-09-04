"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { DeleteConfirmationDialog } from "@/components/common/DeleteConfirmationDialog";
import { PatientTable } from "@/features/patients/PatientTable";
import { PatientDialog } from "@/features/patients/PatientDialog";
import { useGetPatientsQuery, useDeletePatientMutation } from "@/features/patients/patientApi";
import { Patient } from "@/types/patient";
import { getErrorMessage } from "@/utils/getErrorMessage";

// Search, filtering, and pagination controls are a later feature — for now, request
// a high enough limit that every patient is visible on this one page.
const ALL_PATIENTS_LIMIT = 100;

export default function PatientsPage() {
  const { data, isFetching, isError, refetch } = useGetPatientsQuery({ limit: ALL_PATIENTS_LIMIT });
  const [deletePatient, { isLoading: isDeleting }] = useDeletePatientMutation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [patientToEdit, setPatientToEdit] = useState<Patient | null>(null);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);

  const openCreateDialog = () => {
    setPatientToEdit(null);
    setDialogOpen(true);
  };

  const openEditDialog = (patient: Patient) => {
    setPatientToEdit(patient);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!patientToDelete) return;
    try {
      await deletePatient(patientToDelete._id).unwrap();
      toast.success(`${patientToDelete.name} was deleted.`);
      setPatientToDelete(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">Patients</h1>
          <p className="text-sm text-muted-foreground">Manage patient records.</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus size={16} /> Add Patient
        </Button>
      </div>

      {isFetching && (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      )}

      {!isFetching && isError && <ErrorState message="Couldn't load patients." onRetry={() => refetch()} />}

      {!isFetching && !isError && data && data.patients.length === 0 && (
        <EmptyState message="No patients yet. Add your first patient to get started." />
      )}

      {!isFetching && !isError && data && data.patients.length > 0 && (
        <Card>
          <CardContent>
            <PatientTable patients={data.patients} onEdit={openEditDialog} onDelete={setPatientToDelete} />
          </CardContent>
        </Card>
      )}

      <PatientDialog open={dialogOpen} onClose={() => setDialogOpen(false)} patient={patientToEdit} />

      <DeleteConfirmationDialog
        open={Boolean(patientToDelete)}
        title="Delete Patient"
        description={`Are you sure you want to delete ${patientToDelete?.name}? This action cannot be undone.`}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setPatientToDelete(null)}
      />
    </div>
  );
}
