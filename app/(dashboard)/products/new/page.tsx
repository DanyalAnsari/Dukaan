"use client";

import { createProductAction } from "./_lib/actions";
import { ProductForm } from "../_components/product-form";

export default function NewProductPage() {
  return (
    <ProductForm
      title="New Product"
      description="Add a new product to your inventory."
      onSubmit={createProductAction}
    />
  );
}
