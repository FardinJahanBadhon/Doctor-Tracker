"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Doctor, DoctorInput } from "@/types/doctor";

// Mirrors the backend's doctorValidator.ts exactly, so client-side errors
// match what the API would reject before a request is ever sent.
const doctorSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  specialization: z.string().trim().min(2, "Specialization must be at least 2 characters").max(100),
  hospital: z.string().trim().min(2, "Hospital must be at least 2 characters").max(150),
  phone: z
    .string()
    .trim()
    .min(6, "Phone must be at least 6 characters")
    .max(20)
    .regex(/^[0-9+\-() ]+$/, "Phone can only contain digits, spaces, and + - ( )"),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
});

export type DoctorFormValues = z.infer<typeof doctorSchema>;

interface DoctorFormProps {
  defaultValues?: Partial<Doctor>;
  onSubmit: (values: DoctorInput) => void;
  isSubmitting?: boolean;
  submitError?: string | null;
  submitLabel?: string;
}

export function DoctorForm({ defaultValues, onSubmit, isSubmitting, submitError, submitLabel = "Save" }: DoctorFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      specialization: defaultValues?.specialization ?? "",
      hospital: defaultValues?.hospital ?? "",
      phone: defaultValues?.phone ?? "",
      email: defaultValues?.email ?? "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      {submitError && (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" placeholder="Dr. Jane Doe" aria-invalid={Boolean(errors.name)} {...register("name")} />
        {errors.name && <span className="text-xs text-destructive">{errors.name.message}</span>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="specialization">Specialization</Label>
        <Input
          id="specialization"
          placeholder="Cardiology"
          aria-invalid={Boolean(errors.specialization)}
          {...register("specialization")}
        />
        {errors.specialization && <span className="text-xs text-destructive">{errors.specialization.message}</span>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="hospital">Hospital</Label>
        <Input
          id="hospital"
          placeholder="City General Hospital"
          aria-invalid={Boolean(errors.hospital)}
          {...register("hospital")}
        />
        {errors.hospital && <span className="text-xs text-destructive">{errors.hospital.message}</span>}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" placeholder="+1-555-0100" aria-invalid={Boolean(errors.phone)} {...register("phone")} />
          {errors.phone && <span className="text-xs text-destructive">{errors.phone.message}</span>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="jane@hospital.com"
            aria-invalid={Boolean(errors.email)}
            {...register("email")}
          />
          {errors.email && <span className="text-xs text-destructive">{errors.email.message}</span>}
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting} className="mt-2">
        {isSubmitting && <Loader2 className="animate-spin" />}
        {isSubmitting ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
