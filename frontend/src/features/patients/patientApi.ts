import { apiSlice } from "@/store/api/apiSlice";
import { Patient, PatientInput, PatientListParams, PaginatedPatients } from "@/types/patient";
import { buildQueryString } from "@/utils/buildQueryString";

interface PatientResponse {
  success: boolean;
  patient: Patient;
}

interface PatientListResponse {
  success: boolean;
  patients: Patient[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const patientApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPatients: builder.query<PaginatedPatients, PatientListParams>({
      query: (params) => `/patients${buildQueryString(params)}`,
      transformResponse: (response: PatientListResponse) => ({
        patients: response.patients,
        total: response.total,
        page: response.page,
        limit: response.limit,
        totalPages: response.totalPages,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.patients.map((p) => ({ type: "Patient" as const, id: p._id })),
              { type: "Patient" as const, id: "LIST" },
            ]
          : [{ type: "Patient" as const, id: "LIST" }],
    }),

    getPatient: builder.query<Patient, string>({
      query: (id) => `/patients/${id}`,
      transformResponse: (response: PatientResponse) => response.patient,
      providesTags: (_result, _error, id) => [{ type: "Patient", id }],
    }),

    // Patients belonging to one doctor — GET /api/doctors/:doctorId/patients.
    // Shares the "Patient" LIST tag with getPatients, so any create/update/delete
    // (from anywhere in the app) invalidates this too — no separate bookkeeping needed.
    getDoctorPatients: builder.query<PaginatedPatients, { doctorId: string; params?: PatientListParams }>({
      query: ({ doctorId, params }) => `/doctors/${doctorId}/patients${buildQueryString(params ?? {})}`,
      transformResponse: (response: PatientListResponse) => ({
        patients: response.patients,
        total: response.total,
        page: response.page,
        limit: response.limit,
        totalPages: response.totalPages,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.patients.map((p) => ({ type: "Patient" as const, id: p._id })),
              { type: "Patient" as const, id: "LIST" },
            ]
          : [{ type: "Patient" as const, id: "LIST" }],
    }),

    createPatient: builder.mutation<Patient, PatientInput>({
      query: (body) => ({ url: "/patients", method: "POST", body }),
      transformResponse: (response: PatientResponse) => response.patient,
      invalidatesTags: [{ type: "Patient", id: "LIST" }],
    }),

    updatePatient: builder.mutation<Patient, { id: string; body: Partial<PatientInput> }>({
      query: ({ id, body }) => ({ url: `/patients/${id}`, method: "PUT", body }),
      transformResponse: (response: PatientResponse) => response.patient,
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Patient", id },
        { type: "Patient", id: "LIST" },
      ],
    }),

    deletePatient: builder.mutation<void, string>({
      query: (id) => ({ url: `/patients/${id}`, method: "DELETE" }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Patient", id },
        { type: "Patient", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetPatientsQuery,
  useGetPatientQuery,
  useGetDoctorPatientsQuery,
  useCreatePatientMutation,
  useUpdatePatientMutation,
  useDeletePatientMutation,
} = patientApi;
