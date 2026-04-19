"use server";

import { revalidatePath } from "next/cache";
import { eq, and, sql } from "drizzle-orm";
import { db } from "@/database";
import {
  bills,
  billItems,
  products,
  customers,
  shops,
} from "@/database/schemas";
import { getSession } from "@/lib/get-session";
import { getShopByUserId } from "@/database/data/shop";
import { billSchema, BillSchema } from "./schema";
import { redirect } from "next/navigation";

export async function createBillAction(data: BillSchema) {
  try {
    const session = await getSession();
    if (!session?.user) redirect("/login");

    const shop = await getShopByUserId(session.user.id);
    if (!shop) redirect("/setup");

    const result = billSchema.safeParse(data);
    if (!result.success) {
      return {
        success: false,
        message: "Invalid form data. Please check all fields.",
        errors: result.error.issues?.map((issue) => ({
          field: issue.path[0],
          message: issue.message,
        })),
      };
    }

    const { customerId, items, paymentMethod, discountPaise, amountPaidPaise, status: requestedStatus } = result.data;

    if (items.length === 0) {
      return {
        success: false,
        message: "Cart is empty",
        errors: [{ field: "items", message: "Cart cannot be empty" }],
      };
    }

    const isDraft = requestedStatus === "draft";

    // We'll perform everything inside a transaction for atomicity
    const billId = await db.transaction(async (tx) => {
      // 1. Generate atomic invoice number
      const [updatedShop] = await tx
        .update(shops)
        .set({
          nextInvoiceNumber: sql`${shops.nextInvoiceNumber} + 1`,
        })
        .where(eq(shops.id, shop.id))
        .returning({
          prefix: shops.invoicePrefix,
          number: shops.nextInvoiceNumber,
        });

      const invoiceNumber = `${updatedShop.prefix || "INV"}-${(
        updatedShop.number! - 1
      )
        .toString()
        .padStart(4, "0")}`;

      // 2. Calculate totals and prepare items
      let subtotalPaise = 0;
      let gstTotalPaise = 0;
      const itemsToInsert: Array<typeof billItems.$inferInsert> = [];

      for (const item of items) {
        // Fetch product info (lock if not draft)
        let product;
        if (!isDraft) {
          const [lockedProduct] = await tx
            .select()
            .from(products)
            .where(
              and(
                eq(products.id, item.productId),
                eq(products.shopId, shop.id),
                eq(products.isActive, true)
              )
            )
            .for("update");
          product = lockedProduct;
        } else {
          product = await tx.query.products.findFirst({
            where: (products, { eq, and }) => and(eq(products.id, item.productId), eq(products.isActive, true))
          });
        }

        if (!product) {
          throw new Error(`Product ${item.productName} not found or inactive`);
        }

        if (!isDraft && product.stockQty !== null && product.stockQty < item.quantity) {
          throw new Error(
            `Insufficient stock for ${item.productName}. Available: ${product.stockQty}`
          );
        }

        const lineSubtotal = item.unitPricePaise * item.quantity;
        const lineGst = Math.round((lineSubtotal * item.gstRate) / 100);
        const lineTotal = lineSubtotal + lineGst;

        subtotalPaise += lineSubtotal;
        gstTotalPaise += lineGst;

        itemsToInsert.push({
          billId: "", // Will update after bill insert
          productId: item.productId,
          productName: item.productName,
          productSku: item.productSku,
          hsnCode: item.hsnCode,
          quantity: item.quantity,
          unitPricePaise: item.unitPricePaise,
          gstRate: item.gstRate,
          gstAmountPaise: lineGst,
          lineTotalPaise: lineTotal,
          unit: product.unit || "pcs",
        });

        // 3. Deduction inside loop while we have the lock (skip if draft)
        if (!isDraft) {
          await tx
            .update(products)
            .set({
              stockQty: sql`stock_qty - ${item.quantity}`,
            })
            .where(eq(products.id, item.productId));
        }
      }

      const totalPaise = Math.max(0, subtotalPaise + gstTotalPaise - discountPaise);
      const amountDuePaise = Math.max(0, totalPaise - amountPaidPaise);
      
      if (!isDraft && !customerId && amountDuePaise > 0) {
        throw new Error("Walk-in customers must pay the full amount. Credit or partial payments are only allowed for registered customers.");
      }
      
      let status: "paid" | "partial" | "credit" | "draft" = "paid";
      if (isDraft) {
        status = "draft";
      } else if (amountPaidPaise === 0 || paymentMethod === "credit") {
        status = "credit";
      } else if (amountPaidPaise < totalPaise) {
        status = "partial";
      }

      // 4. Insert bill
      const [newBill] = await tx
        .insert(bills)
        .values({
          shopId: shop.id,
          customerId: customerId || null,
          invoiceNumber,
          billDate: new Date(),
          subtotalPaise,
          discountPaise,
          gstTotalPaise,
          totalPaise,
          paymentMethod: paymentMethod,
          status,
          amountPaidPaise,
          amountDuePaise,
        })
        .returning();

      // 5. Insert bill items
      await tx.insert(billItems).values(
        itemsToInsert.map((item) => ({
          ...item,
          billId: newBill.id,
        }))
      );

      // 6. Update customer balance if there is an amount due
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

    return {
      success: true,
      billId,
    };
  } catch (error) {
    console.error("Error creating bill:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to create bill",
      errors: [
        {
          field: "items",
          message:
            error instanceof Error ? error.message : "Failed to create bill",
        },
      ],
    };
  }
}
