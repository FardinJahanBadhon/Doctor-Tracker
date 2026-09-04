import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

/**
 * Base RTK Query API slice. Feature slices (auth, doctors, patients, dashboard)
 * inject their own endpoints into this slice via `apiSlice.injectEndpoints`
 * as each feature is built, rather than each owning a separate `createApi` instance.
 */
export interface HealthResponse {
  success: boolean;
  server: { status: string; uptimeSeconds: number };
  api: { status: string };
  database: { status: string; name: string | null };
  timestamp: string;
}

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api",
    credentials: "include",
  }),
  tagTypes: ["Auth", "Doctor", "Patient", "Dashboard"],
  endpoints: (builder) => ({
    getHealth: builder.query<HealthResponse, void>({
      query: () => "/health",
    }),
  }),
});

export const { useGetHealthQuery } = apiSlice;
