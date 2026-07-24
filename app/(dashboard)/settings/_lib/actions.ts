"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/database";
import { shops } from "@/database/schemas";
import { shopSettingsSchema, ShopSettingsSchema } from "./schema";
import { eq } from "drizzle-orm";
import { requireShopRole } from "@/lib/require-shop";

export async function updateShopSettingsAction(data: ShopSettingsSchema) {
  try {
    const { shop } = await requireShopRole(["owner"]);

    const result = shopSettingsSchema.safeParse(data);
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

    await db
      .update(shops)
      .set({
        ...result.data,
      })
      .where(eq(shops.id, shop.id));

    revalidatePath("/settings");
    revalidatePath("/dashboard");
    revalidatePath("/(dashboard)", "layout");
    
    return { success: true };
  } catch (error) {
    console.error("Error updating shop settings:", error);
    return { success: false, message: "Failed to update settings" };
  }
}
