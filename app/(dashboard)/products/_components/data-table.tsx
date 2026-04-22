"use client";

import { type Product } from "@/types";
import {
  DataTable,
  DataTableSearch,
  DataTableFacetedFilter,
  DataTableViewOptions,
} from "@/components/data-table";
import { getProductColumns } from "./column";
import { CardHeader } from "@/components/ui/card";

// ---------------------------------------------------------------------------
// Stock status filter options
// ---------------------------------------------------------------------------

const stockStatusOptions = [
  { label: "In Stock", value: "in-stock" },
  { label: "Low Stock", value: "low-stock" },
  { label: "Out of Stock", value: "out-of-stock" },
];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ProductsDataTableProps {
  data: Product[];
  onDelete: (id: string) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ProductsDataTable({ data, onDelete }: ProductsDataTableProps) {
  const columns = getProductColumns({ onDelete });

  return (
    <DataTable
      columns={columns}
      data={data}
      pageSize={25}
      emptyMessage="No products found. Add your first product to get started."
      globalFilterFn={(row, _columnId, filterValue) => {
        const search = (filterValue as string).toLowerCase();
        const name = (row.getValue("name") as string) ?? "";
        const sku = (row.original as Product).sku ?? "";
        const category = (row.getValue("category") as string) ?? "";
        return (
          name.toLowerCase().includes(search) ||
          sku.toLowerCase().includes(search) ||
          category.toLowerCase().includes(search)
        );
      }}
      getRowClassName={(product) => {
        const qty = product.stockQty ?? 0;
        const threshold = product.reorderLevel ?? 10;
        if (qty === 0)
          return "bg-(--status-unpaid-bg) text-(--status-unpaid-text)";
        if (qty <= threshold)
          return "bg-(--status-partial-bg) text-(--status-partial-text)";
        return "";
      }}
      toolbar={(table) => (
        <CardHeader className="flex-col gap-4 p-0 md:flex-row md:items-center">
          <DataTableSearch table={table} placeholder="Search by name, SKU..." />
          <div className="flex flex-wrap items-center justify-between space-x-2">
            <DataTableFacetedFilter
              column={table.getColumn("stockStatus")!}
              title="Status"
              options={stockStatusOptions}
            />
            <DataTableViewOptions table={table} />
          </div>
        </CardHeader>
      )}
    />
  );
}
