import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/get-session";
import { getShopByUserId } from "@/database/data/shop";
import { getProductById } from "@/database/data/products";
import { ProductForm } from "../../_components/product-form";
import { updateProductAction } from "../../actions";

interface EditProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const shop = await getShopByUserId(session.user.id);
  if (!shop) redirect("/setup");

  const product = await getProductById(id, shop.id);
  if (!product) notFound();

  // We need to wrap the action to pass the ID
  const onSubmit = async (data: any) => {
    "use server";
    return updateProductAction(id, data);
  };

  return (
    <ProductForm
      initialData={product as any}
      title="Edit Product"
      description={`Update details for ${product.name}`}
      onSubmit={onSubmit}
    />
  );
}
