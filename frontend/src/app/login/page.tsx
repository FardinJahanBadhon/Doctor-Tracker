import { Stethoscope, Users, ChartColumnBig, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { LoginForm } from "@/features/auth/LoginForm";

export const metadata = { title: "Login | Doctor Tracker" };

const HIGHLIGHTS = [
  { icon: Stethoscope, text: "Keep every doctor profile organized in one place" },
  { icon: Users, text: "Track patients and their assigned care team" },
  { icon: ChartColumnBig, text: "See practice-wide activity at a glance" },
];

export default function LoginPage() {
  return (
    <div className="flex min-h-screen bg-muted/40">
      {/* Brand panel — desktop and up only; mobile/tablet gets the plain centered card below. */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
            <Stethoscope size={22} />
          </div>
          <span className="text-lg font-bold tracking-tight">Doctor Tracker</span>
        </div>

        <div className="relative flex flex-col gap-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-balance">
              Healthcare administration, organized.
            </h2>
            <p className="mt-3 max-w-sm text-sm text-primary-foreground/80">
              A single, secure place for your admin team to manage doctors, patients, and
              day-to-day practice activity.
            </p>
          </div>
          <ul className="flex flex-col gap-4">
            {HIGHLIGHTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15">
                  <Icon size={16} />
                </div>
                <span className="text-primary-foreground/90">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex items-center gap-2 text-xs text-primary-foreground/70">
          <ShieldCheck size={14} />
          Access restricted to authorized administrators
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <Card className="w-full max-w-sm">
          <CardContent>
            <div className="mb-6 flex flex-col items-center gap-2 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground lg:hidden">
                <Stethoscope size={24} />
              </div>
              <h1 className="text-xl font-bold tracking-tight">Welcome back</h1>
              <p className="text-sm text-muted-foreground">Sign in with your admin account</p>
            </div>
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
