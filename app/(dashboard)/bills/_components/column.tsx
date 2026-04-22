"use client";

import { FilterFn, Row, type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/data-table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { BillStatus, type Bill } from "@/types";
import { endOfDay, isWithinInterval, startOfDay } from "date-fns";

// ---------------------------------------------------------------------------
// Bill status helper
// ---------------------------------------------------------------------------

function getBillStatus(bill: Bill): BillStatus {
  return (bill.status as BillStatus) ?? "draft";
}

const statusConfig: Record<BillStatus, { label: string; className: string }> = {
  paid: {
    label: "Paid",
    className: "bg-paid text-paid border-green-200",
  },
  credit: {
    label: "Credit",
    className: "bg-unpaid text-unpaid border-red-200",
  },
  partial: {
    label: "Partial",
    className: "bg-partial text-partial border-amber-200",
  },
  draft: {
    label: "Draft",
    className: "bg-draft text-draft border-gray-200",
  },
};

export const dateRangeFilterFn: FilterFn<BillWithCustomer> = (
  row: Row<BillWithCustomer>,
  columnId: string,
  value: { from?: Date; to?: Date }
) => {
  const rawDate = row.getValue(columnId);
  if (!rawDate) return true;

  const date = new Date(rawDate as string);
  const { from, to } = value;

  // No filter set — show all
  if (!from && !to) return true;

  // Only from
  if (from && !to) return date >= from;

  // Only to
  if (!from && to) return date <= to;

  // Both — use interval check
  return isWithinInterval(date, {
    start: startOfDay(from!),
    end: endOfDay(to!),
  });
};

dateRangeFilterFn.autoRemove = (val) => !val || (!val.from && !val.to);
// ---------------------------------------------------------------------------
// Column factory
// ---------------------------------------------------------------------------

interface BillWithCustomer extends Bill {
  customer: {
    name: string;
  } | null;
}

export function getBillColumns(): ColumnDef<BillWithCustomer>[] {
  return [
    // Invoice Number
    {
      accessorKey: "invoiceNumber",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Invoice #" />
      ),
      cell: ({ row }) => {
        const bill = row.original;
        return (
          <span className="font-mono font-medium">{bill.invoiceNumber}</span>
        );
      },
    },

    // Date
    {
      accessorKey: "billDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date" />
      ),
      cell: ({ row }) => {
        const bill = row.original;
        return (
          <span className="text-muted-foreground">
            {formatDate(new Date(bill.billDate))}
          </span>
        );
      },
      sortingFn: "datetime",
      filterFn: dateRangeFilterFn,
    },

    // Customer
    {
      accessorKey: "customerName",
      header: "Customer",
      cell: ({ row }) => {
        const customerName = (row.original as BillWithCustomer).customer?.name;
        return (
          <span className="text-muted-foreground">
            {customerName || "Walk-in Customer"}
          </span>
        );
      },
    },

    // Total Amount
    {
      accessorKey: "totalPaise",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Total" />
      ),
      cell: ({ row }) => (
        <div className="font-mono">
          {formatCurrency(row.original.totalPaise)}
        </div>
      ),
    },

    // Due Amount
    {
      accessorKey: "amountDuePaise",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Due" />
      ),
      cell: ({ row }) => (
        <div className="font-mono">
          {formatCurrency(row.original.amountDuePaise ?? 0)}
        </div>
      ),
    },
    // Paid Amount
    {
      accessorKey: "amountPaidPaise",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Paid" />
      ),
      cell: ({ row }) => (
        <div className="font-mono">
          {formatCurrency(row.original.amountPaidPaise ?? 0)}
        </div>
      ),
    },

    // Status
    {
      id: "status",
      accessorFn: (row) => getBillStatus(row),
      header: "Status",
      cell: ({ row }) => {
        const status = getBillStatus(row.original);
        const config = statusConfig[status];
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
      header: "View",
      cell: ({ row }) => {
        const bill = row.original;
        return (
          <div className="flex items-center gap-2">
            <Link href={`/bills/${bill.id}`}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <FileText className="h-4 w-4" />
                <span className="sr-only">View Invoice</span>
              </Button>
            </Link>
          </div>
        );
      },
      enableHiding: false,
    },
  ];
}
