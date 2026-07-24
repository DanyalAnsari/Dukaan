import { notFound } from "next/navigation";
import type { InferSelectModel } from "drizzle-orm";
import { getProductById } from "@/database/data/products";
import { products } from "@/database/schemas";
import { updateProductAction } from "../../_lib/actions";
import type { ProductSchema } from "../../_lib/schema";
import { ProductForm } from "../../_components/product-form";
import { requireShop } from "@/lib/require-shop";

type Product = InferSelectModel<typeof products>;

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;

  const { shop } = await requireShop();

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
