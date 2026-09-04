"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { DeleteConfirmationDialog } from "@/components/common/DeleteConfirmationDialog";
import { SearchBar } from "@/components/common/SearchBar";
import { FilterBar } from "@/components/common/FilterBar";
import { Pagination } from "@/components/common/Pagination";
import { DoctorTable } from "@/features/doctors/DoctorTable";
import { DoctorDialog } from "@/features/doctors/DoctorDialog";
import { useGetDoctorsQuery, useDeleteDoctorMutation } from "@/features/doctors/doctorApi";
import { Doctor } from "@/types/doctor";
import { getErrorMessage } from "@/utils/getErrorMessage";

const PAGE_SIZE = 10;

export default function DoctorsPage() {
  const [search, setSearch] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [hospital, setHospital] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [doctorToEdit, setDoctorToEdit] = useState<Doctor | null>(null);
  const [doctorToDelete, setDoctorToDelete] = useState<Doctor | null>(null);

  const hasActiveFilters = Boolean(search || specialization || hospital || dateFrom || dateTo);

  const params = useMemo(
    () => ({
      search: search || undefined,
      specialization: specialization || undefined,
      hospital: hospital || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      page,
      limit: PAGE_SIZE,
    }),
    [search, specialization, hospital, dateFrom, dateTo, page]
  );

  const { data, isFetching, isError, refetch } = useGetDoctorsQuery(params);
  const [deleteDoctor, { isLoading: isDeleting }] = useDeleteDoctorMutation();

  // Any filter change should jump back to page 1 — a stale page number could point past the new result set.
  const resetToFirstPage = () => setPage(1);

  const clearFilters = () => {
    setSearch("");
    setSpecialization("");
    setHospital("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  const openCreateDialog = () => {
    setDoctorToEdit(null);
    setDialogOpen(true);
  };

  const openEditDialog = (doctor: Doctor) => {
    setDoctorToEdit(doctor);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!doctorToDelete) return;
    try {
      await deleteDoctor(doctorToDelete._id).unwrap();
      toast.success(`${doctorToDelete.name} was deleted.`);
      setDoctorToDelete(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">Doctors</h1>
          <p className="text-sm text-muted-foreground">Manage doctor profiles.</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus size={16} /> Add Doctor
        </Button>
      </div>

      <FilterBar>
        <SearchBar
          value={search}
          onChange={(v) => {
            setSearch(v);
            resetToFirstPage();
          }}
          placeholder="Search by name, specialization, hospital, email…"
        />
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="specialization-filter" className="text-xs text-muted-foreground">
            Specialization
          </Label>
          <Input
            id="specialization-filter"
            placeholder="e.g. Cardiology"
            value={specialization}
            onChange={(e) => {
              setSpecialization(e.target.value);
              resetToFirstPage();
            }}
            className="w-40"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="hospital-filter" className="text-xs text-muted-foreground">
            Hospital
          </Label>
          <Input
            id="hospital-filter"
            placeholder="e.g. City General"
            value={hospital}
            onChange={(e) => {
              setHospital(e.target.value);
              resetToFirstPage();
            }}
            className="w-40"
          />
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

      {!isFetching && isError && <ErrorState message="Couldn't load doctors." onRetry={() => refetch()} />}

      {!isFetching && !isError && data && data.doctors.length === 0 && (
        <EmptyState
          message={
            hasActiveFilters
              ? "No doctors match your search or filters."
              : "No doctors yet. Add your first doctor to get started."
          }
        />
      )}

      {!isFetching && !isError && data && data.doctors.length > 0 && (
        <Card>
          <CardContent className="flex flex-col gap-4">
            <DoctorTable doctors={data.doctors} onEdit={openEditDialog} onDelete={setDoctorToDelete} />
            <Pagination page={data.page} totalPages={data.totalPages} total={data.total} limit={data.limit} onPageChange={setPage} />
          </CardContent>
        </Card>
      )}

      <DoctorDialog open={dialogOpen} onClose={() => setDialogOpen(false)} doctor={doctorToEdit} />

      <DeleteConfirmationDialog
        open={Boolean(doctorToDelete)}
        title="Delete Doctor"
        description={`Are you sure you want to delete ${doctorToDelete?.name}? This action cannot be undone.`}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDoctorToDelete(null)}
      />
    </div>
  );
}
