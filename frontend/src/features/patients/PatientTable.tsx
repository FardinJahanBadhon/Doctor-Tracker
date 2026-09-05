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

function DoctorCell({ doctors }: { doctors: Patient["doctors"] }) {
  if (doctors.length === 0) {
    return <span className="text-muted-foreground">—</span>;
  }
  return (
    <div className="flex flex-wrap gap-x-1 gap-y-0.5">
      {doctors.map((doctor, index) => (
        <span key={doctor._id}>
          <Link href={ROUTES.doctorDetails(doctor._id)} className="text-primary hover:underline">
            {doctor.name}
          </Link>
          {index < doctors.length - 1 && ","}
        </span>
      ))}
    </div>
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
            {showDoctorColumn && <TableHead className="hidden md:table-cell">Doctor</TableHead>}
            <TableHead className="hidden lg:table-cell">Phone</TableHead>
            <TableHead className="hidden xl:table-cell">Email</TableHead>
            <TableHead className="hidden lg:table-cell">Added</TableHead>
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
                {showDoctorColumn && (
                  <p className="text-xs text-muted-foreground md:hidden">
                    {patient.doctors.length > 0 ? patient.doctors.map((d) => d.name).join(", ") : "No doctor assigned"}
                  </p>
                )}
              </TableCell>
              <TableCell>
                <Badge variant="secondary">{patient.condition}</Badge>
              </TableCell>
              {showDoctorColumn && (
                <TableCell className="hidden md:table-cell">
                  <DoctorCell doctors={patient.doctors} />
                </TableCell>
              )}
              <TableCell className="hidden lg:table-cell">{patient.phone}</TableCell>
              <TableCell className="hidden xl:table-cell">
                {patient.email || <span className="text-muted-foreground">—</span>}
              </TableCell>
              <TableCell className="hidden lg:table-cell">{formatDate(patient.createdAt)}</TableCell>
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
