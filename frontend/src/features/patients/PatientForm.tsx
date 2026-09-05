"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DoctorMultiCombobox } from "@/features/doctors/DoctorMultiCombobox";
import { Patient, PatientInput, PatientDoctorSummary } from "@/types/patient";

// Mirrors the backend's patientValidator.ts exactly.
const patientSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  doctors: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).min(1, "Select at least one doctor"),
  condition: z.string().trim().min(2, "Condition must be at least 2 characters").max(150),
  phone: z
    .string()
    .trim()
    .min(6, "Phone must be at least 6 characters")
    .max(20)
    .regex(/^[0-9+\-() ]+$/, "Phone can only contain digits, spaces, and + - ( )"),
  email: z.string().trim().toLowerCase().email("Enter a valid email address").optional().or(z.literal("")),
  address: z.string().trim().max(250).optional().or(z.literal("")),
});

export type PatientFormValues = z.infer<typeof patientSchema>;

interface PatientFormProps {
  defaultValues?: Partial<Patient>;
  /** When set, this doctor is always included and can't be removed — used when adding a
   *  patient from that doctor's own details page, so the patient stays associated with the
   *  doctor already in view while still allowing more doctors to be added. */
  lockedDoctor?: PatientDoctorSummary;
  onSubmit: (values: PatientInput) => void;
  isSubmitting?: boolean;
  submitError?: string | null;
  submitLabel?: string;
}

export function PatientForm({
  defaultValues,
  lockedDoctor,
  onSubmit,
  isSubmitting,
  submitError,
  submitLabel = "Save",
}: PatientFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      doctors: lockedDoctor
        ? Array.from(new Set([lockedDoctor._id, ...(defaultValues?.doctors?.map((d) => d._id) ?? [])]))
        : (defaultValues?.doctors?.map((d) => d._id) ?? []),
      condition: defaultValues?.condition ?? "",
      phone: defaultValues?.phone ?? "",
      email: defaultValues?.email ?? "",
      address: defaultValues?.address ?? "",
    },
  });

  const submit = (values: PatientFormValues) => {
    onSubmit({
      ...values,
      email: values.email || undefined,
      address: values.address || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="flex flex-col gap-4">
      {submitError && (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" placeholder="John Smith" aria-invalid={Boolean(errors.name)} {...register("name")} />
        {errors.name && <span className="text-xs text-destructive">{errors.name.message}</span>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="doctors">Doctors</Label>
        <Controller
          control={control}
          name="doctors"
          render={({ field }) => (
            <DoctorMultiCombobox
              value={field.value}
              onChange={field.onChange}
              error={Boolean(errors.doctors)}
              lockedIds={lockedDoctor ? [lockedDoctor._id] : undefined}
            />
          )}
        />
        {errors.doctors && <span className="text-xs text-destructive">{errors.doctors.message}</span>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="condition">Condition</Label>
        <Input
          id="condition"
          placeholder="Hypertension"
          aria-invalid={Boolean(errors.condition)}
          {...register("condition")}
        />
        {errors.condition && <span className="text-xs text-destructive">{errors.condition.message}</span>}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" placeholder="+1-555-0100" aria-invalid={Boolean(errors.phone)} {...register("phone")} />
          {errors.phone && <span className="text-xs text-destructive">{errors.phone.message}</span>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email (optional)</Label>
          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
            aria-invalid={Boolean(errors.email)}
            {...register("email")}
          />
          {errors.email && <span className="text-xs text-destructive">{errors.email.message}</span>}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="address">Address (optional)</Label>
        <Input id="address" placeholder="123 Main St" aria-invalid={Boolean(errors.address)} {...register("address")} />
        {errors.address && <span className="text-xs text-destructive">{errors.address.message}</span>}
      </div>

      <Button type="submit" disabled={isSubmitting} className="mt-2">
        {isSubmitting && <Loader2 className="animate-spin" />}
        {isSubmitting ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
