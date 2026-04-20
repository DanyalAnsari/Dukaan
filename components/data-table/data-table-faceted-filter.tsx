"use client";

import { type Column } from "@tanstack/react-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterOption {
  label: string;
  value: string;
}

interface DataTableFacetedFilterProps<TData, TValue> {
  column: Column<TData, TValue>;
  title: string;
  options: FilterOption[];
}

/**
 * A select-based faceted filter for a specific column.
 *
 * Usage:
 * ```tsx
 * <DataTableFacetedFilter
 *   column={table.getColumn("status")!}
 *   title="Status"
 *   options={[
 *     { label: "Paid", value: "paid" },
 *     { label: "Credit", value: "credit" },
 *     { label: "Partial", value: "partial" },
 *   ]}
 * />
 * ```
 */
export function DataTableFacetedFilter<TData, TValue>({
  column,
  title,
  options,
}: DataTableFacetedFilterProps<TData, TValue>) {
  return (
    <Select
      value={(column.getFilterValue() as string) ?? "all"}
      onValueChange={(value) => {
        column.setFilterValue(value === "all" ? undefined : value);
      }}
    >
      <SelectTrigger className="h-8 w-[150px]">
        <SelectValue placeholder={`All ${title}`} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All {title}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
