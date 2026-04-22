import * as z from "zod";
import { PAYMENT_METHODS } from "@/constants";
import { formatCurrency } from "@/lib/utils";

export function buildPaymentSchema(maxAmountRupees: number) {
  return z.object({
    amount: z.coerce
      .number()
      .positive("Amount must be greater than 0")
      .max(
        maxAmountRupees,
        `Cannot exceed outstanding balance (${formatCurrency(maxAmountRupees * 100)})`
      ),
    paymentMethod: z.enum(PAYMENT_METHODS),
  });
}

export type BaseSchema = ReturnType<typeof buildPaymentSchema>;
export type FormInput = z.input<BaseSchema>;
export type FormOutput = z.output<BaseSchema>;
