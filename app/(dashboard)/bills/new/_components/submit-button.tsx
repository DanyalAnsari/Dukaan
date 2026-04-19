"use client";

import { Button } from "@/components/ui/button";
import { Receipt } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { createBillAction } from "../_lib/actions";
import { useCartStore } from "@/components/providers/cart-store-provider";

export default function SubmitButton() {
  const router = useRouter();
  const {
    items,
    customerId,
    paymentMethod,
    discountPaise,
    amountPaid,
    clearCart,
  } = useCartStore((s) => s);
  const [isPending, startTransition] = useTransition();

  const handleSubmitBill = (status: "paid" | "draft" = "paid") => {
    if (items.length === 0) {
      toast.error("Please add items to the cart");
      return;
    }

    startTransition(async () => {
      const toastId = toast.loading(
        status === "draft" ? "Saving draft..." : "Creating bill..."
      );

      try {
        const result = await createBillAction({
          customerId,
          items,
          paymentMethod,
          discountPaise,
          amountPaidPaise: amountPaid,
          status,
        });

        if (result.success) {
          toast.success(
            status === "draft" ? "Draft saved!" : "Bill created successfully!",
            { id: toastId }
          );
          clearCart();
          router.push(`/bills/${result.billId}`);
          router.refresh();
        } else {
          toast.error(
            status === "draft"
              ? "Failed to save draft"
              : "Failed to create bill",
            {
              description: result.errors
                ?.map((e) => `• ${e.message}`)
                .join("\n"),
              id: toastId,
            }
          );
        }
      } catch (error) {
        console.error("Bill submission error:", error);
        toast.error("An unexpected error occurred", { id: toastId });
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        onClick={() => handleSubmitBill("draft")}
        disabled={items.length === 0 || isPending}
      >
        Save Draft
      </Button>
      <Button
        onClick={() => handleSubmitBill("paid")}
        disabled={items.length === 0 || isPending}
      >
        {isPending ? (
          <>
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Processing...
          </>
        ) : (
          <>
            <Receipt className="mr-2 h-4 w-4" />
            Create Bill
          </>
        )}
      </Button>
    </div>
  );
}
