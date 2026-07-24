"use server";

import { redirect } from "next/navigation";
import { db } from "@/database";
import { shops } from "@/database/schemas/business";
import { getSession } from "@/lib/get-session";
import { SetupFormOutput, setupFormSchema } from "./schema";
import { refresh, revalidatePath } from "next/cache";
import { ActionResult } from "@/types";
import { auth } from "@/lib/auth";
import { sendWelcomeEmail } from "@/lib/email";

const slugify = (value: string, userId: string) =>
  `${value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "shop"}-${userId.slice(0, 8)}`;

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
    const organization = await auth.api.createOrganization({
      body: { name, slug: slugify(name, session.user.id), userId: session.user.id },
    });

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
      organizationId: organization.id,
    });

    await sendWelcomeEmail(session.user.email, name);

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
