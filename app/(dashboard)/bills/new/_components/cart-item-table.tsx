"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/components/providers/cart-store-provider";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useCallback } from "react";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  stockQty: number | null;
}

interface CartItemsTableProps {
  products: Product[];
}

export default function CartItemsTable({ products }: CartItemsTableProps) {
  const { items, updateQty, removeItem } = useCartStore((state) => state);

  const handleUpdateQty = useCallback(
    (productId: string, newQty: number) => {
      if (newQty <= 0) {
        removeItem(productId);
        toast.success("Item removed from cart");
      } else {
        updateQty(productId, newQty);
      }
    },
    [updateQty, removeItem]
  );

  const handleRemoveItem = useCallback(
    (productId: string) => {
      removeItem(productId);
      toast.success("Item removed from cart");
    },
    [removeItem]
  );

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
        <ShoppingCart className="mb-4 h-12 w-12 text-muted-foreground/50" />
        <p className="mb-2 font-medium text-muted-foreground">
          No items in cart
        </p>
        <p className="text-sm text-muted-foreground">
          Search and add products to get started
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-center">Quantity</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const product = products.find((p) => p.id === item.productId);
            const maxQty = product?.stockQty ?? 999;
            const itemTotal = item.unitPricePaise * item.quantity;

            return (
              <TableRow key={item.productId}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{item.productName}</span>
                    <span className="text-xs text-muted-foreground">
                      {item.productSku || "No SKU"} • GST: {item.gstRate}%
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono">
                  {formatCurrency(item.unitPricePaise)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() =>
                        handleUpdateQty(item.productId, item.quantity - 1)
                      }
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <Input
                      type="number"
                      className="h-8 w-16 px-1 text-center tabular-nums"
                      value={item.quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val)) {
                          handleUpdateQty(
                            item.productId,
                            Math.min(val, maxQty)
                          );
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() =>
                        handleUpdateQty(item.productId, item.quantity + 1)
                      }
                      disabled={item.quantity >= maxQty}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono font-medium">
                  {formatCurrency(itemTotal)}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => handleRemoveItem(item.productId)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
