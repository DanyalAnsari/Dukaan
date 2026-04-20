"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { DataTableColumnHeader } from "@/components/data-table";
import { formatCurrency } from "@/lib/utils";

export const purchaseColumns: ColumnDef<any>[] = [
  {
    accessorKey: "purchaseDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ row }) => {
      return (
        <div className="font-medium">
          {format(new Date(row.original.purchaseDate), "dd MMM yyyy")}
        </div>
      );
    },
  },
  {
    accessorKey: "product.name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Product" />
    ),
    cell: ({ row }) => {
      const product = row.original.product;
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
  {
    accessorKey: "quantity",
    header: ({ column }) => (
      <div className="text-center">
        <DataTableColumnHeader column={column} title="Qty" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-center font-mono">
        {row.original.quantity} {row.original.product?.unit}
      </div>
    ),
  },
  {
    accessorKey: "unitCostPaise",
    header: ({ column }) => (
      <div className="text-right">
        <DataTableColumnHeader column={column} title="Cost/Unit" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-right font-mono">
        {formatCurrency(row.original.unitCostPaise)}
      </div>
    ),
  },
  {
    id: "totalCost",
    header: () => <div className="text-right">Total Cost</div>,
    cell: ({ row }) => {
      const total = row.original.quantity * row.original.unitCostPaise;
      return (
        <div className="text-right font-mono font-medium">
          {formatCurrency(total)}
        </div>
      );
    },
  },
  {
    accessorKey: "supplierName",
    header: "Supplier",
    cell: ({ row }) => row.original.supplierName || "—",
  },
];
