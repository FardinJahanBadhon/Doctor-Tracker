import { memo } from "react";
import Link from "next/link";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TableRowActions } from "@/components/common/TableRowActions";
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

function PatientTableComponent({ patients, onEdit, onDelete, showDoctorColumn = true }: PatientTableProps) {
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
                <TableRowActions
                  onEdit={() => onEdit(patient)}
                  onDelete={() => onDelete(patient)}
                  editLabel={`Edit ${patient.name}`}
                  deleteLabel={`Delete ${patient.name}`}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// Skips re-rendering the whole table when the parent page re-renders for unrelated
// reasons (opening a dialog, toggling delete confirmation) but `patients`/`onEdit`/
// `onDelete` haven't actually changed.
export const PatientTable = memo(PatientTableComponent);
