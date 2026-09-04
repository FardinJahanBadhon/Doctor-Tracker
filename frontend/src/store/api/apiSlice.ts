import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { ROUTES } from "@/constants/routes";

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

const rawBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api",
  credentials: "include",
});

// A 401 from the login endpoint itself (wrong credentials) or from /auth/me (the check
// AuthGuard already reacts to) is an expected, in-place result — not a signal that a
// previously-valid session just died. Every other endpoint returning 401 means the
// httpOnly session cookie expired or was cleared while the admin was mid-task; without
// this, every subsequent action on the page would just silently 401 with no way back
// to login short of a manual refresh.
const SESSION_EXPIRY_EXEMPT_ENDPOINTS = new Set(["login", "me"]);

const baseQueryWithAuthRedirect: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (
    result.error?.status === 401 &&
    !SESSION_EXPIRY_EXEMPT_ENDPOINTS.has(api.endpoint) &&
    typeof window !== "undefined" &&
    window.location.pathname !== ROUTES.login
  ) {
    window.location.href = ROUTES.login;
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithAuthRedirect,
  tagTypes: ["Auth", "Doctor", "Patient", "Dashboard"],
  endpoints: (builder) => ({
    getHealth: builder.query<HealthResponse, void>({
      query: () => "/health",
    }),
  }),
});

export const { useGetHealthQuery } = apiSlice;
