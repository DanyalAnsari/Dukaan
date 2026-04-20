"use client";

import { useCartStore } from "@/components/providers/cart-store-provider";
import { Badge } from "@/components/ui/badge";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { formatCurrency } from "@/lib/utils";
import { AlertTriangle, Package } from "lucide-react";
import { useCallback, useState, useEffect } from "react";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  sku: string | null;
  hsnCode: string | null;
  unitPricePaise: number;
  mrpPaise: number | null;
  gstRate: number | null;
  stockQty: number | null;
  unit: string | null;
}

interface ProductComboboxProps {
  products: Product[];
}

export default function ProductCombobox({ products }: ProductComboboxProps) {
  const { items, addItem } = useCartStore((s) => s);
  const [open, setOpen] = useState(false);

  // Focus shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Shortcut "/" to focus product search
      if (
        e.key === "/" &&
        (e.target as HTMLElement).tagName !== "INPUT" &&
        (e.target as HTMLElement).tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        const input = document.querySelector(
          'input[placeholder*="Search products"]'
        ) as HTMLInputElement;
        if (input) {
          input.focus();
        } else {
          setOpen(true);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleAddProduct = useCallback(
    (product: Product) => {
      const existingItem = items.find((i) => i.productId === product.id);
      const currentQty = existingItem?.quantity || 0;
      const stockQty = product.stockQty ?? 999;

      if (stockQty === 0) {
        toast.error(`${product.name} is out of stock`);
        return;
      }

      if (currentQty >= stockQty) {
        toast.error(`Maximum stock reached for ${product.name}`);
        return;
      }

      addItem({
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        hsnCode: product.hsnCode,
        unitPricePaise: product.unitPricePaise,
        gstRate: product.gstRate || 0,
        quantity: 1,
      });

      // Low stock warning
      const newQty = currentQty + 1;
      if (stockQty <= 5 && newQty <= stockQty) {
        toast.warning(
          `Low stock: Only ${stockQty - newQty} left for ${product.name}`
        );
      } else {
        toast.success(`${product.name} added to cart`);
      }

      // Close dropdown after selection (Option A behavior)
      setOpen(false);
    },
    [addItem, items]
  );

  return (
    <Combobox
      items={products}
      itemToStringValue={(item: Product) => `${item.name} ${item.sku || ""}`}
      itemToStringLabel={(item: Product) => `${item.name} ${item.sku || ""}`}
      onValueChange={(item) => {
        if (item) {
          handleAddProduct(item);
        }
      }}
      open={open}
      onOpenChange={setOpen}
      autoHighlight
    >
      <ComboboxInput
        autoFocus
        placeholder="Search products by name or SKU..."
      />
      <ComboboxContent className="w-[--radix-combobox-trigger-width]">
        <ComboboxEmpty>
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <Package className="h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">No products found</p>
          </div>
        </ComboboxEmpty>
        <ComboboxList>
          {(item) => {
            const product = item as Product;
            const existingItem = items.find((i) => i.productId === product.id);
            const currentQty = existingItem?.quantity || 0;
            const stockQty = product.stockQty ?? 999;
            const isOutOfStock = stockQty === 0;
            const isAtMax = currentQty >= stockQty;
            const isLowStock = stockQty > 0 && stockQty <= 5;

            return (
              <ComboboxItem
                key={product.id}
                value={product}
                disabled={isAtMax || isOutOfStock}
                className="flex items-center justify-between gap-4 py-3"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="truncate font-medium">{product.name}</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {product.sku || "No SKU"}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <div className="text-right">
                    <div className="font-mono font-medium whitespace-nowrap">
                      {formatCurrency(product.unitPricePaise)}
                    </div>
                    <div
                      className={`text-xs whitespace-nowrap ${
                        isOutOfStock
                          ? "font-medium text-destructive"
                          : isLowStock
                            ? "font-medium text-amber-600"
                            : "text-muted-foreground"
                      }`}
                    >
                      {isOutOfStock ? (
                        <span className="flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Out of Stock
                        </span>
                      ) : (
                        <>
                          Stock: {stockQty} • GST {product.gstRate || 0}%
                        </>
                      )}
                    </div>
                  </div>
                  {isLowStock && !isOutOfStock && (
                    <Badge
                      variant="outline"
                      className="shrink-0 border-amber-600 text-amber-600"
                    >
                      Low
                    </Badge>
                  )}
                  {isAtMax && !isOutOfStock && (
                    <Badge variant="secondary" className="shrink-0">
                      Max
                    </Badge>
                  )}
                </div>
              </ComboboxItem>
            );
          }}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}