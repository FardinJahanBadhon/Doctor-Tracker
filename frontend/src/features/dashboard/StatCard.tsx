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
    <Card>
      <CardContent className="flex items-center gap-4">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${accent}1a`, color: accent }}
        >
          <Icon size={22} />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          {isLoading ? (
            <Skeleton className="mt-1 h-8 w-16" />
          ) : isError ? (
            <p className="text-sm text-destructive">Unavailable</p>
          ) : (
            <p className="text-2xl font-semibold text-foreground">{value?.toLocaleString() ?? "—"}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
