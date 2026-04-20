"use server";

import { redirect } from "next/navigation";
import { db } from "@/database";
import { shops } from "@/database/schemas/business";
import { getSession } from "@/lib/get-session";
import { setupFormSchema } from "./schema";
import { revalidatePath } from "next/cache";

export async function setupShopAction(
  // prevState: ActionState,
  formData: FormData
) {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const values = Object.fromEntries(formData.entries());
  
  const result = setupFormSchema.safeParse(values);

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

  const { name, phone, gstin, pan, upiId, invoicePrefix, address } = result.data;

  await db
    .insert(shops)
    .values({
      name,
      ownerId: session.user.id,
      phone: phone || null,
      gstin: gstin || null,
      pan: pan || null,
      upiId: upiId || null,
      invoicePrefix,
      address: address || null,
      nextInvoiceNumber: 1, // Start with 1
    })
    .returning();

  revalidatePath("/");
  return {
    success: true,
    message: "Form submitted successfully!",
    errors: [],
  };
}

/* 
type ActionState = {
  success: boolean | null;
  message: string | null;
  errors: {
    field: PropertyKey;
    message: string;
  }[];
} | null;
 */
