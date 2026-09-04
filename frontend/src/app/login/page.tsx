import { Stethoscope } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { LoginForm } from "@/features/auth/LoginForm";

export const metadata = { title: "Login | Doctor Tracker" };

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-sm">
        <CardContent>
          <div className="mb-6 flex flex-col items-center gap-2 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Stethoscope size={24} />
            </div>
            <h1 className="text-xl font-bold">Doctor Tracker</h1>
            <p className="text-sm text-muted-foreground">Sign in with your admin account</p>
          </div>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
