import Link from "next/link";
import { Plus } from "lucide-react";
import { getSession } from "@/lib/get-session";
import { getShopByUserId } from "@/database/data/shop";
import { getActiveProducts } from "@/database/data/products";

import { Button } from "@/components/ui/button";
import StatsCard from "@/components/shared/stats-card";
import { ProductsDataTable } from "./_components/data-table";
import { deleteProductAction } from "./actions";

export default async function ProductsPage() {
  const session = await getSession();
  const shop = (await getShopByUserId(session!.user.id))!;

  // Fetch active products from data layer
  const allProducts = await getActiveProducts(shop.id);

  // Calculate stats
  const totalProducts = allProducts.length;
  const lowStockProducts = allProducts.filter(
    (p) => (p.stockQty ?? 0) > 0 && (p.stockQty ?? 0) <= (p.reorderLevel ?? 10)
  ).length;
  const outOfStockProducts = allProducts.filter(
    (p) => (p.stockQty ?? 0) === 0
  ).length;

  const stats = [
    {
      title: "Total Products",
      stat: totalProducts,
    },
    {
      title: "Low Stock",
      stat: lowStockProducts,
      className: "text-amber-600",
    },
    {
      title: "Out of Stock",
      stat: outOfStockProducts,
      className: "text-red-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Products</h1>
          <p className="font-heading text-sm text-muted-foreground">
            Manage your product catalog.
          </p>
        </div>
        <Button asChild>
          <Link href="/products/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((item) => (
          <StatsCard
            key={item.title}
            title={item.title}
            stat={item.stat}
            contentClassName={item.className}
          />
        ))}
      </div>

      {/* Table */}
      {allProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="mb-4 text-muted-foreground">No products found</p>
          <Button asChild>
            <Link href="/products/new">Add your first product</Link>
          </Button>
        </div>
      ) : (
        <ProductsDataTable
          data={allProducts}
          onDelete={async (id) => {
            "use server";
            await deleteProductAction(id);
          }}
        />
      )}
    </div>
  );
}
