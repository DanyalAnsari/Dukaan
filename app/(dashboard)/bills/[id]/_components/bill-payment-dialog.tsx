"use client";

import { useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
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

interface BillPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  billId: string;
  invoiceNumber: string;
  customerId?: string | null;
  amountDue: number; // in paise
}

export function BillPaymentDialog({
  open,
  onOpenChange,
  billId,
  invoiceNumber,
  customerId,
  amountDue,
}: BillPaymentDialogProps) {
  const [isPending, startTransition] = useTransition();

  const maxAmount = amountDue / 100;

  const formSchema = z.object({
    amount: z.coerce
      .number()
      .positive("Amount must be greater than 0")
      .max(
        maxAmount,
        `Amount cannot exceed balance due (${formatCurrency(amountDue)})`
      ),
    paymentMethod: z.string().min(1),
  });

  type FormValues = z.infer<typeof formSchema>;

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: maxAmount,
      paymentMethod: "cash",
    },
  });

  const paymentMethod = useWatch({ control, name: "paymentMethod" });

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      const result = await recordPaymentAction({
        customerId,
        billId,
        amountPaise: values.amount * 100,
        paymentMethod: values.paymentMethod,
        notes: `Payment for Invoice ${invoiceNumber}`,
      });

      if (result.success) {
        toast.success("Payment recorded successfully");
        onOpenChange(false);
      } else {
        toast.error(result.error || "Failed to record payment");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Payment for {invoiceNumber}</DialogTitle>
          <DialogDescription>
            Enter the amount received for this specific invoice.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card className="border-0 shadow-none">
            <CardContent className="space-y-4 pt-4">
              <div className="rounded-lg bg-muted p-4 text-center">
                <div className="text-sm text-muted-foreground">Balance Due</div>
                <div className="font-mono text-2xl font-bold text-red-600">
                  {formatCurrency(amountDue)}
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
                <div className="grid grid-cols-3 gap-2">
                  {["cash", "upi", "card"].map((method) => (
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
                "Pay Invoice"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
