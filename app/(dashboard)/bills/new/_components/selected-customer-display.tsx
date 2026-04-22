"use client";

import { User } from "lucide-react";
import { useCartStore } from "@/components/providers/cart-store-provider";

export default function SelectedCustomerDisplay() {
  const { customerName } = useCartStore((s) => s);
  return (
    <div>
      {customerName && (
        <div className="rounded-lg border bg-muted/50 p-3">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-medium">{customerName}</p>
              <p className="text-xs text-muted-foreground">Selected customer</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
