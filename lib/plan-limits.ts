import { auth, stripeEnabled } from "@/lib/auth";
import { headers } from "next/headers";
import { cache } from "react";

export type PlanLimits = {
  billsPerMonth: number;
  products: number;
  customers: number;
  staff: number;
  pdfInvoices: number;
  reports: number;
};

export const freeLimits: PlanLimits = {
  billsPerMonth: 50,
  products: 50,
  customers: 100,
  staff: 0,
  pdfInvoices: 0,
  reports: 0,
};

export const getShopPlan = cache(async (organizationId?: string | null) => {
  if (!stripeEnabled || !organizationId) return { plan: "free", status: "active", limits: freeLimits };
  const subscriptions = await auth.api.listActiveSubscriptions({
    query: { referenceId: organizationId, customerType: "organization" },
    headers: await headers(),
  });
  const active = subscriptions.find(
    (subscription) => subscription.status === "active" || subscription.status === "trialing"
  );
  return {
    plan: active?.plan ?? "free",
    status: active?.status ?? "active",
    trialEndsAt: active?.trialEnd,
    limits: { ...freeLimits, ...(active?.limits as Partial<PlanLimits> | undefined) },
  };
});

export function assertLimit(current: number, limit: number, label: string) {
  if (limit !== -1 && current >= limit) throw new Error(`${label} limit reached (${limit}). Upgrade your plan.`);
}
