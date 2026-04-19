"use client";

import { type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/data-table";
import { formatCurrency } from "@/lib/utils";
import { type Customer } from "@/types";

// ---------------------------------------------------------------------------
// Balance status helper
// ---------------------------------------------------------------------------

type BalanceStatus = "settled" | "has-balance" | "advance";

function getBalanceStatus(customer: Customer): BalanceStatus {
  const balance = customer.outstandingBalancePaise ?? 0;
  if (balance > 0) return "has-balance";
  if (balance < 0) return "advance";
  return "settled";
}

const balanceStatusConfig: Record<
  BalanceStatus,
  { label: string; className: string }
> = {
  settled: {
    label: "Settled",
    className: "bg-muted text-muted-foreground border-border",
  },
  "has-balance": {
    label: "Has Balance",
    className: "bg-red-50 text-red-700 border-red-200",
  },
  advance: {
    label: "Advance",
    className: "bg-green-50 text-green-700 border-green-200",
  },
};

// ---------------------------------------------------------------------------
// Column factory
// ---------------------------------------------------------------------------

export function getCustomerColumns(): ColumnDef<Customer>[] {
  return [
    // Name
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => {
        const customer = row.original;
        return (
          <div className="flex flex-col">
            <span className="font-medium">{customer.name}</span>
            {customer.address && (
              <span className="text-xs text-muted-foreground line-clamp-1">
                {customer.address}
              </span>
            )}
          </div>
        );
      },
    },

    // Phone
    {
      accessorKey: "phone",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Phone" />
      ),
      cell: ({ row }) => {
        const phone = row.original.phone;
        return (
          <span className="font-mono text-muted-foreground">
            {phone || "—"}
          </span>
        );
      },
    },

    // Email
    {
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
      cell: ({ row }) => {
        const email = row.original.email;
        return (
          <span className="text-muted-foreground">
            {email || "—"}
          </span>
        );
      },
    },

    // Outstanding Balance
    {
      accessorKey: "outstandingBalancePaise",
      header: ({ column }) => (
        <div className="text-right">
          <DataTableColumnHeader column={column} title="Outstanding" />
        </div>
      ),
      cell: ({ row }) => {
        const balance = row.original.outstandingBalancePaise ?? 0;
        return (
          <div className="text-right font-mono">
            <span className={balance > 0 ? "text-red-600 font-medium" : "text-green-600"}>
              {formatCurrency(balance)}
            </span>
          </div>
        );
      },
    },

    // Credit Limit
    {
      accessorKey: "creditLimitPaise",
      header: ({ column }) => (
        <div className="text-right">
          <DataTableColumnHeader column={column} title="Credit Limit" />
        </div>
      ),
      cell: ({ row }) => {
        const limit = row.original.creditLimitPaise;
        return (
          <div className="text-right font-mono text-muted-foreground">
            {limit ? formatCurrency(limit) : "—"}
          </div>
        );
      },
    },

    // Balance Status (computed, for filtering)
    {
      id: "balanceStatus",
      accessorFn: (row) => getBalanceStatus(row),
      header: "Status",
      cell: ({ row }) => {
        const status = getBalanceStatus(row.original);
        const config = balanceStatusConfig[status];
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
        const customer = row.original;
        return (
          <div className="flex items-center gap-2">
            <Link href={`/customers/${customer.id}`}>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
              >
                <Eye className="h-4 w-4" />
                <span className="sr-only">View</span>
              </Button>
            </Link>
          </div>
        );
      },
      enableHiding: false,
    },
  ];
}