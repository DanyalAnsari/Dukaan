"use server";

import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import { db } from "@/database";
import { products } from "@/database/schemas";
import { getSession } from "@/lib/get-session";
import { getShopByUserId } from "@/database/data/shop";
import { productSchema, type ProductSchema } from "./_lib/schema";

export async function deleteProductAction(productId: string) {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const shop = await getShopByUserId(session.user.id);
  if (!shop) {
    throw new Error("Shop not configured");
  }

  // Soft delete the product by setting isActive to false
  await db
    .update(products)
    .set({ isActive: false })
    .where(and(eq(products.id, productId), eq(products.shopId, shop.id)));

  revalidatePath("/products");
}

export async function updateProductAction(productId: string, data: ProductSchema) {
  try {
    const session = await getSession();
    if (!session?.user) throw new Error("Unauthorized");

    const shop = await getShopByUserId(session.user.id);
    if (!shop) throw new Error("Shop not configured");

    const result = productSchema.safeParse(data);
    if (!result.success) {
      return {
        success: false,
        message: "Invalid form data",
      };
    }

    await db
      .update(products)
      .set({
        ...result.data,
        updatedAt: new Date(),
      })
      .where(and(eq(products.id, productId), eq(products.shopId, shop.id)));

    revalidatePath("/products");
    revalidatePath(`/products/${productId}/edit`);
    return { success: true };
  } catch (error) {
    console.error("Error updating product:", error);
    return { success: false, message: "Failed to update product" };
  }
}
