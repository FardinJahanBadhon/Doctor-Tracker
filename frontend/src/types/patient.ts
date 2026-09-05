export interface PatientDoctorSummary {
  _id: string;
  name: string;
  specialization: string;
  hospital: string;
}

export interface Patient {
  _id: string;
  name: string;
  // Populated on read.
  doctors: PatientDoctorSummary[];
  condition: string;
  phone: string;
  email?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PatientInput {
  name: string;
  doctors: string[];
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
