import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Package, PackageX } from "lucide-react";
import { getSession } from "@/lib/get-session";
import { getShopByUserId } from "@/database/data/shop";
import { getActiveProducts } from "@/database/data/products";
import { Button } from "@/components/ui/button";
import StatsCard from "@/components/shared/stats-card";
import { ProductsDataTable } from "./_components/data-table";
import { deleteProductAction } from "./_lib/actions";

export default async function ProductsPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const shop = await getShopByUserId(session.user.id);
  if (!shop) redirect("/setup");

  const allProducts = await getActiveProducts(shop.id);

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
      icon: Package,
      description: "Active products in catalog",
      className: "font-mono",
    },
    {
      title: "Low Stock",
      stat: lowStockProducts,
      icon: Package,
      description: "Below reorder level",
      className: "font-mono text-partial",
    },
    {
      title: "Out of Stock",
      stat: outOfStockProducts,
      icon: PackageX,
      description: "Zero quantity remaining",
      className: "text-unpaid",
    },
  ];

  return (
    <div className="space-y-6 fade-in">
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
            icon={item.icon}
            title={item.title}
            stat={item.stat}
            contentClassName={item.className}
            description={item.description}
          />
        ))}
      </div>

      <ProductsDataTable
        data={allProducts}
        onDelete={async (id) => {
          "use server";
          await deleteProductAction(id);
        }}
      />
    </div>
  );
}
