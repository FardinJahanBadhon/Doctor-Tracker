"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Mail, Phone, MapPin, Pencil, Trash2, Calendar, Stethoscope, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { DeleteConfirmationDialog } from "@/components/common/DeleteConfirmationDialog";
import { PatientDialog } from "./PatientDialog";
import { useGetPatientQuery, useDeletePatientMutation } from "./patientApi";
import { formatDate } from "@/utils/formatDate";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { ROUTES } from "@/constants/routes";

export function PatientDetails({ patientId }: { patientId: string }) {
  const { data: patient, isLoading, isError, error: patientError, refetch } = useGetPatientQuery(patientId);
  const [deletePatient, { isLoading: isDeleting }] = useDeletePatientMutation();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!patient) return;
    try {
      await deletePatient(patient._id).unwrap();
      toast.success(`${patient.name} was deleted.`);
      router.replace(ROUTES.patients);
    } catch (error) {
      toast.error(getErrorMessage(error));
      setDeleteOpen(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Link href={ROUTES.patients} className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft size={16} /> Back to Patients
      </Link>

      {isLoading && <Skeleton className="h-40 w-full" />}
      {isError && <ErrorState message={getErrorMessage(patientError)} onRetry={() => refetch()} />}

      {!isLoading && !isError && patient && (
        <Card>
          <CardContent className="flex flex-col gap-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:flex">
                  <UserRound size={26} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">{patient.name}</h1>
                  <Badge variant="secondary" className="mt-1.5">
                    {patient.condition}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
                  <Pencil size={14} /> Edit
                </Button>
                <Button variant="outline" size="sm" onClick={() => setDeleteOpen(true)} className="text-destructive hover:text-destructive">
                  <Trash2 size={14} /> Delete
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
              <div className="flex items-start gap-2 text-muted-foreground sm:col-span-2">
                <Stethoscope size={16} className="mt-0.5 shrink-0" />
                {patient.doctors.length > 0 ? (
                  <div className="flex flex-wrap gap-x-1.5 gap-y-1">
                    {patient.doctors.map((doctor, index) => (
                      <span key={doctor._id}>
                        <Link href={ROUTES.doctorDetails(doctor._id)} className="text-primary hover:underline">
                          {doctor.name} — {doctor.specialization}
                        </Link>
                        {index < patient.doctors.length - 1 && ","}
                      </span>
                    ))}
                  </div>
                ) : (
                  "No doctor assigned"
                )}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone size={16} />
                {patient.phone}
              </div>
              {patient.email && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail size={16} />
                  {patient.email}
                </div>
              )}
              {patient.address && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin size={16} />
                  {patient.address}
                </div>
              )}
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar size={16} />
                Added {formatDate(patient.createdAt)}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {patient && <PatientDialog open={editOpen} onClose={() => setEditOpen(false)} patient={patient} />}

      <DeleteConfirmationDialog
        open={deleteOpen}
        title="Delete Patient"
        description={`Are you sure you want to delete ${patient?.name}? This action cannot be undone.`}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
}
