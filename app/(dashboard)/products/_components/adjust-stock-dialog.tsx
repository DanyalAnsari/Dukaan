"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { adjustStockAction } from "../_lib/actions";
import { type Product } from "@/types";

interface AdjustStockDialogProps {
  product: Product;
  trigger: React.ReactNode;
}

export function AdjustStockDialog({ product, trigger }: AdjustStockDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [mode, setMode] = useState<"add" | "remove">("add");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("Count Correction");
  const [notes, setNotes] = useState("");

  const handleAdjust = () => {
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      toast.error("Please enter a valid positive quantity");
      return;
    }

    const adjustmentQty = mode === "add" ? qty : -qty;

    startTransition(async () => {
      const res = await adjustStockAction(product.id, adjustmentQty, reason, notes);
      if (res.success) {
        toast.success("Stock adjusted successfully");
        setQuantity("");
        setNotes("");
        setOpen(false);
      } else {
        toast.error(res.message || "Failed to adjust stock");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adjust Stock</DialogTitle>
          <DialogDescription>
            Correct the stock level for <strong>{product.name}</strong>.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between rounded-lg bg-muted p-3 text-sm">
            <span className="text-muted-foreground">Current Stock:</span>
            <span className="font-mono font-bold text-base">
              {product.stockQty} {product.unit}
            </span>
          </div>

          <FieldGroup>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={mode === "add" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setMode("add")}
              >
                Add Stock
              </Button>
              <Button
                type="button"
                variant={mode === "remove" ? "destructive" : "outline"}
                className="flex-1"
                onClick={() => setMode("remove")}
              >
                Remove Stock
              </Button>
            </div>

            <Field>
              <FieldLabel htmlFor="qty">Quantity</FieldLabel>
              <Input
                id="qty"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 10"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="reason">Reason</FieldLabel>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="Count Correction">Count Correction</SelectItem>
                    <SelectItem value="Damaged">Damaged</SelectItem>
                    <SelectItem value="Theft">Theft</SelectItem>
                    <SelectItem value="Opening Stock">Opening Stock</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor="notes">Notes (Optional)</FieldLabel>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe why stock was adjusted..."
                rows={3}
              />
            </Field>
          </FieldGroup>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleAdjust} disabled={isPending} variant={mode === "remove" ? "destructive" : "default"}>
            {isPending ? "Adjusting..." : "Submit Adjustment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
