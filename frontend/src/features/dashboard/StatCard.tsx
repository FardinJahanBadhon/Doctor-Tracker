import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  label: string;
  value: number | undefined;
  icon: LucideIcon;
  accent?: string;
  isLoading?: boolean;
  isError?: boolean;
}

export function StatCard({ label, value, icon: Icon, accent = "#2a78d6", isLoading, isError }: StatCardProps) {
  return (
    <Card className="relative overflow-hidden shadow-xs transition-shadow hover:shadow-sm">
      <div className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: accent }} />
      <CardContent className="flex items-center gap-4">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${accent}1a`, color: accent }}
        >
          <Icon size={24} />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          {isLoading ? (
            <Skeleton className="mt-1.5 h-8 w-16" />
          ) : isError ? (
            <p className="text-sm text-destructive">Unavailable</p>
          ) : (
            <p className="text-3xl font-bold tracking-tight text-foreground">{value?.toLocaleString() ?? "—"}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
