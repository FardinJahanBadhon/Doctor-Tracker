"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMeQuery } from "@/features/auth/authApi";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ROUTES } from "@/constants/routes";

/**
 * The authoritative auth guard: it always asks the backend (GET /auth/me) rather than
 * trusting client-side state, since the httpOnly session cookie isn't readable from JS.
 */
export function AuthGuard({ children }: { children: ReactNode }) {
  const { isLoading, isError } = useMeQuery();
  const router = useRouter();

  useEffect(() => {
    if (isError) router.replace(ROUTES.login);
  }, [isError, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner label="Checking your session…" />
      </div>
    );
  }

  if (isError) return null;

  return <>{children}</>;
}
