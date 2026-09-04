import { Loader2 } from "lucide-react";

export function LoadingSpinner({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
      <Loader2 className="animate-spin" size={18} />
      <span className="text-sm">{label}</span>
    </div>
  );
}
