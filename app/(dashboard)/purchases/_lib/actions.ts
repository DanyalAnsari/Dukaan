"use server";

import { revalidatePath, refresh } from "next/cache";
import { eq, and, sql } from "drizzle-orm";
import { db } from "@/database";
import { purchases, products } from "@/database/schemas";
import { purchaseSchema, type PurchaseOutput } from "./schema";
import { ActionResult } from "@/types";
import { requireShop } from "@/lib/require-shop";

export async function createPurchaseAction(
  data: PurchaseOutput
): Promise<ActionResult> {
  const { shop } = await requireShop();

  const result = purchaseSchema.safeParse(data);
  if (!result.success) {
    return {
      success: false,
      message: "Invalid form data",
      errors: result.error.issues.map((i) => ({
        field: i.path[0],
        message: i.message,
      })),
    };
  }

  const {
    productId,
    quantity,
    unitCostRupees,
    purchaseDate,
    supplierName,
    batchNumber,
    expiryDate,
    notes,
  } = result.data;

  const unitCostPaise = Math.round(unitCostRupees * 100);

  try {
    await db.transaction(async (tx) => {
      // 1. Insert purchase record
      await tx.insert(purchases).values({
        shopId: shop.id,
        productId,
        quantity,
        unitCostPaise,
        purchaseDate,
        supplierName: supplierName ?? null,
        batchNumber: batchNumber ?? null,
        expiryDate: expiryDate ?? null,
        notes: notes ?? null,
      });

      // 2. Increment product stock — scoped to shop for security
      // $onUpdate handles updatedAt automatically
      await tx
        .update(products)
        .set({
          stockQty: sql`${products.stockQty} + ${quantity}`,
        })
        .where(
          and(
            eq(products.id, productId),
            eq(products.shopId, shop.id) // ← prevents cross-shop stock mutation
          )
        );
    });

    revalidatePath("/purchases");
    revalidatePath("/products");
    revalidatePath("/dashboard");
    refresh();

    return { success: true };
  } catch (error) {
    console.error("[createPurchase]", error);
    return {
      success: false,
      message: "Failed to record purchase. Please try again.",
    };
  }
}
