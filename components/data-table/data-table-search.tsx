"use client";

import { type Table } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";

interface DataTableSearchProps<TData> {
  table: Table<TData>;
  placeholder?: string;
  className?: string;
}

/**
 * Global search input wired to the table's globalFilter.
 *
 * Usage:
 * ```tsx
 * <DataTableSearch table={table} placeholder="Search products..." />
 * ```
 */
export function DataTableSearch<TData>({
  table,
  placeholder = "Search...",
  className,
}: DataTableSearchProps<TData>) {
  return (
    <Input
      placeholder={placeholder}
      value={table.getState().globalFilter ?? ""}
      onChange={(event) => table.setGlobalFilter(event.target.value)}
      className={className ?? "max-w-sm"}
    />
  );
}
