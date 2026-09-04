"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { useGetDoctorsQuery } from "./doctorApi";

interface DoctorComboboxProps {
  value?: string;
  onChange: (doctorId: string) => void;
  error?: boolean;
}

// A fixed high limit stands in for "all doctors" here — this project doesn't yet
// paginate/search the doctor list from within this picker (out of scope for this feature).
const ALL_DOCTORS_LIMIT = 100;

export function DoctorCombobox({ value, onChange, error }: DoctorComboboxProps) {
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useGetDoctorsQuery({ limit: ALL_DOCTORS_LIMIT });
  const doctors = data?.doctors ?? [];
  const selected = doctors.find((d) => d._id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-invalid={error}
          className="w-full justify-between font-normal"
        >
          {isLoading ? (
            <span className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="animate-spin" size={14} /> Loading doctors…
            </span>
          ) : selected ? (
            `${selected.name} — ${selected.specialization}`
          ) : (
            <span className="text-muted-foreground">Select a doctor…</span>
          )}
          <ChevronsUpDown className="opacity-50" size={16} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
        <Command>
          <CommandInput placeholder="Search doctors by name, specialization…" />
          <CommandList>
            <CommandEmpty>No doctor found.</CommandEmpty>
            <CommandGroup>
              {doctors.map((doctor) => (
                <CommandItem
                  key={doctor._id}
                  value={`${doctor.name} ${doctor.specialization} ${doctor.hospital}`}
                  onSelect={() => {
                    onChange(doctor._id);
                    setOpen(false);
                  }}
                >
                  <Check className={cn("mr-2", doctor._id === value ? "opacity-100" : "opacity-0")} size={16} />
                  <div className="flex flex-col">
                    <span>{doctor.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {doctor.specialization} · {doctor.hospital}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
