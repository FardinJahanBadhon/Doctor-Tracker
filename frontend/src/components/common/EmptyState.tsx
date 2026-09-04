import { ReactNode } from "react";
import { Inbox } from "lucide-react";

export function EmptyState({ message, action }: { message: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16 text-center text-muted-foreground">
      <Inbox size={28} />
      <p className="text-sm">{message}</p>
      {action}
    </div>
  );
}
