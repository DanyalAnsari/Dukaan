"use server";

import { db } from "@/database";
import { payments, customers, bills } from "@/database/schemas";
import { getSession } from "@/lib/get-session";
import { eq, and, sql } from "drizzle-orm";
import { getShopByUserId } from "@/database/data/shop";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { redirect } from "next/navigation";

const paymentSchema = z.object({
  customerId: z.string().optional().nullable(),
  billId: z.string().optional().nullable(),
  amountPaise: z.number().positive(),
  paymentMethod: z.string(),
  notes: z.string().optional().nullable(),
});

export type PaymentInput = z.input<typeof paymentSchema>;
export type PaymentOutput = z.output<typeof paymentSchema>;
export type PaymentSchema = z.infer<typeof paymentSchema>;

export async function recordPaymentAction(data: PaymentInput) {
  const session = await getSession();
  if (!session) redirect("/login");

  const shop = await getShopByUserId(session.user.id);
  if (!shop) redirect("/setup");

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

  if (!customerId || !billId) {
    return { success: false, error: "Missing customer or bill reference" };
  }

  const shopId = shop.id;
  const amountInPaise = Math.round(amountPaise);

  try {
    await db.transaction(async (tx) => {
      await tx.insert(payments).values({
        shopId,
        customerId,
        billId,
        amountPaise,
        paymentMethod,
        notes: notes ?? null,
      });

      // Update customer's outstanding balance
      await tx
        .update(customers)
        .set({
          outstandingBalancePaise: sql`outstanding_balance_paise - ${amountInPaise}`,
        })
        .where(eq(customers.id, customerId));

      // If payment is for a specific bill, update that bill's status
      if (billId) {
        const bill = await tx.query.bills.findFirst({
          where: and(eq(bills.id, billId), eq(bills.shopId, shopId)),
        });

        if (bill) {
          const newPaidAmount = (bill.amountPaidPaise || 0) + amountInPaise;
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
            .where(eq(bills.id, billId));
        }
      }
      if (customerId) {
        // General payment - Allocate to oldest unpaid bills first (FIFO)
        const unpaidBills = await tx.query.bills.findMany({
          where: and(
            eq(bills.customerId, customerId),
            eq(bills.shopId, shopId),
            sql`${bills.status} != 'paid'`
          ),
          orderBy: [bills.billDate],
        });

        let remainingAmount = amountInPaise;
        for (const bill of unpaidBills) {
          if (remainingAmount <= 0) break;

          const billDue = bill.totalPaise - (bill.amountPaidPaise || 0);
          const paymentForThisBill = Math.min(remainingAmount, billDue);

          const newPaidAmount =
            (bill.amountPaidPaise || 0) + paymentForThisBill;
          const newStatus =
            newPaidAmount >= bill.totalPaise ? "paid" : "partial";

          await tx
            .update(bills)
            .set({
              amountPaidPaise: newPaidAmount,
              amountDuePaise: Math.max(0, bill.totalPaise - newPaidAmount),
              status: newStatus,
            })
            .where(eq(bills.id, bill.id));

          remainingAmount -= paymentForThisBill;
        }
      }
    });

    if (billId) revalidatePath(`/bills/${billId}`);
    if (customerId) revalidatePath(`/customers/${customerId}`);
    revalidatePath("/bills");
    revalidatePath("/customers");

    return { success: true };
  } catch (error) {
    console.error("Error recording payment:", error);
    return { success: false, error: "Failed to record payment" };
  }
}
