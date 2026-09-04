"use client";

import { useRouter } from "next/navigation";
import { LogOut, UserRound } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useLogoutMutation, useMeQuery } from "@/features/auth/authApi";
import { ROUTES } from "@/constants/routes";

export function Navbar() {
  const { data } = useMeQuery();
  const [logout, { isLoading }] = useLogoutMutation();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace(ROUTES.login);
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 sm:px-6">
      <SidebarTrigger />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="gap-2">
            <UserRound size={18} />
            <span className="hidden text-sm sm:inline">{data?.admin.name ?? "Admin"}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel className="font-normal">
            <p className="text-sm font-medium">{data?.admin.name}</p>
            <p className="text-xs text-muted-foreground">{data?.admin.email}</p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={handleLogout} disabled={isLoading} variant="destructive">
            <LogOut />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
