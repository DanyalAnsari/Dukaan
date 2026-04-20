"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { recordPaymentAction } from "@/app/(dashboard)/_actions/payment";
import { Loader2 } from "lucide-react";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string;
  billId: string;
  customerName: string;
  outstandingBalance: number;
}

export function PaymentDialog({
  open,
  onOpenChange,
  customerId,
  billId,
  customerName,
  outstandingBalance,
}: PaymentDialogProps) {
  const [isPending, startTransition] = useTransition();

  const maxAmount = outstandingBalance / 100;

  const formSchema = z.object({
    amount: z.coerce
      .number()
      .positive("Amount must be greater than 0")
      .max(
        maxAmount,
        `Amount cannot exceed outstanding balance (${formatCurrency(outstandingBalance)})`
      ),
    paymentMethod: z.string().min(1),
  });

  type FormValues = z.infer<typeof formSchema>;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: undefined,
      paymentMethod: "cash",
    },
  });

  const paymentMethod = watch("paymentMethod");

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      const result = await recordPaymentAction({
        billId,
        customerId,
        amountPaise: values.amount * 100,
        paymentMethod: values.paymentMethod,
      });

      if (result.success) {
        toast.success("Payment recorded successfully");
        onOpenChange(false);
        reset();
      } else {
        toast.error(result.error || "Failed to record payment");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Record a payment from {customerName}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card className="border-0 shadow-none">
            <CardContent className="space-y-4 pt-4">
              <div className="rounded-lg bg-muted p-4 text-center">
                <div className="text-sm text-muted-foreground">
                  Outstanding Balance
                </div>
                <div className="font-mono text-2xl font-bold text-red-600">
                  {formatCurrency(outstandingBalance)}
                </div>
              </div>

              <Field data-invalid={!!errors.amount}>
                <FieldLabel htmlFor="amount">Amount (₹)</FieldLabel>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  max={maxAmount}
                  placeholder="0.00"
                  disabled={isPending}
                  aria-invalid={!!errors.amount}
                  {...register("amount")}
                />
                {errors.amount && <FieldError errors={[errors.amount]} />}
              </Field>

              <Field data-invalid={!!errors.paymentMethod}>
                <FieldLabel>Payment Method</FieldLabel>
                <div className="grid grid-cols-4 gap-2">
                  {["cash", "upi", "card", "bank"].map((method) => (
                    <Button
                      key={method}
                      type="button"
                      variant={
                        paymentMethod === method ? "default" : "secondary"
                      }
                      onClick={() =>
                        setValue("paymentMethod", method, {
                          shouldValidate: true,
                        })
                      }
                      disabled={isPending}
                      className="capitalize"
                    >
                      {method}
                    </Button>
                  ))}
                </div>
                {errors.paymentMethod && (
                  <FieldError errors={[errors.paymentMethod]} />
                )}
              </Field>
            </CardContent>
          </Card>
          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Recording...
                </>
              ) : (
                "Record Payment"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
