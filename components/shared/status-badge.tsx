import { Badge } from "@/components/ui/badge";
import { BillStatus } from "@/types";
import { ReactNode } from "react";

const variants = {
  paid: "bg-green-50 text-green-700 border border-green-200",
  partial: "bg-amber-50 text-amber-700 border border-amber-200",
  credit: "bg-red-50 text-red-700 border border-red-200",
  unpaid: "bg-red-50 text-red-700 border border-red-200",
};

export default function StatusBadge({
  variant,
  children,
}: {
  variant: BillStatus;
  children: ReactNode;
}) {
  return (
    <Badge
      variant={
        variant === "paid"
          ? "default"
          : variant === "partial"
            ? "secondary"
            : "destructive"
      }
      className={variants[variant]}
    >
      {children}
    </Badge>
  );
}
