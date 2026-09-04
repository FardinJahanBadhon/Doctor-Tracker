"use client";

import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { DeleteConfirmationDialog } from "@/components/common/DeleteConfirmationDialog";
import { SearchBar } from "@/components/common/SearchBar";
import { FilterBar } from "@/components/common/FilterBar";
import { Pagination } from "@/components/common/Pagination";
import { PatientTable } from "@/features/patients/PatientTable";
import { PatientDialog } from "@/features/patients/PatientDialog";
import { useGetPatientsQuery, useDeletePatientMutation } from "@/features/patients/patientApi";
import { useGetDoctorsQuery } from "@/features/doctors/doctorApi";
import { Patient } from "@/types/patient";
import { getErrorMessage } from "@/utils/getErrorMessage";

const PAGE_SIZE = 10;
// Stands in for "all doctors" while populating the filter — Radix Select doesn't allow "" as an item value.
const ALL_DOCTORS_VALUE = "all";
// Fixed high limit for the doctor dropdown's own options list (not the patient list itself).
const ALL_DOCTORS_LIMIT = 100;

export default function PatientsPage() {
  const [search, setSearch] = useState("");
  const [condition, setCondition] = useState("");
  const [doctorId, setDoctorId] = useState(ALL_DOCTORS_VALUE);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [patientToEdit, setPatientToEdit] = useState<Patient | null>(null);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);

  const hasActiveFilters = Boolean(search || condition || doctorId !== ALL_DOCTORS_VALUE || dateFrom || dateTo);

  const params = useMemo(
    () => ({
      search: search || undefined,
      condition: condition || undefined,
      doctorId: doctorId === ALL_DOCTORS_VALUE ? undefined : doctorId,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      page,
      limit: PAGE_SIZE,
    }),
    [search, condition, doctorId, dateFrom, dateTo, page]
  );

  const { data, isFetching, isError, refetch } = useGetPatientsQuery(params);
  const { data: doctorsData } = useGetDoctorsQuery({ limit: ALL_DOCTORS_LIMIT });
  const [deletePatient, { isLoading: isDeleting }] = useDeletePatientMutation();

  // Any filter change should jump back to page 1 — a stale page number could point past the new result set.
  const resetToFirstPage = () => setPage(1);

  const clearFilters = () => {
    setSearch("");
    setCondition("");
    setDoctorId(ALL_DOCTORS_VALUE);
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  const openCreateDialog = () => {
    setPatientToEdit(null);
    setDialogOpen(true);
  };

  // Stable reference so PatientTable's React.memo isn't defeated by a fresh
  // function identity on every render.
  const openEditDialog = useCallback((patient: Patient) => {
    setPatientToEdit(patient);
    setDialogOpen(true);
  }, []);

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

      <FilterBar>
        <SearchBar
          value={search}
          onChange={(v) => {
            setSearch(v);
            resetToFirstPage();
          }}
          placeholder="Search by name, email, phone, condition…"
        />
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="condition-filter" className="text-xs text-muted-foreground">
            Condition
          </Label>
          <Input
            id="condition-filter"
            placeholder="e.g. Hypertension"
            value={condition}
            onChange={(e) => {
              setCondition(e.target.value);
              resetToFirstPage();
            }}
            className="w-40"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="doctor-filter" className="text-xs text-muted-foreground">
            Doctor
          </Label>
          <Select
            value={doctorId}
            onValueChange={(v) => {
              setDoctorId(v);
              resetToFirstPage();
            }}
          >
            <SelectTrigger id="doctor-filter" className="w-48">
              <SelectValue placeholder="All doctors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_DOCTORS_VALUE}>All doctors</SelectItem>
              {doctorsData?.doctors.map((doctor) => (
                <SelectItem key={doctor._id} value={doctor._id}>
                  {doctor.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="date-from" className="text-xs text-muted-foreground">
            Added from
          </Label>
          <Input
            id="date-from"
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value);
              resetToFirstPage();
            }}
            className="w-40"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="date-to" className="text-xs text-muted-foreground">
            Added to
          </Label>
          <Input
            id="date-to"
            type="date"
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value);
              resetToFirstPage();
            }}
            className="w-40"
          />
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X size={14} /> Clear filters
          </Button>
        )}
      </FilterBar>

      {isFetching && (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      )}

      {!isFetching && isError && <ErrorState message="Couldn't load patients." onRetry={() => refetch()} />}

      {!isFetching && !isError && data && data.patients.length === 0 && (
        <EmptyState
          message={
            hasActiveFilters
              ? "No patients match your search or filters."
              : "No patients yet. Add your first patient to get started."
          }
        />
      )}

      {!isFetching && !isError && data && data.patients.length > 0 && (
        <Card>
          <CardContent className="flex flex-col gap-4">
            <PatientTable patients={data.patients} onEdit={openEditDialog} onDelete={setPatientToDelete} />
            <Pagination page={data.page} totalPages={data.totalPages} total={data.total} limit={data.limit} onPageChange={setPage} />
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
