"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useCartStore } from "@/stores/cartStore";
import { CreditCard, Receipt, Smartphone, Wallet } from "lucide-react";

const paymentMethodConfig = {
  cash: { icon: Wallet, label: "Cash" },
  upi: { icon: Smartphone, label: "UPI" },
  card: { icon: CreditCard, label: "Card" },
  credit: { icon: Receipt, label: "Credit" },
};

export default function PaymentModeSelector() {
  const { paymentMethod, setPaymentMethod } = useCartStore();
  return (
    <div className="space-y-3">
      <Label>Payment Mode</Label>
      <div className="grid grid-cols-2 gap-2">
        {(["cash", "upi", "card", "credit"] as const).map((mode) => {
          const Icon = paymentMethodConfig[mode].icon;
          return (
            <Button
              key={mode}
              variant={paymentMethod === mode ? "default" : "outline"}
              onClick={() => setPaymentMethod(mode)}
              className="h-auto flex-col gap-2 py-3"
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs">{paymentMethodConfig[mode].label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
