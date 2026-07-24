import { getActiveProducts } from "@/database/data/products";
import { NewPurchaseForm } from "./_components/new-purchase-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { requireShop } from "@/lib/require-shop";

interface PageProps {
  // searchParams is a Promise in Next.js 15+
  searchParams: Promise<{ productId?: string }>;
}

export default async function NewPurchasePage({ searchParams }: PageProps) {
  const { shop } = await requireShop();

  const { productId: initialProductId } = await searchParams;
  const activeProducts = await getActiveProducts(shop.id);

  return (
    <div className="max-w-4xl space-y-6">
      {/* Back link — matches the product form pattern */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/purchases" aria-label="Back to purchases">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">Stock In</h1>
          <p className="text-sm text-muted-foreground">
            Record a purchase to update stock levels.
          </p>
        </div>
      </div>

      {/* initialProductId pre-selects the row when coming from /products */}
      <NewPurchaseForm
        products={activeProducts}
        initialProductId={initialProductId}
      />
    </div>
  );
}
