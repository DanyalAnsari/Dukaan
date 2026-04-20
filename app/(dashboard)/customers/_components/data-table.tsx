"use client";

import { type Customer } from "@/types";
import {
  DataTable,
  DataTableSearch,
  DataTableFacetedFilter,
  DataTableViewOptions,
} from "@/components/data-table";
import { getCustomerColumns } from "./column";

// ---------------------------------------------------------------------------
// Balance status filter options
// ---------------------------------------------------------------------------

const balanceStatusOptions = [
  { label: "Settled", value: "settled" },
  { label: "Has Balance", value: "has-balance" },
];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface CustomersDataTableProps {
  data: Customer[];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CustomersDataTable({ data }: CustomersDataTableProps) {
  const columns = getCustomerColumns();

  return (
    <DataTable
      columns={columns}
      data={data}
      pageSize={25}
      emptyMessage="No customers found. Add your first customer to get started."
      globalFilterFn={(row, _columnId, filterValue) => {
        const search = (filterValue as string).toLowerCase();
        const name = (row.getValue("name") as string) ?? "";
        const phone = (row.original as Customer).phone ?? "";
        const email = (row.original as Customer).email ?? "";
        return (
          name.toLowerCase().includes(search) ||
          phone.toLowerCase().includes(search) ||
          email.toLowerCase().includes(search)
        );
      }}
      getRowClassName={(customer) => {
        const balance = customer.outstandingBalancePaise ?? 0;
        if (balance > 0)
          return "text-(--status-unpaid-text) bg-(--status-unpaid-bg)";
        if (balance < 0)
          return "text-(--status-paid-text) bg-(--status-paid-bg)";
        return "";
      }}
      toolbar={(table) => (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <DataTableSearch
            table={table}
            placeholder="Search by name, phone, email..."
          />
          <DataTableFacetedFilter
            column={table.getColumn("balanceStatus")!}
            title="Status"
            options={balanceStatusOptions}
          />
          <DataTableViewOptions table={table} />
        </div>
      )}
    />
  );
}
