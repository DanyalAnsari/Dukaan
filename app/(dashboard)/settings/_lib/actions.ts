"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/database";
import { shops } from "@/database/schemas";
import { getSession } from "@/lib/get-session";
import { getShopByUserId } from "@/database/data/shop";
import { shopSettingsSchema, ShopSettingsSchema } from "./schema";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

export async function updateShopSettingsAction(data: ShopSettingsSchema) {
  try {
    const session = await getSession();
    if (!session?.user) redirect("/login");

    const shop = await getShopByUserId(session.user.id);
    if (!shop) redirect("/setup");

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
