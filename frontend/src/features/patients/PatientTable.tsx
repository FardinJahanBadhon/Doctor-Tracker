import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Patient } from "@/types/patient";
import { formatDate } from "@/utils/formatDate";
import { ROUTES } from "@/constants/routes";

interface PatientTableProps {
  patients: Patient[];
  onEdit: (patient: Patient) => void;
  onDelete: (patient: Patient) => void;
  /** Hide the Doctor column when the table is already scoped to one doctor (e.g. on that doctor's own page). */
  showDoctorColumn?: boolean;
}

function DoctorCell({ doctor }: { doctor: Patient["doctor"] }) {
  if (!doctor) {
    return <span className="text-muted-foreground">—</span>;
  }
  return (
    <Link href={ROUTES.doctorDetails(doctor._id)} className="text-primary hover:underline">
      {doctor.name}
    </Link>
  );
}

export function PatientTable({ patients, onEdit, onDelete, showDoctorColumn = true }: PatientTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Condition</TableHead>
            {showDoctorColumn && <TableHead>Doctor</TableHead>}
            <TableHead>Phone</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Added</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.map((patient) => (
            <TableRow key={patient._id}>
              <TableCell>
                <Link href={ROUTES.patientDetails(patient._id)} className="font-medium text-primary hover:underline">
                  {patient.name}
                </Link>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">{patient.condition}</Badge>
              </TableCell>
              {showDoctorColumn && (
                <TableCell>
                  <DoctorCell doctor={patient.doctor} />
                </TableCell>
              )}
              <TableCell>{patient.phone}</TableCell>
              <TableCell>{patient.email || <span className="text-muted-foreground">—</span>}</TableCell>
              <TableCell>{formatDate(patient.createdAt)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(patient)}
                    aria-label={`Edit ${patient.name}`}
                    className="text-muted-foreground hover:bg-primary/10 hover:text-primary"
                  >
                    <Pencil size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(patient)}
                    aria-label={`Delete ${patient.name}`}
                    className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
