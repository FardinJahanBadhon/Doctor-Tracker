import { apiSlice } from "@/store/api/apiSlice";
import { Admin, AuthResponse, LoginRequest } from "@/types/auth";

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Auth"],
    }),
    me: builder.query<{ success: boolean; admin: Admin }, void>({
      query: () => "/auth/me",
      providesTags: ["Auth"],
    }),
    logout: builder.mutation<{ success: boolean; message: string }, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      invalidatesTags: ["Auth"],
    }),
  }),
});

export const { useLoginMutation, useMeQuery, useLogoutMutation } = authApi;
