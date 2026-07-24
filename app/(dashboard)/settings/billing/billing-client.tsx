"use client";

import { toast } from "sonner";
import { CheckIcon, CreditCardIcon } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type Props = {
  organizationId: string | null;
  billsThisMonth: number;
  plan: { plan: string; status: string; trialEndsAt?: Date; limits: { billsPerMonth: number; products: number; customers: number; staff: number; pdfInvoices: number; reports: number } };
};

const plans = [
  { id: "free", name: "Free", price: "₹0", bills: "50", products: "50", customers: "100", extras: ["No PDF invoices", "No reports", "No staff accounts"] },
  { id: "starter", name: "Starter", price: "₹299/mo", bills: "500", products: "500", customers: "Unlimited", extras: ["PDF invoices", "No reports", "No staff accounts"] },
  { id: "pro", name: "Pro", price: "₹799/mo", bills: "Unlimited", products: "Unlimited", customers: "Unlimited", extras: ["PDF invoices", "Reports", "3 staff accounts", "Tally export"] },
];

export default function BillingClient({ organizationId, billsThisMonth, plan }: Props) {
  const upgrade = async (nextPlan: "starter" | "pro") => {
    if (!organizationId) return toast.error("Your shop organization is still being set up.");
    const { error } = await authClient.subscription.upgrade({
      plan: nextPlan,
      referenceId: organizationId,
      customerType: "organization",
      successUrl: "/settings/billing?success=true",
      cancelUrl: "/settings/billing?cancelled=true",
      disableRedirect: false,
    });
    if (error) toast.error(error.message);
  };
  const manage = async () => {
    if (!organizationId) return;
    const { error } = await authClient.subscription.billingPortal({
      referenceId: organizationId,
      customerType: "organization",
      returnUrl: "/settings/billing",
      disableRedirect: false,
    });
    if (error) toast.error(error.message);
  };
  const limit = plan.limits.billsPerMonth;
  const percentage = limit === -1 ? 0 : Math.min(100, (billsThisMonth / limit) * 100);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div><h1 className="text-2xl font-bold">Billing</h1><p className="text-muted-foreground">Choose a plan that fits your shop.</p></div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2">Current plan <Badge variant="secondary">{plan.plan}</Badge></CardTitle><CardDescription>Status: {plan.status}</CardDescription></CardHeader>
        <CardContent className="flex flex-col gap-3"><div className="flex items-center justify-between text-sm"><span>Monthly bills</span><span className="font-mono">{billsThisMonth} / {limit === -1 ? "Unlimited" : limit}</span></div><Progress value={percentage} />{plan.trialEndsAt && <p className="text-sm text-muted-foreground">Trial ends {new Date(plan.trialEndsAt).toLocaleDateString("en-IN")}</p>}</CardContent>
        {plan.plan !== "free" && <CardFooter><Button variant="outline" onClick={manage}><CreditCardIcon data-icon="inline-start" />Manage subscription</Button></CardFooter>}
      </Card>
      <div className="grid gap-4 lg:grid-cols-3">{plans.map((item) => <Card key={item.id} className={item.id === plan.plan ? "ring-1 ring-primary" : undefined}><CardHeader><CardTitle>{item.name}</CardTitle><CardDescription className="font-mono text-lg text-foreground">{item.price}</CardDescription></CardHeader><CardContent><ul className="flex flex-col gap-2 text-sm"><li className="flex gap-2"><CheckIcon />{item.bills} bills/month</li><li className="flex gap-2"><CheckIcon />{item.products} products</li><li className="flex gap-2"><CheckIcon />{item.customers} customers</li>{item.extras.map((extra) => <li className="flex gap-2" key={extra}><CheckIcon />{extra}</li>)}</ul></CardContent><CardFooter><Button className="w-full" variant={item.id === plan.plan ? "secondary" : "default"} disabled={item.id === plan.plan || item.id === "free"} onClick={() => upgrade(item.id as "starter" | "pro")}>{item.id === plan.plan ? "Current plan" : `Upgrade to ${item.name}`}</Button></CardFooter></Card>)}</div>
    </div>
  );
}
