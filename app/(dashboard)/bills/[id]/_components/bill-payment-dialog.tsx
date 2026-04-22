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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Loader2 } from "lucide-react";
import { resolveBillPaymentAction } from "../_lib/action";
import { PAYMENT_METHODS } from "@/constants";

interface BillPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  billId: string;
  invoiceNumber: string;
  customerId: string;
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
    paymentMethod: z.enum(PAYMENT_METHODS),
  });

  type FormInput = z.input<typeof formSchema>;
  type FormOutput = z.output<typeof formSchema>;

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: maxAmount,
      paymentMethod: "cash",
    },
  });

  const paymentMethod = useWatch({ control, name: "paymentMethod" });

  const onSubmit = (values: FormOutput) => {
    startTransition(async () => {
      const toastId = toast.loading("resolving bill payment...");
      try {
        const result = await resolveBillPaymentAction({
          customerId,
          billId,
          amountPaise: values.amount * 100,
          paymentMethod: values.paymentMethod,
          notes: `Payment for Invoice ${invoiceNumber}`,
        });

        if (result.success) {
          toast.success("Payment recorded successfully", { id: toastId });
          onOpenChange(false);
        } else {
          toast.error(result.message || "Failed to record payment", {
            description: result.errors?.map((e) => `• ${e.message}`).join("\n"),
            id: toastId,
          });
        }
      } catch (error) {
        console.error("Error resolving Payment:", error);
        toast.error("An unexpected error occurred", { id: toastId });
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
        <Card className="border-0 shadow-none">
          <CardHeader className="bg-unpaid rounded-lg p-4 pt-4 text-center">
            <CardTitle className="text-sm text-muted-foreground">
              Balance Due
            </CardTitle>
            <CardDescription className="text-unpaid font-mono text-2xl font-bold">
              {formatCurrency(amountDue)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 py-4">
            <form onSubmit={handleSubmit(onSubmit)} id="bill-payment-form">
              <FieldGroup>
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
                    {PAYMENT_METHODS.map((method) => (
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
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
        <DialogFooter className="mt-4">
          <Field orientation="horizontal">
            <Button
              type="button"
              key="cancel-button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              key="submit-button"
              form="bill-payment-form"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Recording...
                </>
              ) : (
                "Pay Invoice"
              )}
            </Button>
          </Field>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
