"use client";

import { BillStatus, type Bill } from "@/types";
import {
  DataTable,
  DataTableFacetedFilter,
  DataTableSearch,
  DataTableViewOptions,
} from "@/components/data-table";
import { getBillColumns } from "./column";
import { endOfDay, parseISO, startOfDay } from "date-fns";
import { ColumnFiltersState } from "@tanstack/react-table";
import { DataTableDateFilter } from "@/components/data-table/data-table-date-filter";
import { CardHeader } from "@/components/ui/card";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface BillWithCustomer extends Bill {
  customer: {
    name: string;
  } | null;
}

const statusOptions = [
  { label: "Draft", value: "draft" },
  { label: "Paid", value: "paid" },
  { label: "Partial", value: "partial" },
  { label: "Credit", value: "credit" },
];

interface BillsDataTableProps {
  data: BillWithCustomer[];
  initialStatus?: string;
  initialFrom?: string;
  initialTo?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function BillsDataTable({
  data,
  initialStatus,
  initialFrom,
  initialTo,
}: BillsDataTableProps) {
  const columns = getBillColumns();

  const initialColumnFilters: ColumnFiltersState = [];

  if (initialStatus) {
    initialColumnFilters.push({ id: "status", value: initialStatus });
  }

  if (initialFrom || initialTo) {
    initialColumnFilters.push({
      id: "billDate",
      value: {
        from: initialFrom ? startOfDay(parseISO(initialFrom)) : undefined,
        to: initialTo ? endOfDay(parseISO(initialTo)) : undefined,
      },
    });
  }

  return (
    <DataTable
      columns={columns}
      data={data}
      pageSize={25}
      emptyMessage="No bills found. Create your first bill to get started."
      initialSorting={[{ id: "billDate", desc: true }]}
      initialColumnFilters={initialColumnFilters}
      globalFilterFn={(row, _columnId, filterValue) => {
        const search = (filterValue as string).toLowerCase();
        const invoiceNumber = (row.getValue("invoiceNumber") as string) ?? "";
        const customerName =
          (row.original as BillWithCustomer).customer?.name ?? "";
        return (
          invoiceNumber.toLowerCase().includes(search) ||
          customerName.toLowerCase().includes(search)
        );
      }}
      getRowClassName={(bill): string => {
        if (bill.status === "draft")
          return "text-(--status-draft-text) bg-(--status-draft-bg)";
        if (bill.status === "credit")
          return "text-(--status-unpaid-text) bg-(--status-unpaid-bg)";
        if (bill.status === "partial")
          return "bg-(--status-partial-bg) text-(--status-partial-text)";
        if (bill.status === "paid")
          return "bg-(--status-paid-bg) text-(--status-paid-text)";
        return " ";
      }}
      toolbar={(table) => (
        <CardHeader className="flex-col gap-4 p-0 md:flex-row md:items-center">
          <DataTableSearch
            table={table}
            placeholder="Search by invoice #, customer..."
          />
          <div className="flex flex-wrap items-center justify-between space-x-2">
            <DataTableFacetedFilter
              column={table.getColumn("status")!}
              title="Status"
              options={statusOptions}
            />
            <DataTableDateFilter column={table.getColumn("billDate")!} />
            <DataTableViewOptions table={table} />
          </div>
        </CardHeader>
      )}
    />
  );
}
