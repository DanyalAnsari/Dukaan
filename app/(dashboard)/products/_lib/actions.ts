"use server";

import { revalidatePath, refresh } from "next/cache"; // ← refresh() is new in Next 16
import { eq, and, sql } from "drizzle-orm";
import { db } from "@/database";
import { products, stockAdjustments } from "@/database/schemas";
import { requireShopRole } from "@/lib/require-shop";
import { assertLimit, getShopPlan } from "@/lib/plan-limits";
import { productSchema, type ProductSchema } from "./schema";
import { ActionResult } from "@/types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const PRODUCT_LIST_PATH = "/products";

export async function createProductAction(
  data: ProductSchema
): Promise<ActionResult> {
  const { shop } = await requireShopRole(["owner", "admin"]);

  const result = productSchema.safeParse(data);
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

  try {
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::integer` })
      .from(products)
      .where(and(eq(products.shopId, shop.id), eq(products.isActive, true)));
    const plan = await getShopPlan(shop.organizationId);
    assertLimit(count, plan.limits.products, "Product");
    await db.insert(products).values({
      ...result.data,
      shopId: shop.id,
      isActive: true,
    });

    revalidatePath(PRODUCT_LIST_PATH);
    refresh(); // ← Next 16: syncs client router

    return { success: true};
  } catch (error) {
    console.error("[createProduct]", error);
    return {
      success: false,
      message: "Failed to create product. Please try again.",
    };
  }
}

export async function updateProductAction(
  productId: string,
  data: ProductSchema
): Promise<ActionResult> {
  const { shop } = await requireShopRole(["owner", "admin"]);

  const result = productSchema.safeParse(data);
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

  try {
    await db
      .update(products)
      .set(result.data) // ← $onUpdate() on updatedAt handles timestamp automatically
      .where(and(eq(products.id, productId), eq(products.shopId, shop.id)));

    revalidatePath(PRODUCT_LIST_PATH);
    revalidatePath(`/products/${productId}/edit`);
    refresh();

    return { success: true};
  } catch (error) {
    console.error("[updateProduct]", error);
    return {
      success: false,
      message: "Failed to update product. Please try again.",
    };
  }
}

// Delete (soft)

export async function deleteProductAction(
  productId: string
): Promise<ActionResult> {
  const { shop } = await requireShopRole(["owner", "admin"]);

  try {
    await db
      .update(products)
      .set({ isActive: false })
      .where(and(eq(products.id, productId), eq(products.shopId, shop.id)));

    revalidatePath(PRODUCT_LIST_PATH);
    refresh();

    return { success: true };
  } catch (error) {
    console.error("[deleteProduct]", error);
    return { success: false, message: "Failed to delete product." };
  }
}

export async function adjustStockAction(
  productId: string,
  adjustmentQty: number,
  reason: string,
  notes?: string | null
): Promise<ActionResult> {
  const { shop } = await requireShopRole(["owner", "admin"]);

  try {
    await db.transaction(async (tx) => {
      await tx.insert(stockAdjustments).values({
        shopId: shop.id,
        productId,
        adjustmentQty,
        reason,
        notes: notes || null,
      });

      await tx
        .update(products)
        .set({
          stockQty: sql`stock_qty + ${adjustmentQty}`,
        })
        .where(and(eq(products.id, productId), eq(products.shopId, shop.id)));
    });

    revalidatePath(PRODUCT_LIST_PATH);
    refresh();

    return { success: true };
  } catch (error) {
    console.error("[adjustStock]", error);
    return { success: false, message: "Failed to adjust stock." };
  }
}
