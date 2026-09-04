export const ROUTES = {
  login: "/login",
  dashboard: "/dashboard",
  doctors: "/doctors",
  doctorDetails: (id: string) => `/doctors/${id}`,
  patients: "/patients",
  patientDetails: (id: string) => `/patients/${id}`,
} as const;
