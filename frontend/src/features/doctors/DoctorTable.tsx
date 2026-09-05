import { memo } from "react";
import Link from "next/link";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TableRowActions } from "@/components/common/TableRowActions";
import { Doctor } from "@/types/doctor";
import { formatDate } from "@/utils/formatDate";
import { ROUTES } from "@/constants/routes";

interface DoctorTableProps {
  doctors: Doctor[];
  onEdit: (doctor: Doctor) => void;
  onDelete: (doctor: Doctor) => void;
}

function DoctorTableComponent({ doctors, onEdit, onDelete }: DoctorTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Specialization</TableHead>
            <TableHead className="hidden md:table-cell">Hospital</TableHead>
            <TableHead className="hidden lg:table-cell">Phone</TableHead>
            <TableHead className="hidden xl:table-cell">Email</TableHead>
            <TableHead className="hidden lg:table-cell">Added</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {doctors.map((doctor) => (
            <TableRow key={doctor._id}>
              <TableCell>
                <Link href={ROUTES.doctorDetails(doctor._id)} className="font-medium text-primary hover:underline">
                  {doctor.name}
                </Link>
                <p className="text-xs text-muted-foreground md:hidden">{doctor.hospital}</p>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">{doctor.specialization}</Badge>
              </TableCell>
              <TableCell className="hidden md:table-cell">{doctor.hospital}</TableCell>
              <TableCell className="hidden lg:table-cell">{doctor.phone}</TableCell>
              <TableCell className="hidden xl:table-cell">{doctor.email}</TableCell>
              <TableCell className="hidden lg:table-cell">{formatDate(doctor.createdAt)}</TableCell>
              <TableCell className="text-right">
                <TableRowActions
                  onEdit={() => onEdit(doctor)}
                  onDelete={() => onDelete(doctor)}
                  editLabel={`Edit ${doctor.name}`}
                  deleteLabel={`Delete ${doctor.name}`}
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
// reasons (opening a dialog, toggling delete confirmation) but `doctors`/`onEdit`/
// `onDelete` haven't actually changed.
export const DoctorTable = memo(DoctorTableComponent);
