export interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export type DoctorInput = {
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
};

export interface DoctorListParams {
  search?: string;
  specialization?: string;
  hospital?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedDoctors {
  doctors: Doctor[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
