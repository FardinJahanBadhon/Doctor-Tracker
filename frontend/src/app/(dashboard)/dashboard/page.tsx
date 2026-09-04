"use client";

import { useMeQuery } from "@/features/auth/authApi";

export default function DashboardPage() {
  const { data } = useMeQuery();

  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-xl font-bold">Dashboard</h1>
      <p className="text-sm text-muted-foreground">
        Welcome back, {data?.admin.name ?? "Admin"}. Dashboard analytics will be built in a later feature.
      </p>
    </div>
  );
}
