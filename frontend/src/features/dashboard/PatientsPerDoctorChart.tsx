"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PatientsPerDoctorRow } from "@/types/dashboard";
import { chartColors } from "./chartTheme";

interface TooltipPayloadItem {
  payload: PatientsPerDoctorRow;
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayloadItem[] }) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div
      className="rounded-lg border bg-popover px-3 py-2 text-sm shadow-sm"
      style={{ borderColor: chartColors.tooltipBorder }}
    >
      <p className="font-medium text-popover-foreground">{row.doctorName}</p>
      <p className="text-xs text-muted-foreground">{row.specialization}</p>
      <p className="mt-1 text-popover-foreground">
        <span className="font-semibold">{row.count}</span> patient{row.count === 1 ? "" : "s"}
      </p>
    </div>
  );
}

export function PatientsPerDoctorChart({ data }: { data: PatientsPerDoctorRow[] }) {
  // Horizontal bars — doctor names read left-to-right instead of fighting for space
  // under rotated x-axis labels, and the chart scales cleanly with the doctor count.
  const height = Math.max(220, data.length * 44);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, left: 4, bottom: 4 }}>
        <CartesianGrid horizontal={false} stroke={chartColors.grid} />
        <XAxis
          type="number"
          allowDecimals={false}
          tick={{ fontSize: 12, fill: chartColors.mutedText }}
          axisLine={{ stroke: chartColors.axis }}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="doctorName"
          width={128}
          tick={{ fontSize: 12, fill: chartColors.mutedText }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(42,120,214,0.06)" }} />
        <Bar dataKey="count" name="Patients" fill={chartColors.sequentialBar} radius={[0, 4, 4, 0]} maxBarSize={24} />
      </BarChart>
    </ResponsiveContainer>
  );
}
