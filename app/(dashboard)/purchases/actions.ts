"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/database";
import { purchases, products } from "@/database/schemas";
import { getSession } from "@/lib/get-session";
import { getShopByUserId } from "@/database/data/shop";
import { purchaseSchema, PurchaseSchema } from "./_lib/schema";
import { eq, sql } from "drizzle-orm";

export async function createPurchaseAction(data: PurchaseSchema) {
  try {
    const session = await getSession();
    if (!session?.user) throw new Error("Unauthorized");

    const shop = await getShopByUserId(session.user.id);
    if (!shop) throw new Error("Shop not configured");

    const result = purchaseSchema.safeParse(data);
    if (!result.success) {
      return {
        success: false,
        message: "Invalid form data",
      };
    }

    const validatedData = result.data;

    // Use transaction to ensure stock update and purchase record are atomic
    await db.transaction(async (tx) => {
      // 1. Insert purchase record
      await tx.insert(purchases).values({
        shopId: shop.id,
        productId: validatedData.productId,
        quantity: validatedData.quantity,
        unitCostPaise: Math.round(validatedData.unitCostPaise * 100), // Assuming input in Rupees
        purchaseDate: new Date(validatedData.purchaseDate),
        supplierName: validatedData.supplierName,
        batchNumber: validatedData.batchNumber,
        expiryDate: validatedData.expiryDate ? new Date(validatedData.expiryDate) : null,
        notes: validatedData.notes,
      });

      // 2. Increment product stock
      await tx
        .update(products)
        .set({
          stockQty: sql`${products.stockQty} + ${validatedData.quantity}`,
          updatedAt: new Date(),
        })
        .where(eq(products.id, validatedData.productId));
    });

    revalidatePath("/purchases");
    revalidatePath("/products");
    revalidatePath("/dashboard");
    
    return { success: true };
  } catch (error) {
    console.error("Error creating purchase:", error);
    return { success: false, message: "Failed to record purchase" };
  }
}
