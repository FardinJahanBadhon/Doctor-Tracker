import { ReactNode } from "react";
import { MainLayout } from "@/components/layout/MainLayout";

export default function DashboardGroupLayout({ children }: { children: ReactNode }) {
  return <MainLayout>{children}</MainLayout>;
}
