"use client";

import * as React from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  type RowSelectionState,
  type TableOptions,
  type Table as TanStackTable,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface DataTableProps<TData, TValue> {
  /** Column definitions — generated per-page via a `getColumns()` factory. */
  columns: ColumnDef<TData, TValue>[];

  /** The data array to display. */
  data: TData[];

  /**
   * Optional global filter function.
   * When provided, the search input will use this to match across columns.
   *
   * @example
   * globalFilterFn={(row, _columnId, filterValue) => {
   *   const search = filterValue.toLowerCase()
   *   return row.original.name.toLowerCase().includes(search)
   * }}
   */
  globalFilterFn?: TableOptions<TData>["globalFilterFn"];

  /** Number of rows per page. Default: 25 */
  pageSize?: number;

  /** Apply a className to individual rows based on data. */
  getRowClassName?: (row: TData) => string;

  /**
   * Render a toolbar above the table.
   * Receives the `table` instance so the toolbar can wire up search, filters, etc.
   */
  toolbar?: (table: TanStackTable<TData>) => React.ReactNode;

  /** Text to show when the table is empty. Default: "No results." */
  emptyMessage?: string;

  /** If true, show the "N of M row(s) selected" text. Default: false */
  showRowSelection?: boolean;

  /** Initial sorting state for the table */
  initialSorting?: SortingState;
  initialColumnFilters?: ColumnFiltersState;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DataTable<TData, TValue>({
  columns,
  data,
  globalFilterFn,
  pageSize = 25,
  getRowClassName,
  toolbar,
  emptyMessage = "No results.",
  showRowSelection = false,
  initialSorting = [],
  initialColumnFilters = [],
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>(initialSorting);
  const [columnFilters, setColumnFilters] =
    React.useState<ColumnFiltersState>(initialColumnFilters);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = React.useState("");

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    ...(globalFilterFn ? { globalFilterFn } : {}),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    initialState: {
      pagination: { pageSize },
    },
  });

  return (
    <Card className="flex-col space-y-4 border-none bg-transparent px-0 shadow-none">
      {/* Toolbar — composed by the consumer */}
      {toolbar?.(table)}

      {/* Table */}
      <CardContent className="overflow-hidden rounded-md border p-0">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={cn(getRowClassName?.(row.original) || "")}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>

      {/* Footer: selection count + pagination */}

      <DataTableFooter table={table} showRowSelection={showRowSelection} />
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Footer (pagination + selection count)
// ---------------------------------------------------------------------------

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Card, CardContent, CardFooter } from "../ui/card";

interface DataTableFooterProps<TData> {
  table: TanStackTable<TData>;
  showRowSelection: boolean;
}

function DataTableFooter<TData>({
  table,
  showRowSelection,
}: DataTableFooterProps<TData>) {
  return (
    <CardFooter className="flex-wrap items-center justify-between gap-4 p-0">
      {/* Selection count */}
      <div className="text-sm text-muted-foreground sm:text-sm">
        {showRowSelection ? (
          <>
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </>
        ) : (
          <>{table.getFilteredRowModel().rows.length} row(s) total.</>
        )}
      </div>

      {/* Pagination controls */}
      <div className="flex items-center space-x-6 lg:space-x-8">
        {/* Rows per page */}
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger className="h-8 w-17.5">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 25, 50, 100].map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Page indicator */}
        <div className="flex w-25 items-center justify-center text-sm font-medium">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>

        {/* Page navigation */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </CardFooter>
  );
}
