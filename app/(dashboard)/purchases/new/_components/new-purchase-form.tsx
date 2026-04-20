"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Loader2, Check, ChevronsUpDown } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { purchaseSchema, type PurchaseInput, type PurchaseOutput } from "../../_lib/schema";
import { createPurchaseAction } from "../../actions";
import { type Product } from "@/types";

interface NewPurchaseFormProps {
  products: Product[];
}

export function NewPurchaseForm({ products }: NewPurchaseFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const form = useForm<PurchaseInput, any, PurchaseOutput>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      productId: "",
      quantity: 1,
      unitCostPaise: 0,
      purchaseDate: new Date().toISOString().split("T")[0],
      supplierName: "",
      batchNumber: "",
      expiryDate: "",
      notes: "",
    },
  });

  const selectedProductId = form.watch("productId");
  const selectedProduct = products.find((p) => p.id === selectedProductId);

  const onSubmit = (data: PurchaseOutput) => {
    startTransition(async () => {
      const result = await createPurchaseAction(data);

      if (result.success) {
        toast.success("Purchase recorded and stock updated");
        router.push("/purchases");
        router.refresh();
      } else {
        toast.error(result.message || "Failed to record purchase");
      }
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Product Selection */}
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
                <FieldLabel>Select Product</FieldLabel>
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
                        : "Search product..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
                    <Command>
                      <CommandInput placeholder="Search product..." />
                      <CommandList>
                        <CommandEmpty>No product found.</CommandEmpty>
                        <CommandGroup>
                          {products.map((product) => (
                            <CommandItem
                              key={product.id}
                              value={product.name}
                              onSelect={() => {
                                form.setValue("productId", product.id);
                                // Pre-fill cost if MRP exists
                                if (
                                  product.unitPricePaise &&
                                  form.getValues("unitCostPaise") === 0
                                ) {
                                  form.setValue(
                                    "unitCostPaise",
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
                                  SKU: {product.sku || "N/A"} | Stock:{" "}
                                  {product.stockQty}
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FieldError errors={[form.formState.errors.productId]} />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="quantity">Quantity</FieldLabel>
                  <Input
                    id="quantity"
                    type="number"
                    {...form.register("quantity", { valueAsNumber: true })}
                    placeholder="1"
                  />
                  <FieldError errors={[form.formState.errors.quantity]} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="unitCost">Unit Cost (₹)</FieldLabel>
                  <Input
                    id="unitCost"
                    type="number"
                    step="0.01"
                    {...form.register("unitCostPaise", { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                  <FieldError errors={[form.formState.errors.unitCostPaise]} />
                </Field>
              </div>
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Purchase Info */}
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
                <FieldError errors={[form.formState.errors.purchaseDate]} />
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
                  <FieldLabel htmlFor="batchNumber">Batch Number</FieldLabel>
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

        {/* Additional Notes */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Notes</CardTitle>
            <CardDescription>
              Any additional details about this purchase
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <Textarea
                  {...form.register("notes")}
                  placeholder="e.g. Received in good condition, Paid via check..."
                  rows={3}
                />
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-4">
        <Link href="/purchases">
          <Button variant="outline" type="button">
            Cancel
          </Button>
        </Link>
        <Button type="submit" disabled={isPending || !selectedProductId}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Recording...
            </>
          ) : (
            "Record Purchase"
          )}
        </Button>
      </div>
    </form>
  );
}
