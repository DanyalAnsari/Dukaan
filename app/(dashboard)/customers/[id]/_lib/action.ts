"use server";

import { PAYMENT_METHODS } from "@/constants";
import { db } from "@/database";
import { payments, customers, bills } from "@/database/schemas";
import { requireShop } from "@/lib/require-shop";
import { ActionResult } from "@/types";
import { eq, and, sql } from "drizzle-orm";
import { revalidatePath, refresh } from "next/cache";
import { z } from "zod";

const paymentSchema = z.object({
  customerId: z.uuid("Invalid customer ID"),
  billId: z.uuid("Invalid bill ID").optional().nullable(),
  amountPaise: z
    .number()
    .int("Amount must be a whole number")
    .positive("Amount must be > 0"),
  paymentMethod: z.enum(PAYMENT_METHODS),
  notes: z.string().optional().nullable(),
});

export type PaymentInput = z.input<typeof paymentSchema>;
export type PaymentOutput = z.output<typeof paymentSchema>;

export async function recordPaymentAction(
  data: PaymentInput
): Promise<ActionResult> {
  const { shop } = await requireShop();

  const result = paymentSchema.safeParse(data);
  if (!result.success) {
    return {
      success: false,
      message: "Invalid payment data",
      errors: result.error.issues.map((i) => ({
        field: i.path[0],
        message: i.message,
      })),
    };
  }

  const { customerId, billId, amountPaise, paymentMethod, notes } = result.data;
  const shopId = shop.id;

  try {
    await db.transaction(async (tx) => {
      // ── Step 1: Record the payment ──────────────────────────────────────────
      await tx.insert(payments).values({
        shopId,
        customerId,
        billId: billId ?? null,
        amountPaise, // already a rounded integer from the schema
        paymentMethod,
        notes: notes ?? null,
      });

      // ── Step 2: Decrement customer's outstanding balance ─────────────────────
      // shopId guard ensures we only touch customers belonging to this shop
      await tx
        .update(customers)
        .set({
          outstandingBalancePaise: sql`outstanding_balance_paise - ${amountPaise}`,
        })
        .where(
          and(
            eq(customers.id, customerId),
            eq(customers.shopId, shopId) // ← security: scope to shop
          )
        );

      // ── Step 3: Allocate payment to bill(s) ─────────────────────────────────
      if (billId) {
        // Path A — specific bill payment
        // Update ONLY the referenced bill; do NOT run FIFO.
        // (Previously both paths ran simultaneously, causing double-allocation.)
        const bill = await tx.query.bills.findFirst({
          where: and(
            eq(bills.id, billId),
            eq(bills.shopId, shopId) // verify bill belongs to this shop
          ),
        });

        if (bill) {
          const newPaidAmount = (bill.amountPaidPaise ?? 0) + amountPaise;
          const newStatus: "paid" | "partial" | "credit" =
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
            .where(
              and(
                eq(bills.id, billId),
                eq(bills.shopId, shopId) // defence-in-depth
              )
            );
        }
      } else {
        // Path B — general / advance payment (no bill specified)
        // FIFO: allocate to oldest unpaid bills first
        const unpaidBills = await tx.query.bills.findMany({
          where: and(
            eq(bills.customerId, customerId),
            eq(bills.shopId, shopId),
            sql`${bills.status} <> 'paid'`
          ),
          orderBy: [bills.billDate], // oldest first
        });

        let remaining = amountPaise;

        for (const bill of unpaidBills) {
          if (remaining <= 0) break;

          const due = bill.totalPaise - (bill.amountPaidPaise ?? 0);
          const allocated = Math.min(remaining, due);
          const newPaidAmount = (bill.amountPaidPaise ?? 0) + allocated;
          const newStatus: "paid" | "partial" =
            newPaidAmount >= bill.totalPaise ? "paid" : "partial";

          await tx
            .update(bills)
            .set({
              amountPaidPaise: newPaidAmount,
              amountDuePaise: Math.max(0, bill.totalPaise - newPaidAmount),
              status: newStatus,
            })
            .where(
              and(
                eq(bills.id, bill.id),
                eq(bills.shopId, shopId) // defence-in-depth
              )
            );

          remaining -= allocated;
        }
        // If remaining > 0 here the customer has a credit balance,
        // already reflected by the negative outstanding balance above.
      }
    });

    // Revalidate all affected views
    if (billId) revalidatePath(`/bills/${billId}`);
    revalidatePath(`/customers/${customerId}`);
    revalidatePath("/bills");
    revalidatePath("/customers");
    refresh(); // Next.js 16 — syncs the client router

    return { success: true };
  } catch (error) {
    console.error("[recordPayment]", error);
    return {
      success: false,
      message: "Failed to record payment. Please try again.",
    };
  }
}
