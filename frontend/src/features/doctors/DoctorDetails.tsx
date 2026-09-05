"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Mail, Phone, Pencil, Trash2, Calendar, Building2, Plus, Users, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { DeleteConfirmationDialog } from "@/components/common/DeleteConfirmationDialog";
import { DoctorDialog } from "./DoctorDialog";
import { useGetDoctorQuery, useDeleteDoctorMutation } from "./doctorApi";
import { PatientTable } from "@/features/patients/PatientTable";
import { PatientDialog } from "@/features/patients/PatientDialog";
import { useGetDoctorPatientsQuery, useDeletePatientMutation } from "@/features/patients/patientApi";
import { Patient } from "@/types/patient";
import { formatDate } from "@/utils/formatDate";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { ROUTES } from "@/constants/routes";

// Search/filter/pagination for this scoped list is a later feature — a flat high limit
// keeps every patient of this doctor visible on one page for now.
const ALL_PATIENTS_LIMIT = 100;

export function DoctorDetails({ doctorId }: { doctorId: string }) {
  const { data: doctor, isLoading, isError, error: doctorError, refetch } = useGetDoctorQuery(doctorId);
  const [deleteDoctor, { isLoading: isDeletingDoctor }] = useDeleteDoctorMutation();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteDoctorOpen, setDeleteDoctorOpen] = useState(false);
  const router = useRouter();

  const {
    data: patientsData,
    isFetching: isFetchingPatients,
    isError: isPatientsError,
    error: patientsError,
    refetch: refetchPatients,
  } = useGetDoctorPatientsQuery({ doctorId, params: { limit: ALL_PATIENTS_LIMIT } });

  const [deletePatient, { isLoading: isDeletingPatient }] = useDeletePatientMutation();
  const [patientDialogOpen, setPatientDialogOpen] = useState(false);
  const [patientToEdit, setPatientToEdit] = useState<Patient | null>(null);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);

  const handleDeleteDoctor = async () => {
    if (!doctor) return;
    try {
      await deleteDoctor(doctor._id).unwrap();
      toast.success(`${doctor.name} was deleted.`);
      router.replace(ROUTES.doctors);
    } catch (error) {
      toast.error(getErrorMessage(error));
      setDeleteDoctorOpen(false);
    }
  };

  const openAddPatient = () => {
    setPatientToEdit(null);
    setPatientDialogOpen(true);
  };

  // Stable reference so PatientTable's React.memo isn't defeated by a fresh
  // function identity on every render.
  const openEditPatient = useCallback((patient: Patient) => {
    setPatientToEdit(patient);
    setPatientDialogOpen(true);
  }, []);

  const handleDeletePatient = async () => {
    if (!patientToDelete) return;
    try {
      await deletePatient(patientToDelete._id).unwrap();
      toast.success(`${patientToDelete.name} was removed.`);
      setPatientToDelete(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Link href={ROUTES.doctors} className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft size={16} /> Back to Doctors
      </Link>

      {isLoading && <Skeleton className="h-40 w-full" />}
      {isError && <ErrorState message={getErrorMessage(doctorError)} onRetry={() => refetch()} />}

      {!isLoading && !isError && doctor && (
        <>
          <Card>
            <CardContent className="flex flex-col gap-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:flex">
                    <Stethoscope size={26} />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight">{doctor.name}</h1>
                    <Badge variant="secondary" className="mt-1.5">
                      {doctor.specialization}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
                    <Pencil size={14} /> Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteDoctorOpen(true)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 size={14} /> Delete
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 size={16} />
                  {doctor.hospital}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone size={16} />
                  {doctor.phone}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail size={16} />
                  {doctor.email}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar size={16} />
                  Added {formatDate(doctor.createdAt)}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-muted-foreground" />
              <h2 className="text-lg font-semibold">Patients {patientsData ? `(${patientsData.total})` : ""}</h2>
            </div>
            <Button onClick={openAddPatient}>
              <Plus size={16} /> Add Patient
            </Button>
          </div>

          {isFetchingPatients && (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          )}

          {!isFetchingPatients && isPatientsError && (
            <ErrorState message={getErrorMessage(patientsError)} onRetry={() => refetchPatients()} />
          )}

          {!isFetchingPatients && !isPatientsError && patientsData && patientsData.patients.length === 0 && (
            <EmptyState message="No patients under this doctor yet." />
          )}

          {!isFetchingPatients && !isPatientsError && patientsData && patientsData.patients.length > 0 && (
            <Card>
              <CardContent>
                <PatientTable
                  patients={patientsData.patients}
                  onEdit={openEditPatient}
                  onDelete={setPatientToDelete}
                  showDoctorColumn={false}
                />
              </CardContent>
            </Card>
          )}

          <PatientDialog
            open={patientDialogOpen}
            onClose={() => setPatientDialogOpen(false)}
            patient={patientToEdit}
            lockedDoctor={doctor}
          />

          <DeleteConfirmationDialog
            open={Boolean(patientToDelete)}
            title="Remove Patient"
            description={`Are you sure you want to remove ${patientToDelete?.name} from ${doctor.name}'s patient list? This action cannot be undone.`}
            confirmLabel="Remove"
            isLoading={isDeletingPatient}
            onConfirm={handleDeletePatient}
            onCancel={() => setPatientToDelete(null)}
          />
        </>
      )}

      {doctor && <DoctorDialog open={editOpen} onClose={() => setEditOpen(false)} doctor={doctor} />}

      <DeleteConfirmationDialog
        open={deleteDoctorOpen}
        title="Delete Doctor"
        description={`Are you sure you want to delete ${doctor?.name}? This will also remove all of their patient records. This action cannot be undone.`}
        isLoading={isDeletingDoctor}
        onConfirm={handleDeleteDoctor}
        onCancel={() => setDeleteDoctorOpen(false)}
      />
    </div>
  );
}
