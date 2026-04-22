"use client";
import { TooltipProvider } from "../ui/tooltip";
import { CartStoreProvider } from "./cart-store-provider";
import { ThemeProvider } from "./theme-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <ThemeProvider>
        <CartStoreProvider>{children}</CartStoreProvider>
      </ThemeProvider>
    </TooltipProvider>
  );
}
