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
  // Granular selector — only re-renders when these fields change
  const items = useCartStore((s) => s.items);
  const customerId = useCartStore((s) => s.customerId);
  const paymentMethod = useCartStore((s) => s.paymentMethod);
  const discountPaise = useCartStore((s) => s.discountPaise);
  const amountPaid = useCartStore((s) => s.amountPaid);
  const clearCart = useCartStore((s) => s.clearCart);

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

  const isEmpty = items.length === 0;

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        onClick={() => handleSubmitBill("draft")}
        disabled={isEmpty || isPending}
      >
        Save Draft
      </Button>
      <Button
        onClick={() => handleSubmitBill("paid")}
        disabled={isEmpty || isPending}
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
