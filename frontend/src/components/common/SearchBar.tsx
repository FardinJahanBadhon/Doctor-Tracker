"use client";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

export function SearchBar({ value, onChange, placeholder = "Search…", debounceMs = 400 }: SearchBarProps) {
  const [local, setLocal] = useState(value);
  const [prevValue, setPrevValue] = useState(value);

  // Sync external resets (e.g. a "Clear filters" button) without a setState-in-effect lint violation.
  if (value !== prevValue) {
    setPrevValue(value);
    setLocal(value);
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (local !== value) onChange(local);
    }, debounceMs);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [local]);

  return (
    <div className="relative w-full max-w-xs">
      <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
      <Input
        type="text"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder={placeholder}
        className="pl-9"
      />
    </div>
  );
}
