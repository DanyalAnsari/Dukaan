"use server";

import { revalidatePath } from "next/cache";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/database";
import {
  billItems,
  bills,
  customers,
  products,
  shops,
} from "@/database/schemas";
import { getSession } from "@/lib/get-session";
import { getShopByUserId } from "@/database/data/shop";
import { billSchema, type BillSchema } from "./schema";
import { redirect } from "next/navigation";
import { BillStatus } from "@/types";

export async function createBillAction(data: BillSchema) {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const shop = await getShopByUserId(session.user.id);
  if (!shop) redirect("/setup");

  const result = billSchema.safeParse(data);
  if (!result.success) {
    return {
      success: false,
      message: "Invalid form data. Please check all fields.",
      errors: result.error.issues.map((issue) => ({
        field: issue.path[0],
        message: issue.message,
      })),
    };
  }

  const {
    customerId,
    items,
    paymentMethod,
    discountPaise,
    amountPaidPaise,
    status: requestedStatus,
  } = result.data;

  if (items.length === 0) {
    return {
      success: false,
      message: "Cart is empty",
      errors: [{ field: "items", message: "Cart cannot be empty" }],
    };
  }

  const isDraft = requestedStatus === "draft";
  try {
    const billId = await db.transaction(async (tx) => {
      // 1. Atomically increment invoice number
      const [updatedShop] = await tx
        .update(shops)
        .set({ nextInvoiceNumber: sql`${shops.nextInvoiceNumber} + 1` })
        .where(eq(shops.id, shop.id))
        .returning();

      const invoiceNumber = `${updatedShop.invoicePrefix ?? "INV"}-${(
        updatedShop.nextInvoiceNumber! - 1
      )
        .toString()
        .padStart(4, "0")}`;

      // 2. Validate items and build insert payload
      let subtotalPaise = 0;
      let gstTotalPaise = 0;
      // Collect items without billId; we'll add it after the bill insert
      const pendingItems: Array<Omit<typeof billItems.$inferInsert, "billId">> =
        [];

      for (const item of items) {
        const productQuery = tx
          .select()
          .from(products)
          .where(
            and(
              eq(products.id, item.productId),
              eq(products.shopId, shop.id),
              eq(products.isActive, true)
            )
          );

        // Lock the row only when we need to decrement stock
        const [product] = isDraft
          ? await productQuery
          : await productQuery.for("update");

        if (!product) {
          throw new Error(
            `Product "${item.productName}" not found or inactive`
          );
        }

        if (
          !isDraft &&
          product.stockQty !== null &&
          product.stockQty < item.quantity
        ) {
          throw new Error(
            `Insufficient stock for "${item.productName}". Available: ${product.stockQty}`
          );
        }

        const lineSubtotal = item.unitPricePaise * item.quantity;
        const lineGst = Math.round((lineSubtotal * item.gstRate) / 100);

        subtotalPaise += lineSubtotal;
        gstTotalPaise += lineGst;

        pendingItems.push({
          productId: item.productId,
          productName: item.productName,
          productSku: item.productSku,
          hsnCode: item.hsnCode,
          quantity: item.quantity,
          unitPricePaise: item.unitPricePaise,
          gstRate: item.gstRate,
          gstAmountPaise: lineGst,
          lineTotalPaise: lineSubtotal + lineGst,
          unit: product.unit ?? "pcs",
        });

        // Decrement stock (non-draft only, while row is locked)
        if (!isDraft) {
          await tx
            .update(products)
            .set({ stockQty: sql`stock_qty - ${item.quantity}` })
            .where(eq(products.id, item.productId));
        }
      }

      const totalPaise = Math.max(
        0,
        subtotalPaise + gstTotalPaise - discountPaise
      );
      const amountDuePaise = Math.max(0, totalPaise - amountPaidPaise);

      if (!isDraft && !customerId && amountDuePaise > 0) {
        throw new Error(
          "Walk-in customers must pay the full amount. Credit or partial payments are only allowed for registered customers."
        );
      }

      const status: BillStatus = isDraft
        ? "draft"
        : amountPaidPaise === 0 || paymentMethod === "credit"
          ? "credit"
          : amountPaidPaise < totalPaise
            ? "partial"
            : "paid";

      // 3. Insert bill
      const [newBill] = await tx
        .insert(bills)
        .values({
          shopId: shop.id,
          customerId: customerId ?? null,
          invoiceNumber,
          billDate: new Date(),
          subtotalPaise,
          discountPaise,
          gstTotalPaise,
          totalPaise,
          paymentMethod,
          status,
          amountPaidPaise,
          amountDuePaise,
        })
        .returning(); // only fetch what we need

      // 4. Insert bill items — no more billId: "" placeholder
      await tx
        .insert(billItems)
        .values(pendingItems.map((item) => ({ ...item, billId: newBill.id })));

      // 5. Update customer outstanding balance
      if (customerId && amountDuePaise > 0) {
        await tx
          .update(customers)
          .set({
            outstandingBalancePaise: sql`outstanding_balance_paise + ${amountDuePaise}`,
          })
          .where(eq(customers.id, customerId));
      }

      return newBill.id;
    });

    revalidatePath("/bills");
    revalidatePath("/bills/new");
    revalidatePath("/products");
    revalidatePath("/customers");
    revalidatePath("/dashboard");

    return { success: true, billId };
  } catch (error) {
    console.error("Error creating bill:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create bill";
    return {
      success: false as const,
      message,
      errors: [{ field: "items", message }],
    };
  }
}
