import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Doctor } from "@/types/doctor";
import { formatDate } from "@/utils/formatDate";
import { ROUTES } from "@/constants/routes";

interface DoctorTableProps {
  doctors: Doctor[];
  onEdit: (doctor: Doctor) => void;
  onDelete: (doctor: Doctor) => void;
}

export function DoctorTable({ doctors, onEdit, onDelete }: DoctorTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Specialization</TableHead>
            <TableHead>Hospital</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Added</TableHead>
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
              </TableCell>
              <TableCell>
                <Badge variant="secondary">{doctor.specialization}</Badge>
              </TableCell>
              <TableCell>{doctor.hospital}</TableCell>
              <TableCell>{doctor.phone}</TableCell>
              <TableCell>{doctor.email}</TableCell>
              <TableCell>{formatDate(doctor.createdAt)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(doctor)}
                    aria-label={`Edit ${doctor.name}`}
                    className="text-muted-foreground hover:bg-primary/10 hover:text-primary"
                  >
                    <Pencil size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(doctor)}
                    aria-label={`Delete ${doctor.name}`}
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
