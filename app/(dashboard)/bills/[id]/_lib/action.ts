"use server";

import { db } from "@/database";
import { payments, customers, bills } from "@/database/schemas";
import { eq, and, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { PAYMENT_METHODS } from "@/constants";
import { requireShop } from "@/lib/require-shop";

const paymentSchema = z.object({
  customerId: z.uuid("Invalid customer ID"),
  billId: z.uuid("Invalid bill ID"),
  amountPaise: z
    .number()
    .int("Amount must be a whole number")
    .positive("Amount must be > 0"),
  paymentMethod: z.enum(PAYMENT_METHODS),
  notes: z.string().optional().nullable(),
});

export type PaymentInput = z.input<typeof paymentSchema>;
export type PaymentOutput = z.output<typeof paymentSchema>;
export type PaymentSchema = z.infer<typeof paymentSchema>;

export async function resolveBillPaymentAction(data: PaymentInput) {
  const { shop, session } = await requireShop();

  const result = paymentSchema.safeParse(data);
  if (!result.success) {
    return {
      success: false,
      message: "Invalid payment data",
      errors: result.error.issues?.map((issue) => ({
        field: issue.path[0],
        message: issue.message,
      })),
    };
  }

  const { customerId, amountPaise, paymentMethod, billId, notes } = result.data;

  const shopId = shop.id;
  const amountInPaise = Math.round(amountPaise);

  try {
    await db.transaction(async (tx) => {
      const customer = await tx.query.customers.findFirst({
        where: and(eq(customers.id, customerId), eq(customers.shopId, shopId)),
      });
      if (!customer) throw new Error("Customer not found.");

      const bill = await tx.query.bills.findFirst({
        where: and(eq(bills.id, billId), eq(bills.shopId, shopId)),
      });
      if (!bill || bill.customerId !== customerId) throw new Error("Bill not found.");
      if (amountInPaise > (bill.amountDuePaise ?? 0)) {
        throw new Error("Payment cannot exceed the outstanding balance.");
      }

      // reference number of transaction for upi bank in future
      await tx.insert(payments).values({
        shopId,
        customerId,
        billId,
        amountPaise,
        paymentMethod,
        notes: notes ?? null,
        recordedByUserId: session.user.id,
      });

      // Update customer's outstanding balance
      await tx
        .update(customers)
        .set({
          outstandingBalancePaise: sql`outstanding_balance_paise - ${amountInPaise}`,
        })
        .where(and(eq(customers.id, customerId), eq(customers.shopId, shopId)));

      //  update that bill's status

      const newPaidAmount = (bill.amountPaidPaise ?? 0) + amountInPaise;
      const newStatus =
        newPaidAmount >= bill.totalPaise
          ? "paid"
          : newPaidAmount > 0
            ? "partial"
            : "credit";
      await tx
        .update(bills)
        .set({
          amountPaidPaise: newPaidAmount,
          amountDuePaise: Math.max(0, bill.totalPaise - newPaidAmount),
          status: newStatus,
        })
        .where(and(eq(bills.id, billId), eq(bills.shopId, shopId)));
    });

    revalidatePath(`/bills/${billId}`);
    revalidatePath(`/customers/${customerId}`);
    revalidatePath("/bills");
    revalidatePath("/customers");

    return { success: true };
  } catch (error) {
    console.error("Error recording payment:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create bill";
    return {
      success: false as const,
      message,
      errors: [{ field: "items", message }],
    };
  }
}
