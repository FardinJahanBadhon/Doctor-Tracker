"use client";

import { useState } from "react";
import { Stethoscope, Users, ChartColumnBig, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/common/PageHeader";
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

// A fixed high limit stands in for "every doctor" — the chart's whole point is showing how
// load is distributed across the practice, so silently truncating it to a top-N would hide
// doctors instead. Matches the same convention used for "all doctors" elsewhere (e.g.
// DoctorCombobox's ALL_DOCTORS_LIMIT).
const ALL_DOCTORS_LIMIT = 100;

export default function DashboardPage() {
  const { data: me } = useMeQuery();
  const [range, setRange] = useState<DateRange>("30d");

  const overview = useGetOverviewQuery();
  const perDoctor = useGetPatientsPerDoctorQuery({ limit: ALL_DOCTORS_LIMIT });
  const stats = useGetDateStatisticsQuery(range);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Dashboard"
        description={`Welcome back, ${me?.admin.name ?? "Admin"}. Here's an overview of your doctors and patients.`}
      />

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
        <CardHeader className="flex items-center gap-3 space-y-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ChartColumnBig size={18} />
          </div>
          <div>
            <CardTitle className="text-base">Patients per Doctor</CardTitle>
            <CardDescription>How your patient load is distributed across doctors</CardDescription>
          </div>
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
        <CardHeader className="flex flex-wrap items-center justify-between gap-3 space-y-0">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <TrendingUp size={18} />
            </div>
            <div>
              <CardTitle className="text-base">Activity Over Time</CardTitle>
              <CardDescription>New doctors and patients added over the selected period</CardDescription>
            </div>
          </div>
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
