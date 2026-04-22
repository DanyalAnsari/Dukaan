"use server";

import { redirect } from "next/navigation";
import { db } from "@/database";
import { shops } from "@/database/schemas/business";
import { getSession } from "@/lib/get-session";
import { SetupFormOutput, setupFormSchema } from "./schema";
import { refresh, revalidatePath } from "next/cache";
import { ActionResult } from "@/types";

export async function setupShopAction(
  data: SetupFormOutput
): Promise<ActionResult> {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const result = setupFormSchema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      message: "Invalid form data. Please check all fields.",
      errors: result.error.issues?.map((issue) => ({
        field: issue.path[0],
        message: issue.message,
      })),
    };
  }

  const { name, phone, gstin, pan, upiId, invoicePrefix, address } =
    result.data;
  try {
    await db.insert(shops).values({
      name,
      ownerId: session.user.id,
      phone: phone || null,
      gstin: gstin || null,
      pan: pan || null,
      upiId: upiId || null,
      invoicePrefix,
      address: address || null,
      nextInvoiceNumber: 1, // Start with 1
    });

    revalidatePath("/");
    refresh();
    return { success: true };
  } catch (error) {
    console.error("[shopSetup]", error);
    return {
      success: false,
      message: "Error settinng up shop!",
    };
  }
}
