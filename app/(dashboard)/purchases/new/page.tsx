import { redirect } from "next/navigation";
import { getSession } from "@/lib/get-session";
import { getShopByUserId } from "@/database/data/shop";
import { getActiveProducts } from "@/database/data/products";
import { NewPurchaseForm } from "./_components/new-purchase-form";

export default async function NewPurchasePage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const shop = await getShopByUserId(session.user.id);
  if (!shop) redirect("/setup");

  // Fetch products for the selection
  const products = await getActiveProducts(shop.id);

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Stock In (Purchase)</h1>
        <p className="text-sm text-muted-foreground">
          Record a new inventory purchase to update stock levels.
        </p>
      </div>

      <NewPurchaseForm products={products as any} />
    </div>
  );
}
