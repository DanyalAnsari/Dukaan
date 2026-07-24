import { forbidden, redirect, unauthorized } from "next/navigation";
import { getSession } from "@/lib/get-session";
import { getShopByUserId } from "@/database/data/shop";
import { db } from "@/database";
import { member } from "@/database/schemas";
import { and, eq } from "drizzle-orm";
import { shops } from "@/database/schemas";
import { auth } from "@/lib/auth";

const slugify = (value: string, userId: string) =>
  `${value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "shop"}-${userId.slice(0, 8)}`;

export async function requireShop() {
  const session = await getSession();
  if (!session?.user) unauthorized();

  let shop = await getShopByUserId(session.user.id);
  if (!shop) return redirect("/setup");

  if (!shop.organizationId && shop.ownerId === session.user.id) {
    const organization = await auth.api.createOrganization({
      body: { name: shop.name, slug: slugify(shop.name, shop.ownerId), userId: shop.ownerId },
    });
    await db.update(shops).set({ organizationId: organization.id }).where(eq(shops.id, shop.id));
    shop = { ...shop, organizationId: organization.id };
  }

  return { session, shop };
}

export async function requireShopRole(roles: Array<"owner" | "admin" | "member">) {
  const { session, shop } = await requireShop();
  if (shop.ownerId === session.user.id && roles.includes("owner")) return { session, shop, role: "owner" as const };
  if (!shop.organizationId) forbidden();

  const membership = await db.query.member.findFirst({
    where: and(
      eq(member.organizationId, shop.organizationId),
      eq(member.userId, session.user.id)
    ),
  });
  if (!membership || !roles.includes(membership.role as "owner" | "admin" | "member")) {
    forbidden();
  }
  return { session, shop, role: membership.role as "owner" | "admin" | "member" };
}
