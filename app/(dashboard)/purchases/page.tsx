import Link from "next/link";
import { Plus, Package } from "lucide-react";
import { getSession } from "@/lib/get-session";
import { getShopByUserId } from "@/database/data/shop";
import { getAllPurchases } from "@/database/data/purchases";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import { purchaseColumns } from "./_components/column";

export default async function PurchasesPage() {
  const session = await getSession();
  const shop = (await getShopByUserId(session!.user.id))!;

  const allPurchases = await getAllPurchases(shop.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-slate-900 dark:text-slate-50">Purchases</h1>
          <p className="font-heading text-sm text-muted-foreground">
            Track your inventory stock-in history.
          </p>
        </div>
        <Button asChild>
          <Link href="/purchases/new">
            <Plus className="mr-2 h-4 w-4" />
            Stock In (Purchase)
          </Link>
        </Button>
      </div>

      {/* Table */}
      {allPurchases.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 mb-4 transition-transform hover:scale-110">
            <Package className="h-10 w-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50">No purchases found</h3>
          <p className="mt-2 text-muted-foreground max-w-xs mx-auto">
            You haven&apos;t recorded any inventory purchases yet.
          </p>
          <Button asChild className="mt-6">
            <Link href="/purchases/new">Record your first purchase</Link>
          </Button>
        </div>
      ) : (
        <DataTable
          columns={purchaseColumns}
          data={allPurchases}
          pageSize={25}
          emptyMessage="No purchases found."
        />
      )}
    </div>
  );
}
