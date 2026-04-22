import { Badge } from "@/components/ui/badge";
import { BillStatus } from "@/types";
import { ReactNode } from "react";

const variants: Record<BillStatus, string> = {
  paid: "bg-paid text-paid border border-green-200",
  partial: "bg-partial text-partial border border-amber-200",
  credit: "bg-unpaid text-unpaid border border-red-200",
  draft: "bg-draft text-draft border border-red-200",
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
