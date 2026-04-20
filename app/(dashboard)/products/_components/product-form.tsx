"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { productSchema, type ProductInput, type ProductOutput } from "../_lib/schema";
import { type Product } from "@/types";

interface ProductFormProps {
  initialData?: Product;
  onSubmit: (data: any) => Promise<{ success: boolean; message?: string }>;
  title: string;
  description: string;
}

export function ProductForm({ initialData, onSubmit: submitAction, title, description }: ProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<ProductInput, any, ProductOutput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initialData?.name || "",
      category: initialData?.category || "Uncategorized",
      sku: initialData?.sku || "",
      barcode: initialData?.barcode || "",
      hsnCode: initialData?.hsnCode || "",
      unit: initialData?.unit || "pcs",
      unitPricePaise: initialData ? initialData.unitPricePaise / 100 : 0,
      mrpPaise: initialData?.mrpPaise ? initialData.mrpPaise / 100 : 0,
      gstRate: initialData?.gstRate || 18,
      stockQty: initialData?.stockQty || 0,
      reorderLevel: initialData?.reorderLevel || 10,
    },
  });

  const onSubmit = (data: ProductOutput) => {
    const payload = {
      ...data,
      unitPricePaise: Math.round(data.unitPricePaise * 100),
      mrpPaise: data.mrpPaise ? Math.round(data.mrpPaise * 100) : null,
    };

    startTransition(async () => {
      const result = await submitAction(payload);

      if (result.success) {
        toast.success(initialData ? "Product updated successfully" : "Product created successfully");
        router.push("/products");
        router.refresh();
      } else {
        toast.error(result.message || "Something went wrong");
      }
    });
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/products">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
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
                  <FieldError errors={[form.formState.errors.name]} />
                </Field>
                
                <Field>
                  <FieldLabel htmlFor="category">Category</FieldLabel>
                  <Input
                    id="category"
                    {...form.register("category")}
                    placeholder="e.g. Snacks, Dairy, Drinks"
                  />
                  <FieldError errors={[form.formState.errors.category]} />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="sku">SKU</FieldLabel>
                    <Input
                      id="sku"
                      {...form.register("sku")}
                      placeholder="Internal code"
                    />
                    <FieldError errors={[form.formState.errors.sku]} />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="hsnCode">HSN Code</FieldLabel>
                    <Input
                      id="hsnCode"
                      {...form.register("hsnCode")}
                      placeholder="Tax code"
                    />
                    <FieldError errors={[form.formState.errors.hsnCode]} />
                  </Field>
                </div>

                <Field>
                  <FieldLabel htmlFor="unit">Unit</FieldLabel>
                  <Select
                    value={form.watch("unit")}
                    onValueChange={(val) => form.setValue("unit", val, { shouldDirty: true })}
                  >
                    <SelectTrigger id="unit">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pcs">Pieces (pcs)</SelectItem>
                      <SelectItem value="kg">Kilogram (kg)</SelectItem>
                      <SelectItem value="g">Gram (g)</SelectItem>
                      <SelectItem value="ltr">Liter (ltr)</SelectItem>
                      <SelectItem value="pkt">Packet (pkt)</SelectItem>
                      <SelectItem value="box">Box</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldError errors={[form.formState.errors.unit]} />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          {/* Pricing & GST */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing & Tax</CardTitle>
              <CardDescription>Set your selling price</CardDescription>
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
                      {...form.register("unitPricePaise", { valueAsNumber: true })}
                      placeholder="0.00"
                    />
                    <FieldError errors={[form.formState.errors.unitPricePaise]} />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="mrp">MRP (₹)</FieldLabel>
                    <Input
                      id="mrp"
                      type="number"
                      step="0.01"
                      {...form.register("mrpPaise", { valueAsNumber: true })}
                      placeholder="0.00"
                    />
                    <FieldError errors={[form.formState.errors.mrpPaise]} />
                  </Field>
                </div>

                <Field>
                  <FieldLabel htmlFor="gstRate">GST Rate (%)</FieldLabel>
                  <Select
                    value={form.watch("gstRate").toString()}
                    onValueChange={(val) => form.setValue("gstRate", Number(val), { shouldDirty: true })}
                  >
                    <SelectTrigger id="gstRate">
                      <SelectValue placeholder="Select GST" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0% (Nil)</SelectItem>
                      <SelectItem value="5">5%</SelectItem>
                      <SelectItem value="12">12%</SelectItem>
                      <SelectItem value="18">18%</SelectItem>
                      <SelectItem value="28">28%</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldError errors={[form.formState.errors.gstRate]} />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          {/* Inventory */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Inventory</CardTitle>
              <CardDescription>Stock management</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup className="flex-row">
                <Field className="flex-1">
                  <FieldLabel htmlFor="stockQty">Current Stock</FieldLabel>
                  <Input
                    id="stockQty"
                    type="number"
                    {...form.register("stockQty", { valueAsNumber: true })}
                    placeholder="Current quantity"
                  />
                  <FieldError errors={[form.formState.errors.stockQty]} />
                </Field>
                <Field className="flex-1">
                  <FieldLabel htmlFor="reorderLevel">Reorder Level</FieldLabel>
                  <Input
                    id="reorderLevel"
                    type="number"
                    {...form.register("reorderLevel", { valueAsNumber: true })}
                    placeholder="Alert at this level"
                  />
                  <FieldError errors={[form.formState.errors.reorderLevel]} />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <Link href="/products">
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
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
