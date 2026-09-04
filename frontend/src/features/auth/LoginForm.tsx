"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLoginMutation } from "./authApi";
import { ROUTES } from "@/constants/routes";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function getErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "data" in error) {
    const data = (error as { data?: { message?: string } }).data;
    if (data?.message) return data.message;
  }
  return "Something went wrong. Please try again.";
}

export function LoginForm() {
  const router = useRouter();
  const [login, { isLoading, error, isError }] = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await login(values).unwrap();
      router.replace(ROUTES.dashboard);
    } catch {
      // error state is already surfaced via the `error` value from the hook
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      {isError && (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertDescription>{getErrorMessage(error)}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="admin@doctortracker.com"
          aria-invalid={Boolean(errors.email)}
          {...register("email")}
        />
        {errors.email && <span className="text-xs text-destructive">{errors.email.message}</span>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          aria-invalid={Boolean(errors.password)}
          {...register("password")}
        />
        {errors.password && <span className="text-xs text-destructive">{errors.password.message}</span>}
      </div>

      <Button type="submit" disabled={isLoading} className="mt-2">
        {isLoading && <Loader2 className="animate-spin" />}
        {isLoading ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
