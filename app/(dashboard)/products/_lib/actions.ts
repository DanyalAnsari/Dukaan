"use server";

import { revalidatePath, refresh } from "next/cache"; // ← refresh() is new in Next 16
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/database";
import { products } from "@/database/schemas";
import { getSession } from "@/lib/get-session";
import { getShopByUserId } from "@/database/data/shop";
import { productSchema, type ProductSchema } from "./schema";
import { ActionResult } from "@/types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function requireShop() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const shop = await getShopByUserId(session.user.id);
  if (!shop) redirect("/setup");

  return { session, shop };
}

const PRODUCT_LIST_PATH = "/products";

export async function createProductAction(
  data: ProductSchema
): Promise<ActionResult> {
  const { shop } = await requireShop();

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
    await db.insert(products).values({
      ...result.data,
      shopId: shop.id,
      isActive: true,
    });

    revalidatePath(PRODUCT_LIST_PATH);
    refresh(); // ← Next 16: syncs client router

    return { success: true, message: "Product created successfully" };
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
  const { shop } = await requireShop();

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

    return { success: true, message: "Product updated successfully" };
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
  const { shop } = await requireShop();

  try {
    await db
      .update(products)
      .set({ isActive: false })
      .where(and(eq(products.id, productId), eq(products.shopId, shop.id)));

    revalidatePath(PRODUCT_LIST_PATH);
    refresh();

    return { success: true, message: "Product deleted" };
  } catch (error) {
    console.error("[deleteProduct]", error);
    return { success: false, message: "Failed to delete product." };
  }
}
