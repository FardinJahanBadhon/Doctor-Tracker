"use client";

import { StoreProvider } from "@/store/StoreProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <TooltipProvider>
        {children}
        <Toaster position="top-right" />
      </TooltipProvider>
    </StoreProvider>
  );
}
