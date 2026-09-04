import { apiSlice } from "@/store/api/apiSlice";
import { Doctor, DoctorInput, DoctorListParams, PaginatedDoctors } from "@/types/doctor";
import { buildQueryString } from "@/utils/buildQueryString";

interface DoctorResponse {
  success: boolean;
  doctor: Doctor;
}

interface DoctorListResponse {
  success: boolean;
  doctors: Doctor[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const doctorApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDoctors: builder.query<PaginatedDoctors, DoctorListParams>({
      query: (params) => `/doctors${buildQueryString(params)}`,
      transformResponse: (response: DoctorListResponse) => ({
        doctors: response.doctors,
        total: response.total,
        page: response.page,
        limit: response.limit,
        totalPages: response.totalPages,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.doctors.map((d) => ({ type: "Doctor" as const, id: d._id })),
              { type: "Doctor" as const, id: "LIST" },
            ]
          : [{ type: "Doctor" as const, id: "LIST" }],
    }),

    getDoctor: builder.query<Doctor, string>({
      query: (id) => `/doctors/${id}`,
      transformResponse: (response: DoctorResponse) => response.doctor,
      providesTags: (_result, _error, id) => [{ type: "Doctor", id }],
    }),

    createDoctor: builder.mutation<Doctor, DoctorInput>({
      query: (body) => ({ url: "/doctors", method: "POST", body }),
      transformResponse: (response: DoctorResponse) => response.doctor,
      invalidatesTags: [{ type: "Doctor", id: "LIST" }],
    }),

    updateDoctor: builder.mutation<Doctor, { id: string; body: Partial<DoctorInput> }>({
      query: ({ id, body }) => ({ url: `/doctors/${id}`, method: "PUT", body }),
      transformResponse: (response: DoctorResponse) => response.doctor,
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Doctor", id },
        { type: "Doctor", id: "LIST" },
      ],
    }),

    deleteDoctor: builder.mutation<void, string>({
      query: (id) => ({ url: `/doctors/${id}`, method: "DELETE" }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Doctor", id },
        { type: "Doctor", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetDoctorsQuery,
  useGetDoctorQuery,
  useCreateDoctorMutation,
  useUpdateDoctorMutation,
  useDeleteDoctorMutation,
} = doctorApi;
