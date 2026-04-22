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
  customerId: z.string(),
  billId: z.string(),
  amountPaise: z.number().positive(),
  paymentMethod: z.string(),
  referenceNumber: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type PaymentInput = z.input<typeof paymentSchema>;
export type PaymentOutput = z.output<typeof paymentSchema>;
export type PaymentSchema = z.infer<typeof paymentSchema>;

export async function resolveBillPaymentAction(data: PaymentInput) {
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

  const shopId = shop.id;
  const amountInPaise = Math.round(amountPaise);

  console.log(amountInPaise);
  try {
    await db.transaction(async (tx) => {
      // reference number of transaction for upi bank in future
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

      //  update that bill's status

      const bill = await tx.query.bills.findFirst({
        where: and(eq(bills.id, billId), eq(bills.shopId, shopId)),
      });

      if (!bill) throw new Error(`Bill not found.`);

      const newPaidAmount = (bill.amountPaidPaise ?? 0) + amountInPaise;
      const newStatus =
        newPaidAmount >= bill.totalPaise
          ? "paid"
          : newPaidAmount > 0
            ? "partial"
            : "credit";
      console.log("newPaidpaise:", newPaidAmount);
      console.log("newStatus:", newStatus);
      await tx
        .update(bills)
        .set({
          amountPaidPaise: newPaidAmount,
          amountDuePaise: Math.max(0, bill.totalPaise - newPaidAmount),
          status: newStatus,
        })
        .where(eq(bills.id, billId));
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
