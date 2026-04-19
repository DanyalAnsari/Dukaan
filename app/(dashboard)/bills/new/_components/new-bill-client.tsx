"use client";

import { getCartSubtotal, getCartTotal } from "@/stores/cartStore";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, IndianRupee, Package, User } from "lucide-react";
import { Separator } from "@/components/ui/separator";

import StatsCard from "@/components/shared/stats-card";
import CustomerCombobox from "./customer-combobox";
import ProductCombobox from "./product-combobox";
import BillSummary from "./bill-summary";
import ClearCartButton from "./clear-cart-button";
import SubmitButton from "./submit-button";
import CartItemsTable from "./cart-item-table";
import { useMemo } from "react";
import { type Product, type Customer } from "@/types";
import { useCartStore } from "@/components/providers/cart-store-provider";

interface NewBillClientProps {
  products: Product[];
  customers: Customer[];
}

export default function NewBillClient({
  products,
  customers,
}: NewBillClientProps) {
  const { items, customerName, discountPaise } = useCartStore((s) => s);

  const stats = useMemo(() => {
    const subtotal = getCartSubtotal(items);
    const total = getCartTotal(items, discountPaise);
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    return [
      {
        title: "Cart Items",
        stat: totalItems,
        icon: Package,
      },
      {
        title: "Subtotal",
        stat: formatCurrency(subtotal),
        icon: IndianRupee,
      },
      {
        title: "Total",
        stat: formatCurrency(total),
        icon: FileText,
        className: "text-primary",
      },
    ];
  }, [items, discountPaise]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold">New Bill</h1>
          <p className="text-sm text-muted-foreground">
            Create a new sales invoice
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ClearCartButton />
          <SubmitButton />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((item) => (
          <StatsCard
            key={item.title}
            title={item.title}
            stat={item.stat}
            contentClassName={item.className}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Customer & Products */}
        <div className="space-y-6 lg:col-span-2">
          {/* Customer Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <CustomerCombobox customers={customers} />

              {/* Selected Customer Display */}
              {customerName && (
                <div className="rounded-lg border bg-muted/50 p-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-primary/10 p-2">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{customerName}</p>
                      <p className="text-xs text-muted-foreground">
                        Selected customer
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Products */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Products
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ProductCombobox products={products} />
              <Separator />
              <CartItemsTable products={products} />
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Bill Summary */}
        <div className="lg:col-span-1">
          <BillSummary />
        </div>
      </div>
    </div>
  );
}
