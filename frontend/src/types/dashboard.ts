export interface DashboardOverview {
  totalDoctors: number;
  totalPatients: number;
}

export interface PatientsPerDoctorRow {
  doctorId: string;
  doctorName: string;
  specialization: string;
  count: number;
}

export interface DateStatisticRow {
  date: string;
  doctorsAdded: number;
  patientsAdded: number;
}

export type DateRange = "7d" | "30d" | "12m";
