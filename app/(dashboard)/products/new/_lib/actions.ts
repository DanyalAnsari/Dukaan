"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/database";
import { products } from "@/database/schemas";
import { getSession } from "@/lib/get-session";
import { getShopByUserId } from "@/database/data/shop";
import { productSchema, ProductSchema } from "../../_lib/schema";
import { redirect } from "next/navigation";

export async function createProductAction(data: ProductSchema) {
  try {
    const session = await getSession();
    if (!session?.user) redirect("/login");

    const shop = await getShopByUserId(session.user.id);
    if (!shop) redirect("/setup");

    const result = productSchema.safeParse(data);
    if (!result.success) {
      return {
        success: false,
        message: "Invalid form data",
        errors: result.error.issues.map((issue) => ({
          field: issue.path[0],
          message: issue.message,
        })),
      };
    }

    await db.insert(products).values({
      ...result.data,
      shopId: shop.id,
      isActive: true,
    });

    revalidatePath("/products");
    return { success: true };
  } catch (error) {
    console.error("Error creating product:", error);
    return { success: false, message: "Failed to create product" };
  }
}
