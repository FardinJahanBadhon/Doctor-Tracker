export interface PatientDoctorSummary {
  _id: string;
  name: string;
  specialization: string;
  hospital: string;
}

export interface Patient {
  _id: string;
  name: string;
  // Populated on read. Optional/nullable to defend against legacy records that
  // predate this schema and have no `doctor` reference at all.
  doctor?: PatientDoctorSummary | null;
  condition: string;
  phone: string;
  email?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PatientInput {
  name: string;
  doctor: string;
  condition: string;
  phone: string;
  email?: string;
  address?: string;
}

export interface PatientListParams {
  search?: string;
  condition?: string;
  doctorId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedPatients {
  patients: Patient[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
