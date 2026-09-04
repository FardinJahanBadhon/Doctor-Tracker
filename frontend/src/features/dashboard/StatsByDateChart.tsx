"use client";

import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DateStatisticRow } from "@/types/dashboard";
import { chartColors } from "./chartTheme";

export function StatsByDateChart({ data }: { data: DateStatisticRow[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
        <CartesianGrid vertical={false} stroke={chartColors.grid} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12, fill: chartColors.mutedText }}
          axisLine={{ stroke: chartColors.axis }}
          tickLine={false}
        />
        <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: chartColors.mutedText }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ borderRadius: 8, border: `1px solid ${chartColors.tooltipBorder}`, fontSize: 13 }}
          labelStyle={{ fontWeight: 600 }}
        />
        <Legend wrapperStyle={{ fontSize: 13, color: chartColors.mutedText }} />
        <Line
          type="monotone"
          dataKey="doctorsAdded"
          name="Doctors added"
          stroke={chartColors.seriesDoctors}
          strokeWidth={2}
          dot={{ r: 4, strokeWidth: 2, stroke: "var(--card)" }}
          activeDot={{ r: 5 }}
        />
        <Line
          type="monotone"
          dataKey="patientsAdded"
          name="Patients added"
          stroke={chartColors.seriesPatients}
          strokeWidth={2}
          dot={{ r: 4, strokeWidth: 2, stroke: "var(--card)" }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
