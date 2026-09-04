"use client";

import { useState } from "react";
import { Stethoscope, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardAction } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { StatCard } from "@/features/dashboard/StatCard";
import { PatientsPerDoctorChart } from "@/features/dashboard/PatientsPerDoctorChart";
import { StatsByDateChart } from "@/features/dashboard/StatsByDateChart";
import {
  useGetOverviewQuery,
  useGetPatientsPerDoctorQuery,
  useGetDateStatisticsQuery,
} from "@/features/dashboard/dashboardApi";
import { useMeQuery } from "@/features/auth/authApi";
import { DateRange } from "@/types/dashboard";

const RANGES: { value: DateRange; label: string }[] = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "12m", label: "12 months" },
];

export default function DashboardPage() {
  const { data: me } = useMeQuery();
  const [range, setRange] = useState<DateRange>("30d");

  const overview = useGetOverviewQuery();
  const perDoctor = useGetPatientsPerDoctorQuery();
  const stats = useGetDateStatisticsQuery(range);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Welcome back, {me?.admin.name ?? "Admin"}. Here&apos;s an overview of your doctors and patients.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          label="Total Doctors"
          value={overview.data?.totalDoctors}
          icon={Stethoscope}
          accent="#2a78d6"
          isLoading={overview.isLoading}
          isError={overview.isError}
        />
        <StatCard
          label="Total Patients"
          value={overview.data?.totalPatients}
          icon={Users}
          accent="#eb6834"
          isLoading={overview.isLoading}
          isError={overview.isError}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Patients per Doctor</CardTitle>
        </CardHeader>
        <CardContent>
          {perDoctor.isLoading && <Skeleton className="h-56 w-full" />}
          {!perDoctor.isLoading && perDoctor.isError && (
            <ErrorState message="Couldn't load this chart." onRetry={() => perDoctor.refetch()} />
          )}
          {!perDoctor.isLoading && !perDoctor.isError && perDoctor.data && perDoctor.data.length > 0 && (
            <PatientsPerDoctorChart data={perDoctor.data} />
          )}
          {!perDoctor.isLoading && !perDoctor.isError && perDoctor.data && perDoctor.data.length === 0 && (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No patients are linked to a doctor yet — add a patient to see this chart.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Activity Over Time</CardTitle>
          <CardAction>
            <div className="flex gap-1 rounded-lg border p-1">
              {RANGES.map((r) => (
                <Button
                  key={r.value}
                  size="sm"
                  variant={range === r.value ? "default" : "ghost"}
                  onClick={() => setRange(r.value)}
                  className="h-7 px-2.5 text-xs"
                >
                  {r.label}
                </Button>
              ))}
            </div>
          </CardAction>
        </CardHeader>
        <CardContent>
          {stats.isFetching && <Skeleton className="h-64 w-full" />}
          {!stats.isFetching && stats.isError && (
            <ErrorState message="Couldn't load this chart." onRetry={() => stats.refetch()} />
          )}
          {!stats.isFetching && !stats.isError && stats.data && stats.data.length > 0 && (
            <StatsByDateChart data={stats.data} />
          )}
          {!stats.isFetching && !stats.isError && stats.data && stats.data.length === 0 && (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No doctors or patients were added in this time range.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
