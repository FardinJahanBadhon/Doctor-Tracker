import { apiSlice } from "@/store/api/apiSlice";
import { DashboardOverview, PatientsPerDoctorRow, DateStatisticRow, DateRange } from "@/types/dashboard";

interface OverviewResponse extends DashboardOverview {
  success: boolean;
}

interface PatientsPerDoctorResponse {
  success: boolean;
  data: PatientsPerDoctorRow[];
}

interface DateStatisticsResponse {
  success: boolean;
  range: DateRange;
  data: DateStatisticRow[];
}

export const dashboardApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getOverview: builder.query<DashboardOverview, void>({
      query: () => "/dashboard/overview",
      transformResponse: (response: OverviewResponse) => ({
        totalDoctors: response.totalDoctors,
        totalPatients: response.totalPatients,
      }),
      providesTags: ["Dashboard"],
    }),

    getPatientsPerDoctor: builder.query<PatientsPerDoctorRow[], { limit?: number } | void>({
      query: (params) => `/dashboard/patients-per-doctor${params?.limit ? `?limit=${params.limit}` : ""}`,
      transformResponse: (response: PatientsPerDoctorResponse) => response.data,
      providesTags: ["Dashboard"],
    }),

    getDateStatistics: builder.query<DateStatisticRow[], DateRange>({
      query: (range) => `/dashboard/date-statistics?range=${range}`,
      transformResponse: (response: DateStatisticsResponse) => response.data,
      providesTags: ["Dashboard"],
    }),
  }),
});

export const { useGetOverviewQuery, useGetPatientsPerDoctorQuery, useGetDateStatisticsQuery } = dashboardApi;
