"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { InferSelectModel } from "drizzle-orm";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";

import {
  productSchema,
  type ProductInput,
  type ProductOutput,
  type ProductSchema,
} from "../_lib/schema";
import { products } from "@/database/schemas";
import { buildDefaultValues } from "../_lib/utils";
import { SelectField } from "./select-field";
import { GST_RATE_OPTIONS, UNIT_OPTIONS } from "@/constants";

type Product = InferSelectModel<typeof products>;

interface ProductFormProps {
  initialData?: Product;
  onSubmit: (
    data: ProductSchema
  ) => Promise<{ success: boolean; message?: string }>;
  title: string;
  description: string;
}

export function ProductForm({
  initialData,
  onSubmit: submitAction,
  title,
  description,
}: ProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<ProductInput, unknown, ProductOutput>({
    resolver: zodResolver(productSchema),
    defaultValues: buildDefaultValues(initialData),
  });

  const { errors } = form.formState;

  function onSubmit(data: ProductOutput) {
    const payload: ProductSchema = {
      ...data,
      unitPricePaise: Math.round(data.unitPricePaise * 100),
      mrpPaise: data.mrpPaise != null ? Math.round(data.mrpPaise * 100) : null,
    };

    startTransition(async () => {
      const result = await submitAction(payload);
      if (result.success) {
        toast.success(
          result.message ??
            (initialData ? "Product updated" : "Product created")
        );
        router.push("/products");
      } else {
        toast.error(result.message ?? "Something went wrong");
      }
    });
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/products" aria-label="Back to products">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Name and identifiers</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="name">Product Name</FieldLabel>
                  <Input
                    id="name"
                    {...form.register("name")}
                    placeholder="e.g. Parle-G 100g"
                  />
                  {errors.name && <FieldError errors={[errors.name]} />}
                </Field>

                <Field>
                  <FieldLabel htmlFor="category">Category</FieldLabel>
                  <Input
                    id="category"
                    {...form.register("category")}
                    placeholder="e.g. Snacks, Dairy"
                  />
                  {errors.category && <FieldError errors={[errors.category]} />}
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="sku">SKU</FieldLabel>
                    <Input
                      id="sku"
                      {...form.register("sku")}
                      placeholder="Internal code"
                    />
                    {errors.sku && <FieldError errors={[errors.sku]} />}
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="hsnCode">HSN Code</FieldLabel>
                    <Input
                      id="hsnCode"
                      {...form.register("hsnCode")}
                      placeholder="Tax code"
                    />
                    {errors.hsnCode && <FieldError errors={[errors.hsnCode]} />}
                  </Field>
                </div>

                <SelectField
                  control={form.control}
                  name="unit"
                  label="Unit"
                  htmlFor="unit"
                  placeholder="Select unit"
                  options={UNIT_OPTIONS}
                  error={errors.unit}
                />
              </FieldGroup>
            </CardContent>
          </Card>

          {/* Pricing & Tax */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing & Tax</CardTitle>
              <CardDescription>
                Set your selling price and GST rate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="unitPrice">Sell Price (₹)</FieldLabel>
                    <Input
                      id="unitPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      {...form.register("unitPricePaise", {
                        valueAsNumber: true,
                      })}
                      placeholder="0.00"
                    />
                    {errors.unitPricePaise && (
                      <FieldError errors={[errors.unitPricePaise]} />
                    )}
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="mrp">MRP (₹)</FieldLabel>
                    <Input
                      id="mrp"
                      type="number"
                      step="0.01"
                      min="0"
                      {...form.register("mrpPaise", { valueAsNumber: true })}
                      placeholder="0.00"
                    />
                    {errors.mrpPaise && (
                      <FieldError errors={[errors.mrpPaise]} />
                    )}
                  </Field>
                </div>

                <SelectField
                  control={form.control}
                  name="gstRate"
                  label="GST Rate (%)"
                  htmlFor="gstRate"
                  placeholder="Select GST rate"
                  options={GST_RATE_OPTIONS}
                  error={errors.gstRate}
                  toStringValue={String}
                  fromStringValue={Number}
                />
              </FieldGroup>
            </CardContent>
          </Card>

          {/* Inventory */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Inventory</CardTitle>
              <CardDescription>Stock levels and reorder alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                {" "}
                {/* ← new shadcn FieldGroup prop */}
                <Field className="flex-1">
                  <FieldLabel htmlFor="stockQty">Current Stock</FieldLabel>
                  <Input
                    id="stockQty"
                    type="number"
                    min="0"
                    {...form.register("stockQty", { valueAsNumber: true })}
                    placeholder="Current quantity"
                  />
                  {errors.stockQty && <FieldError errors={[errors.stockQty]} />}
                </Field>
                <Field className="flex-1">
                  <FieldLabel htmlFor="reorderLevel">Reorder Level</FieldLabel>
                  <Input
                    id="reorderLevel"
                    type="number"
                    min="0"
                    {...form.register("reorderLevel", { valueAsNumber: true })}
                    placeholder="Alert at this level"
                  />
                  {errors.reorderLevel && (
                    <FieldError errors={[errors.reorderLevel]} />
                  )}
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex justify-end gap-4">
          <Button variant="outline" type="button" asChild>
            <Link href="/products">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Spinner className="mr-2 h-4 w-4" /> Saving…
              </>
            ) : (
              "Save Product"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
