import { requireShopRole } from "@/lib/require-shop";
import { getShopPlan } from "@/lib/plan-limits";
import BillingClient from "./billing-client";

export default async function BillingPage() {
  const { shop } = await requireShopRole(["owner"]);
  const plan = await getShopPlan(shop.organizationId);
  return <BillingClient organizationId={shop.organizationId} billsThisMonth={shop.billsThisMonth} plan={plan} />;
}
