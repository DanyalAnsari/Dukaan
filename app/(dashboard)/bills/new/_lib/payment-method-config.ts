import { CreditCard, Receipt, Smartphone, Wallet } from "lucide-react";
import type { PaymentMethod } from "@/types";

export const PAYMENT_METHODS = ["cash", "upi", "card", "credit"] as const;

export const paymentMethodConfig: Record<
  PaymentMethod,
  { icon: React.ElementType; label: string }
> = {
  cash: { icon: Wallet, label: "Cash" },
  upi: { icon: Smartphone, label: "UPI" },
  card: { icon: CreditCard, label: "Card" },
  credit: { icon: Receipt, label: "Credit" },
};
