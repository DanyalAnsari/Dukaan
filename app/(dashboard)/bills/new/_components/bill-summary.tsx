"use client";

import { getCartSubtotal, getCartTotalGst } from "@/stores/cartStore";
import { formatCurrency } from "@/lib/utils";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCartStore } from "@/components/providers/cart-store-provider";
import {
  PAYMENT_METHODS,
  paymentMethodConfig,
} from "../_lib/payment-method-config";

export default function BillSummary() {
  const items = useCartStore((s) => s.items);
  const paymentMethod = useCartStore((s) => s.paymentMethod);
  const amountPaid = useCartStore((s) => s.amountPaid);
  const discountPaise = useCartStore((s) => s.discountPaise);
  const customerId = useCartStore((s) => s.customerId);
  const setPaymentMethod = useCartStore((s) => s.setPaymentMethod);
  const setAmountPaid = useCartStore((s) => s.setAmountPaid);
  const setDiscount = useCartStore((s) => s.setDiscount);

  const [discountInput, setDiscountInput] = useState("");

  const { subtotal, totalGst, total, balanceDue, changeDue } = useMemo(() => {
    const sub = getCartSubtotal(items);
    const gst = getCartTotalGst(items);
    const tot = sub + gst - discountPaise;
    return {
      subtotal: sub,
      totalGst: gst,
      total: tot,
      balanceDue: Math.max(0, tot - amountPaid),
      changeDue: Math.max(0, amountPaid - tot),
    };
  }, [items, discountPaise, amountPaid]);

  const isPartialPayment =
    paymentMethod !== "credit" && amountPaid > 0 && amountPaid < total;

  const handleDiscountChange = (value: string) => {
    setDiscountInput(value);
    setDiscount(Math.round((parseFloat(value) || 0) * 100));
  };

  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle>Bill Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Payment Mode */}
        <div className="space-y-3">
          <Label>Payment Mode</Label>
          <div className="grid grid-cols-2 gap-2">
            {PAYMENT_METHODS.map((mode) => {
              const { icon: Icon, label } = paymentMethodConfig[mode];
              return (
                <Button
                  key={mode}
                  variant={paymentMethod === mode ? "default" : "outline"}
                  disabled={mode === "credit" && !customerId}
                  onClick={() => {
                    setPaymentMethod(mode);
                    setAmountPaid(mode !== "credit" ? total : 0);
                  }}
                  className="h-auto flex-col gap-2 py-3"
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs">{label}</span>
                </Button>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Discount */}
        <div className="space-y-2">
          <Label htmlFor="discount">Discount (₹)</Label>
          <Input
            id="discount"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={discountInput}
            onChange={(e) => handleDiscountChange(e.target.value)}
          />
        </div>

        {/* Amount Paid */}
        {paymentMethod !== "credit" && (
          <div className="space-y-2">
            <Label htmlFor="amountPaid">Amount Received (₹)</Label>
            <Input
              id="amountPaid"
              type="number"
              min="0"
              step="0.01"
              placeholder={formatCurrency(total)}
              value={amountPaid ? amountPaid / 100 : ""}
              onChange={(e) =>
                setAmountPaid(
                  Math.round((parseFloat(e.target.value) || 0) * 100)
                )
              }
            />
          </div>
        )}

        <Separator />

        {/* Totals */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-mono font-medium">
              {formatCurrency(subtotal)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">GST (Total)</span>
            <span className="font-mono font-medium">
              {formatCurrency(totalGst)}
            </span>
          </div>
          {discountPaise > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Discount</span>
              <span className="font-mono font-medium">
                -{formatCurrency(discountPaise)}
              </span>
            </div>
          )}

          <Separator />

          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span className="font-mono">{formatCurrency(total)}</span>
          </div>

          {changeDue > 0 && (
            <div className="flex justify-between rounded-lg bg-green-50 p-3 text-green-700">
              <span className="font-medium">Change Due</span>
              <span className="font-mono font-bold">
                {formatCurrency(changeDue)}
              </span>
            </div>
          )}

          {isPartialPayment && (
            <div className="flex justify-between rounded-lg bg-amber-50 p-3 text-amber-700">
              <span className="font-medium">Balance Due</span>
              <span className="font-mono font-bold">
                {formatCurrency(balanceDue)}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
