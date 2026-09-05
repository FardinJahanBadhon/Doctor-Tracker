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
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b bg-background/95 px-4 backdrop-blur-sm supports-backdrop-filter:bg-background/80 sm:px-6">
      <SidebarTrigger />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="gap-2 pl-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
              <UserRound size={16} />
            </div>
            <span className="hidden text-sm font-medium sm:inline">{data?.admin.name ?? "Admin"}</span>
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
