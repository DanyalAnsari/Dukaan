"use client";
import { TooltipProvider } from "../ui/tooltip";
import { CartStoreProvider } from "./cart-store-provider";
import { ThemeProvider } from "./theme-provider";
import { UIStoreProvider } from "./ui-store-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <ThemeProvider>
        <CartStoreProvider>
          <UIStoreProvider>{children}</UIStoreProvider>
        </CartStoreProvider>
      </ThemeProvider>
    </TooltipProvider>
  );
}
