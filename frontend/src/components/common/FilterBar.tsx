import { ReactNode } from "react";

export function FilterBar({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-end gap-3">{children}</div>;
}
