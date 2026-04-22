"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { toast } from "sonner";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { InferSelectModel } from "drizzle-orm";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  purchaseSchema,
  type PurchaseInput,
  type PurchaseOutput,
} from "../../_lib/schema";
import { products } from "@/database/schemas";
import { createPurchaseAction } from "../../_lib/actions";

type Product = InferSelectModel<typeof products>;

interface NewPurchaseFormProps {
  products: Product[];
  // Passed from page when navigating from a product row's Restock button
  initialProductId?: string;
}

// ─── Default values factory ───────────────────────────────────────────────────

function buildDefaultValues(
  productList: Product[],
  initialProductId?: string
): PurchaseInput {
  const preSelected = initialProductId
    ? productList.find((p) => p.id === initialProductId)
    : undefined;

  return {
    productId: initialProductId ?? "",
    quantity: 1,
    // Pre-fill unit cost from the product's sell price if coming from a restock link
    unitCostRupees: preSelected ? preSelected.unitPricePaise / 100 : 0,
    purchaseDate: new Date().toISOString().split("T")[0],
    supplierName: "",
    batchNumber: "",
    expiryDate: "",
    notes: "",
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export function NewPurchaseForm({
  products,
  initialProductId,
}: NewPurchaseFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const form = useForm<PurchaseInput, unknown, PurchaseOutput>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: buildDefaultValues(products, initialProductId),
  });

  const { errors } = form.formState;
  const selectedProductId = form.watch("productId");
  const selectedProduct = products.find((p) => p.id === selectedProductId);

  function onSubmit(data: PurchaseOutput) {
    startTransition(async () => {
      const result = await createPurchaseAction(data);

      if (result.success) {
        toast.success("Purchase recorded — stock updated");
        router.push("/purchases");
        // No router.refresh() needed — server action calls refresh() from next/cache
      } else {
        toast.error(result.message ?? "Failed to record purchase");
      }
    });
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-6"
      noValidate
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Product selection */}
        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
            <CardDescription>
              Select the product being restocked
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel>Product</FieldLabel>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full justify-between"
                    >
                      {selectedProduct
                        ? selectedProduct.name
                        : "Search product…"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
                    <Command>
                      <CommandInput placeholder="Search product…" />
                      <CommandList>
                        <CommandEmpty>No product found.</CommandEmpty>
                        <CommandGroup>
                          {products.map((product) => (
                            <CommandItem
                              key={product.id}
                              value={product.name}
                              onSelect={() => {
                                form.setValue("productId", product.id, {
                                  shouldValidate: true,
                                });
                                // Pre-fill cost from sell price only if field is still 0
                                if (form.getValues("unitCostRupees") === 0) {
                                  form.setValue(
                                    "unitCostRupees",
                                    product.unitPricePaise / 100
                                  );
                                }
                                setOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedProductId === product.id
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              <div className="flex flex-col">
                                <span>{product.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  SKU: {product.sku ?? "N/A"} | Stock:{" "}
                                  {product.stockQty}
                                  {(product.stockQty ?? 0) === 0 && (
                                    <span className="ml-1 text-red-500">
                                      · Out of stock
                                    </span>
                                  )}
                                  {(product.stockQty ?? 0) > 0 &&
                                    (product.stockQty ?? 0) <=
                                      (product.reorderLevel ?? 10) && (
                                      <span className="ml-1 text-amber-500">
                                        · Low stock
                                      </span>
                                    )}
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {errors.productId && <FieldError errors={[errors.productId]} />}
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="quantity">Quantity</FieldLabel>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    {...form.register("quantity", { valueAsNumber: true })}
                    placeholder="1"
                  />
                  {errors.quantity && <FieldError errors={[errors.quantity]} />}
                </Field>
                <Field>
                  <FieldLabel htmlFor="unitCost">Unit Cost (₹)</FieldLabel>
                  <Input
                    id="unitCost"
                    type="number"
                    min="0"
                    step="0.01"
                    {...form.register("unitCostRupees", {
                      valueAsNumber: true,
                    })}
                    placeholder="0.00"
                  />
                  {errors.unitCostRupees && (
                    <FieldError errors={[errors.unitCostRupees]} />
                  )}
                </Field>
              </div>

              {/* Live stock preview — only shown when a product is selected */}
              {selectedProduct && (
                <div className="space-y-1 rounded-lg bg-muted px-4 py-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current stock</span>
                    <span className="font-mono font-medium">
                      {selectedProduct.stockQty} {selectedProduct.unit}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      After this purchase
                    </span>
                    <span className="font-mono font-medium text-green-600">
                      {(selectedProduct.stockQty ?? 0) +
                        (Number(form.watch("quantity")) || 0)}
                      {selectedProduct.unit}
                    </span>
                  </div>
                </div>
              )}
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Purchase info */}
        <Card>
          <CardHeader>
            <CardTitle>Purchase Info</CardTitle>
            <CardDescription>Supplier and date information</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="purchaseDate">Purchase Date</FieldLabel>
                <Input
                  id="purchaseDate"
                  type="date"
                  {...form.register("purchaseDate")}
                />
                {errors.purchaseDate && (
                  <FieldError errors={[errors.purchaseDate]} />
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="supplierName">Supplier Name</FieldLabel>
                <Input
                  id="supplierName"
                  {...form.register("supplierName")}
                  placeholder="e.g. Wholesale Dist Ltd"
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="batchNumber">Batch No.</FieldLabel>
                  <Input
                    id="batchNumber"
                    {...form.register("batchNumber")}
                    placeholder="Optional"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="expiryDate">Expiry Date</FieldLabel>
                  <Input
                    id="expiryDate"
                    type="date"
                    {...form.register("expiryDate")}
                  />
                </Field>
              </div>
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Notes</CardTitle>
            <CardDescription>
              Any additional details about this purchase
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              {...form.register("notes")}
              placeholder="e.g. Received in good condition, paid via cheque…"
              rows={3}
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-4">
        <Button variant="outline" type="button" asChild>
          <Link href="/purchases">Cancel</Link>
        </Button>
        <Button type="submit" disabled={isPending || !selectedProductId}>
          {isPending ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              Recording…
            </>
          ) : (
            "Record Purchase"
          )}
        </Button>
      </div>
    </form>
  );
}
