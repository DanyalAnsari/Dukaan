import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Package, TrendingUp, BoxesIcon } from "lucide-react";
import { getSession } from "@/lib/get-session";
import { getShopByUserId } from "@/database/data/shop";
import { getAllPurchases } from "@/database/data/purchases";
import { Button } from "@/components/ui/button";
import StatsCard from "@/components/shared/stats-card";
import { DataTable } from "@/components/data-table";
import { purchaseColumns } from "./_components/column";
import { formatCurrency } from "@/lib/utils";

export default async function PurchasesPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const shop = await getShopByUserId(session.user.id);
  if (!shop) redirect("/setup");

  const allPurchases = await getAllPurchases(shop.id);

  // Stats computed server-side from already-fetched data — no extra DB round-trip
  const totalPurchases = allPurchases.length;
  const totalSpentPaise = allPurchases.reduce(
    (sum, p) => sum + p.unitCostPaise * p.quantity,
    0
  );
  const uniqueProductsCount = new Set(allPurchases.map((p) => p.productId))
    .size;

  const stats = [
    {
      title: "Total Purchases",
      stat: totalPurchases,
      icon: Package,
      description: "All stock-in records",
      className: "font-mono",
    },
    {
      title: "Total Spent",
      // formatCurrency returns a string — StatsCard accepts string | number
      stat: formatCurrency(totalSpentPaise),
      icon: TrendingUp,
      description: "Total inventory spend",
      className: "font-mono",
    },
    {
      title: "Products Restocked",
      stat: uniqueProductsCount,
      icon: BoxesIcon,
      description: "Unique products received",
      className: "font-mono",
    },
  ];

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Purchases</h1>
          <p className="font-heading text-sm text-muted-foreground">
            Track inventory stock-in history and supplier costs.
          </p>
        </div>
        <Button asChild>
          <Link href="/purchases/new">
            <Plus className="mr-2 h-4 w-4" />
            Stock In
          </Link>
        </Button>
      </div>

      {/* Stats — always shown, even when table is empty */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((item) => (
          <StatsCard
            key={item.title}
            icon={item.icon}
            title={item.title}
            stat={item.stat}
            contentClassName={item.className}
            description={item.description}
          />
        ))}
      </div>

      {/* Table */}
      <DataTable
        columns={purchaseColumns}
        data={allPurchases}
        pageSize={25}
        emptyMessage="No purchases recorded yet. Use 'Stock In' to record your first purchase."
      />
    </div>
  );
}
