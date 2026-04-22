import { notFound, redirect } from "next/navigation";
import type { InferSelectModel } from "drizzle-orm";
import { getSession } from "@/lib/get-session";
import { getShopByUserId } from "@/database/data/shop";
import { getProductById } from "@/database/data/products";
import { products } from "@/database/schemas";
import { updateProductAction } from "../../_lib/actions";
import type { ProductSchema } from "../../_lib/schema";
import { ProductForm } from "../../_components/product-form";

type Product = InferSelectModel<typeof products>;

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;

  const session = await getSession();
  if (!session?.user) redirect("/login");

  const shop = await getShopByUserId(session.user.id);
  if (!shop) redirect("/setup");

  const product = await getProductById(id, shop.id);
  if (!product) notFound();

  // Stable bound server action — avoids the inline "use server" closure anti-pattern
  async function boundUpdateAction(data: ProductSchema) {
    "use server";
    return updateProductAction(id, data);
  }

  return (
    <ProductForm
      initialData={product as Product}
      title="Edit Product"
      description={`Update details for ${product.name}`}
      onSubmit={boundUpdateAction}
    />
  );
}
