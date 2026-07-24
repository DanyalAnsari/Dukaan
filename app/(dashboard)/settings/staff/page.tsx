import { requireShopRole } from "@/lib/require-shop";
import { getShopPlan } from "@/lib/plan-limits";
import StaffClient from "./staff-client";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function StaffPage() {
  const { shop } = await requireShopRole(["owner"]);
  const plan = await getShopPlan(shop.organizationId);
  const members = shop.organizationId
    ? (
        await auth.api.listMembers({
          query: { organizationId: shop.organizationId },
          headers: await headers(),
        })
      ).members
    : [];
  return <StaffClient organizationId={shop.organizationId} initialMembers={members} canManage staffLimit={plan.limits.staff} />;
}
