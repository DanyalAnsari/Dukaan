"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/database";
import { customers } from "@/database/schemas";
import { getSession } from "@/lib/get-session";
import { getShopByUserId } from "@/database/data/shop";
import { customerSchema, CustomerSchema, CustomerInput } from "./schema";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

export async function updateCustomerAction(
  customerId: string,
  data: CustomerInput
) {
  try {
    const session = await getSession();
    if (!session?.user) redirect("/login");

    const shop = await getShopByUserId(session.user.id);
    if (!shop) redirect("/setup");

    const result = customerSchema.safeParse(data);
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

    const { name, phone, email, address, creditLimitPaise } = result.data;
    // Convert creditLimitPaise from rupees to paise (user enters rupees)
    const creditLimit = Math.round(Number(creditLimitPaise || 0) * 100);

    await db
      .update(customers)
      .set({
        name,
        phone: phone || null,
        email: email || null,
        address: address || null,
        creditLimitPaise: creditLimit,
      })
      .where(eq(customers.id, customerId));

    revalidatePath("/customers");
    revalidatePath(`/customers/${customerId}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating customer:", error);
    return { success: false, message: "Failed to update customer" };
  }
}

export async function createCustomerAction(data: CustomerInput) {
  try {
    const session = await getSession();
    if (!session?.user) redirect("/login");

    const shop = await getShopByUserId(session.user.id);
    if (!shop) redirect("/setup");

    const result = customerSchema.safeParse(data);
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

    const { name, phone, email, address, creditLimitPaise } = result.data;
    // Convert creditLimitPaise from rupees to paise (user enters rupees)
    const creditLimit = Math.round(Number(creditLimitPaise || 0) * 100);

    await db.insert(customers).values({
      shopId: shop.id,
      name,
      phone: phone || null,
      email: email || null,
      address: address || null,
      creditLimitPaise: creditLimit,
      outstandingBalancePaise: 0,
    });

    revalidatePath("/customers");
    return { success: true };
  } catch (error) {
    console.error("Error creating customer:", error);
    return { success: false, message: "Failed to create customer" };
  }
}
