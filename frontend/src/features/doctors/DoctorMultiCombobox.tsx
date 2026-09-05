"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

interface DoctorMultiComboboxProps {
  value: string[];
  onChange: (doctorIds: string[]) => void;
  error?: boolean;
  /** Doctor ids that are always included and can't be removed from the selection — used when
   *  adding a patient from that doctor's own page, so the current doctor stays assigned while
   *  the admin can still add others. */
  lockedIds?: string[];
}

// A fixed high limit stands in for "all doctors" here — this project doesn't yet
// paginate/search the doctor list from within this picker (out of scope for this feature).
const ALL_DOCTORS_LIMIT = 100;

export function DoctorMultiCombobox({ value, onChange, error, lockedIds = [] }: DoctorMultiComboboxProps) {
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useGetDoctorsQuery({ limit: ALL_DOCTORS_LIMIT });
  const doctors = data?.doctors ?? [];
  const selected = doctors.filter((d) => value.includes(d._id));

  const toggle = (doctorId: string) => {
    if (lockedIds.includes(doctorId)) return;
    onChange(value.includes(doctorId) ? value.filter((id) => id !== doctorId) : [...value, doctorId]);
  };

  return (
    <div className="flex flex-col gap-2">
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
            ) : selected.length > 0 ? (
              `${selected.length} doctor${selected.length > 1 ? "s" : ""} selected`
            ) : (
              <span className="text-muted-foreground">Select doctors…</span>
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
                {doctors.map((doctor) => {
                  const isSelected = value.includes(doctor._id);
                  return (
                    <CommandItem
                      key={doctor._id}
                      value={`${doctor.name} ${doctor.specialization} ${doctor.hospital}`}
                      onSelect={() => toggle(doctor._id)}
                    >
                      <Check className={cn("mr-2", isSelected ? "opacity-100" : "opacity-0")} size={16} />
                      <div className="flex flex-col">
                        <span>{doctor.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {doctor.specialization} · {doctor.hospital}
                        </span>
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((doctor) => (
            <Badge key={doctor._id} variant="secondary" className="gap-1 pr-1">
              {doctor.name}
              {!lockedIds.includes(doctor._id) && (
                <button
                  type="button"
                  onClick={() => toggle(doctor._id)}
                  className="rounded-full p-0.5 hover:bg-muted-foreground/20"
                  aria-label={`Remove ${doctor.name}`}
                >
                  <X size={12} />
                </button>
              )}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
