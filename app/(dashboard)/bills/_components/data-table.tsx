"use client";

import {
  DataTable,
  DataTableSearch,
  DataTableViewOptions,
} from "@/components/data-table";
import { getBillColumns } from "./column";
import { type BillWithCustomer } from "./types";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function BillsDataTable({ data }: { data: BillWithCustomer[] }) {
  const columns = getBillColumns();

  return (
    <DataTable
      columns={columns}
      data={data}
      pageSize={25}
      emptyMessage="No bills found. Create your first bill to get started."
      initialSorting={[{ id: "billDate", desc: true }]}
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
        console.log(bill.status);
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <DataTableSearch
            table={table}
            placeholder="Search by invoice #, customer..."
          />
          <DataTableViewOptions table={table} />
        </div>
      )}
    />
  );
}