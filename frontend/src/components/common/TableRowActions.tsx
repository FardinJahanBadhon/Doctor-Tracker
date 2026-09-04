import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TableRowActionsProps {
  onEdit: () => void;
  onDelete: () => void;
  editLabel: string;
  deleteLabel: string;
}

/** The edit/delete icon-button pair used by every data table (Doctors, Patients). */
export function TableRowActions({ onEdit, onDelete, editLabel, deleteLabel }: TableRowActionsProps) {
  return (
    <div className="flex justify-end gap-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={onEdit}
        aria-label={editLabel}
        className="text-muted-foreground hover:bg-primary/10 hover:text-primary"
      >
        <Pencil size={16} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onDelete}
        aria-label={deleteLabel}
        className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
      >
        <Trash2 size={16} />
      </Button>
    </div>
  );
}
