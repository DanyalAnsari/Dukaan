"use server";

import { revalidatePath, refresh } from "next/cache";
import { eq, and } from "drizzle-orm";
import { db } from "@/database";
import { customers } from "@/database/schemas";
import { customerSchema, type CustomerInput } from "./schema";
import { ActionResult } from "@/types";
import { requireShop } from "@/lib/require-shop";

function parseCustomerData(
  data: CustomerInput
): ReturnType<typeof customerSchema.safeParse> {
  return customerSchema.safeParse(data);
}

const CUSTOMERS_PATH = "/customers";

export async function updateCustomerAction(
  customerId: string,
  data: CustomerInput
): Promise<ActionResult> {
  const { shop } = await requireShop();

  const result = parseCustomerData(data);
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
    const { name, phone, email, address, creditLimitRupees } = result.data;
    const creditLimitPaise = Math.round((creditLimitRupees ?? 0) * 100);

    const updated = await db
      .update(customers)
      .set({ name, phone, email, address, creditLimitPaise })
      // and(shopId) ensures the customer belongs to THIS shop — prevents cross-shop mutation
      .where(and(eq(customers.id, customerId), eq(customers.shopId, shop.id)))
      .returning();

    if (updated.length === 0) {
      return { success: false, message: "Customer not found" };
    }

    revalidatePath(CUSTOMERS_PATH);
    revalidatePath(`${CUSTOMERS_PATH}/${customerId}`);
    refresh();

    return { success: true, message: "Customer updated successfully" };
  } catch (error) {
    console.error("[updateCustomer]", error);
    return {
      success: false,
      message: "Failed to update customer. Please try again.",
    };
  }
}

// ─── Create ──────────────────────────────────────────────────────────────────

export async function createCustomerAction(
  data: CustomerInput
): Promise<ActionResult> {
  const { shop } = await requireShop();

  const result = parseCustomerData(data);
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
    const { name, phone, email, address, creditLimitRupees } = result.data;
    const creditLimitPaise = Math.round((creditLimitRupees ?? 0) * 100);

    await db.insert(customers).values({
      shopId: shop.id,
      name,
      phone,
      email,
      address,
      creditLimitPaise,
      outstandingBalancePaise: 0,
    });

    revalidatePath(CUSTOMERS_PATH);
    refresh();

    return { success: true, message: "Customer created successfully" };
  } catch (error) {
    console.error("[createCustomer]", error);
    return {
      success: false,
      message: "Failed to create customer. Please try again.",
    };
  }
}
