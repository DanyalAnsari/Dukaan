import { getSession } from "@/lib/get-session";
import { getShopByUserId } from "@/database/data/shop";
import NewBillClient from "./_components/new-bill-client";
import { getActiveProducts } from "@/database/data/products";
import { getActiveCustomers } from "@/database/data/customers";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";

export const metadata = {
  title: "New Bill | POS",
  description: "Create a new sales invoice",
};

export default async function NewBillPage() {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const shop = await getShopByUserId(session.user.id);
  if (!shop) {
    notFound();
  }

  // Parallel data fetching
  const [products, customers] = await Promise.all([
    getActiveProducts(shop.id),
    getActiveCustomers(shop.id),
  ]);

  return <NewBillClient products={products} customers={customers} />;
}