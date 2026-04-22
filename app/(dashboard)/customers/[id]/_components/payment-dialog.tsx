"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { recordPaymentAction } from "../_lib/action";

// ─── Schema factory ───────────────────────────────────────────────────────────
// Defined outside the component — stable across renders, safe for React Compiler.
// Accepts maxAmountRupees so the .max() message can show the formatted value.

function buildPaymentSchema(maxAmountRupees: number) {
  return z.object({
    amount: z.coerce
      .number()
      .positive("Amount must be greater than 0")
      .max(
        maxAmountRupees,
        `Cannot exceed outstanding balance (${formatCurrency(maxAmountRupees * 100)})`
      ),
    // Mirrors the DB paymentMethodEnum — no free-form strings accepted
    paymentMethod: z.enum(["cash", "upi", "card", "bank"]),
  });
}

// ─── Types derived from the schema, not written by hand ───────────────────────
//
// Previously FormInput was manually typed as:
//   { amount: number | undefined; paymentMethod: string }
//
// That made paymentMethod a bare `string`, which conflicts with the resolver's
// enum constraint and produces the TS error. Deriving from z.input<> gives:
//   { amount: unknown; paymentMethod: "cash" | "upi" | "card" | "bank" }
//
// `amount` becomes `unknown` because z.coerce.number() accepts anything the
// HTML input emits (string, number, undefined) — RHF + zod handle coercion.
// `paymentMethod` becomes the exact literal union the resolver expects.

type BaseSchema = ReturnType<typeof buildPaymentSchema>;
type FormInput = z.input<BaseSchema>; // { amount: unknown; paymentMethod: "cash" | "upi" | "card" | "bank" }
type FormOutput = z.output<BaseSchema>; // { amount: number;  paymentMethod: "cash" | "upi" | "card" | "bank" }

// ─── Constants ────────────────────────────────────────────────────────────────

const PAYMENT_METHODS = ["cash", "upi", "card", "bank"] as const;

// ─── Props ────────────────────────────────────────────────────────────────────

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string;
  billId?: string; // optional — omit for advance / general payments
  customerName: string;
  outstandingBalance: number; // in paise
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PaymentDialog({
  open,
  onOpenChange,
  customerId,
  billId,
  customerName,
  outstandingBalance,
}: PaymentDialogProps) {
  const [isPending, startTransition] = useTransition();

  const maxAmountRupees = outstandingBalance / 100;
  const formSchema = buildPaymentSchema(maxAmountRupees);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: undefined,
      paymentMethod: "cash", // "cash" satisfies the enum literal union
    },
  });

  const paymentMethod = watch("paymentMethod");

  function onSubmit(values: FormOutput) {
    startTransition(async () => {
      const result = await recordPaymentAction({
        customerId,
        billId,
        amountPaise: Math.round(values.amount * 100),
        paymentMethod: values.paymentMethod,
      });

      if (result.success) {
        toast.success("Payment recorded successfully");
        onOpenChange(false);
        reset();
      } else {
        toast.error(result.message ?? "Failed to record payment");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Record a payment from {customerName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Card className="border-0 shadow-none">
            <CardContent className="space-y-4 pt-4">
              {/* Outstanding balance */}
              <div className="rounded-lg bg-muted p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Outstanding Balance
                </p>
                <p className="font-mono text-2xl font-bold text-red-600">
                  {formatCurrency(outstandingBalance)}
                </p>
              </div>

              {/* Amount */}
              <Field data-invalid={!!errors.amount}>
                <FieldLabel htmlFor="amount">Amount (₹)</FieldLabel>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={maxAmountRupees}
                  placeholder="0.00"
                  disabled={isPending}
                  aria-invalid={!!errors.amount}
                  {...register("amount")}
                />
                {errors.amount && <FieldError errors={[errors.amount]} />}
              </Field>

              {/* Payment method toggle */}
              <Field data-invalid={!!errors.paymentMethod}>
                <FieldLabel>Payment Method</FieldLabel>
                <div className="grid grid-cols-4 gap-2">
                  {PAYMENT_METHODS.map((method) => (
                    <Button
                      key={method}
                      type="button"
                      variant={
                        paymentMethod === method ? "default" : "secondary"
                      }
                      disabled={isPending}
                      className="capitalize"
                      onClick={() =>
                        setValue("paymentMethod", method, {
                          shouldValidate: true,
                        })
                      }
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
                  <Spinner className="mr-2 h-4 w-4" />
                  Recording…
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
