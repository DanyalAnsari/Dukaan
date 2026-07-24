import Link from "next/link";
import { ArrowRightIcon, CreditCardIcon, UsersIcon } from "lucide-react";
import { requireShopRole } from "@/lib/require-shop";
import { getShopPlan } from "@/lib/plan-limits";
import SettingsForm from "./_components/settings-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function SettingsPage() {
  const { shop, session } = await requireShopRole(["owner"]);
  const plan = await getShopPlan(shop.organizationId);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your shop settings</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CreditCardIcon />Subscription</CardTitle>
            <CardDescription>Your current billing plan and monthly usage.</CardDescription>
            <Badge className="w-fit" variant="secondary">{plan.plan}</Badge>
          </CardHeader>
          <CardContent><Button asChild variant="outline"><Link href="/settings/billing">Manage billing <ArrowRightIcon data-icon="inline-end" /></Link></Button></CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><UsersIcon />Staff</CardTitle>
            <CardDescription>{plan.limits.staff ? `Invite up to ${plan.limits.staff} staff members on your Pro plan.` : "Invite managers and cashiers with the Pro plan."}</CardDescription>
            {plan.limits.staff ? <Badge className="w-fit">Pro</Badge> : <Badge className="w-fit" variant="outline">Pro feature</Badge>}
          </CardHeader>
          <CardContent><Button asChild variant="outline"><Link href="/settings/staff">Manage staff <ArrowRightIcon data-icon="inline-end" /></Link></Button></CardContent>
        </Card>
      </div>

      <SettingsForm shop={shop} user={session.user} />
    </div>
  );
}
