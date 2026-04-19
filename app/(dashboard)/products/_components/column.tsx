"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { Edit, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/data-table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { formatCurrency } from "@/lib/utils";
import { type Product } from "@/types";

// ---------------------------------------------------------------------------
// Stock status helper
// ---------------------------------------------------------------------------

type StockStatus = "in-stock" | "low-stock" | "out-of-stock";

function getStockStatus(product: Product): StockStatus {
  const threshold = product.reorderLevel ?? 10;
  const qty = product.stockQty ?? 0;
  if (qty === 0) return "out-of-stock";
  if (qty <= threshold) return "low-stock";
  return "in-stock";
}

const stockStatusConfig: Record<
  StockStatus,
  { label: string; className: string }
> = {
  "in-stock": {
    label: "In Stock",
    className: "bg-green-50 text-green-700 border-green-200",
  },
  "low-stock": {
    label: "Low Stock",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  "out-of-stock": {
    label: "Out of Stock",
    className: "bg-red-50 text-red-700 border-red-200",
  },
};

// ---------------------------------------------------------------------------
// Column factory
// ---------------------------------------------------------------------------

interface ProductColumnOptions {
  onDelete: (id: string) => void;
}

export function getProductColumns({
  onDelete,
}: ProductColumnOptions): ColumnDef<Product>[] {
  return [
    // Name + SKU
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex flex-col">
            <span className="font-medium">{product.name}</span>
            {product.sku && (
              <span className="font-mono text-xs text-muted-foreground">
                {product.sku}
              </span>
            )}
          </div>
        );
      },
    },
    // Category
    {
      accessorKey: "category",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Category" />
      ),
      cell: ({ row }) => (
        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">
          {row.original.category || "Uncategorized"}
        </span>
      ),
    },

    // Unit Price (actual schema column)
    {
      accessorKey: "unitPricePaise",
      header: ({ column }) => (
        <div className="text-right">
          <DataTableColumnHeader column={column} title="Unit Price" />
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-right font-mono">
          {formatCurrency(row.original.unitPricePaise)}
        </div>
      ),
    },

    // MRP (actual schema column)
    {
      accessorKey: "mrpPaise",
      header: () => <div className="text-right">MRP</div>,
      cell: ({ row }) => {
        const mrp = row.original.mrpPaise;
        return (
          <div className="text-right font-mono text-muted-foreground">
            {mrp ? formatCurrency(mrp) : "—"}
          </div>
        );
      },
    },

    // Stock Qty
    {
      accessorKey: "stockQty",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Stock" />
      ),
      cell: ({ row }) => {
        const product = row.original;
        const stock = product.stockQty ?? 0;
        const threshold = product.reorderLevel ?? 10;

        let dotColor = "bg-green-500";
        let textColor = "";

        if (stock === 0) {
          dotColor = "bg-red-500";
          textColor = "text-red-600";
        } else if (stock <= threshold) {
          dotColor = "bg-amber-500";
          textColor = "text-amber-600";
        }

        return (
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${dotColor}`} />
            <span className={`font-mono ${textColor}`}>
              {stock} {product.unit}
            </span>
          </div>
        );
      },
    },

    // GST Rate
    {
      accessorKey: "gstRate",
      header: () => <div className="text-center">GST%</div>,
      cell: ({ row }) => (
        <div className="text-center">{row.original.gstRate}%</div>
      ),
    },

    // Stock Status (computed, for filtering)
    {
      id: "stockStatus",
      accessorFn: (row) => getStockStatus(row),
      header: "Status",
      cell: ({ row }) => {
        const status = getStockStatus(row.original);
        const config = stockStatusConfig[status];
        return (
          <span
            className={`inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium ${config.className}`}
          >
            {config.label}
          </span>
        );
      },
      filterFn: (row, id, value) => {
        return value === row.getValue(id);
      },
    },

    // Actions
    {
      id: "actions",
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                window.location.href = `/products/${product.id}/edit`;
              }}
            >
              <Edit className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will deactivate the product &quot;{product.name}&quot;.
                    It will no longer appear in search or billing.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(product.id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      },
      enableHiding: false,
    },
  ];
}
