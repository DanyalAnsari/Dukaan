// components/data-table/data-table-date-filter.tsx
"use client";

import * as React from "react";
import { type Column } from "@tanstack/react-table";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subDays,
  subMonths,
  format,
} from "date-fns";
import { type DateRange } from "react-day-picker";
import { CalendarIcon, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Field } from "../ui/field";

// ---------------------------------------------------------------------------
// Presets
// ---------------------------------------------------------------------------

interface Preset {
  label: string;
  range: () => DateRange;
}

const PRESETS: Preset[] = [
  {
    label: "Today",
    range: () => ({
      from: startOfDay(new Date()),
      to: endOfDay(new Date()),
    }),
  },
  {
    label: "Yesterday",
    range: () => ({
      from: startOfDay(subDays(new Date(), 1)),
      to: endOfDay(subDays(new Date(), 1)),
    }),
  },
  {
    label: "Last 7 days",
    range: () => ({
      from: startOfDay(subDays(new Date(), 6)),
      to: endOfDay(new Date()),
    }),
  },
  {
    label: "Last 30 days",
    range: () => ({
      from: startOfDay(subDays(new Date(), 29)),
      to: endOfDay(new Date()),
    }),
  },
  {
    label: "This week",
    range: () => ({
      from: startOfWeek(new Date(), { weekStartsOn: 1 }),
      to: endOfWeek(new Date(), { weekStartsOn: 1 }),
    }),
  },
  {
    label: "This month",
    range: () => ({
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date()),
    }),
  },
  {
    label: "Last month",
    range: () => ({
      from: startOfMonth(subMonths(new Date(), 1)),
      to: endOfMonth(subMonths(new Date(), 1)),
    }),
  },
  {
    label: "This year",
    range: () => ({
      from: startOfYear(new Date()),
      to: endOfYear(new Date()),
    }),
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface DataTableDateFilterProps<TData> {
  column: Column<TData, unknown>;
}

export function DataTableDateFilter<TData>({
  column,
}: DataTableDateFilterProps<TData>) {
  const [open, setOpen] = React.useState(false);

  // Applied filter value (what TanStack actually uses for filtering)
  const appliedFilter = column.getFilterValue() as
    | { from?: Date; to?: Date }
    | undefined;

  // Draft state — what the user is currently selecting inside the popover
  // Only committed to TanStack on "Apply"
  const [draft, setDraft] = React.useState<DateRange | undefined>(
    appliedFilter
      ? { from: appliedFilter.from, to: appliedFilter.to }
      : undefined
  );

  // Active preset label — for visual highlight in sidebar
  const [activePreset, setActivePreset] = React.useState<string | null>(null);

  // Sync draft when popover opens — so re-opening shows current filter state
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setDraft(
        appliedFilter
          ? { from: appliedFilter.from, to: appliedFilter.to }
          : undefined
      );
    }
    setOpen(isOpen);
  };

  // Apply draft → commit to TanStack column filter
  const handleApply = () => {
    if (!draft?.from && !draft?.to) {
      column.setFilterValue(undefined);
    } else {
      column.setFilterValue({
        from: draft?.from ? startOfDay(draft.from) : undefined,
        to: draft?.to ? endOfDay(draft.to) : undefined,
      });
    }
    setOpen(false);
  };

  // Clear everything
  const handleClear = () => {
    setDraft(undefined);
    setActivePreset(null);
    column.setFilterValue(undefined);
    setOpen(false);
  };

  // Preset click — sets draft immediately + highlights preset
  const handlePreset = (preset: Preset) => {
    const range = preset.range();
    setDraft(range);
    setActivePreset(preset.label);
  };

  // Manual calendar selection clears active preset label
  const handleCalendarSelect = (range: DateRange | undefined) => {
    setDraft(range);
    setActivePreset(null);
  };

  // Trigger button label
  const triggerLabel = () => {
    if (!appliedFilter?.from && !appliedFilter?.to) return "Date range";
    if (appliedFilter.from && appliedFilter.to) {
      // Same day
      if (
        format(appliedFilter.from, "yyyy-MM-dd") ===
        format(appliedFilter.to, "yyyy-MM-dd")
      ) {
        return format(appliedFilter.from, "dd MMM yyyy");
      }
      return `${format(appliedFilter.from, "dd MMM")} – ${format(appliedFilter.to, "dd MMM yyyy")}`;
    }
    if (appliedFilter.from)
      return `From ${format(appliedFilter.from, "dd MMM yyyy")}`;
    if (appliedFilter.to)
      return `Until ${format(appliedFilter.to, "dd MMM yyyy")}`;
    return "Date range";
  };

  const hasAppliedFilter = appliedFilter?.from || appliedFilter?.to;
  const hasDraft = draft?.from || draft?.to;

  return (
    <Field className="w-auto items-center gap-1">
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-8 gap-2 font-normal",
              hasAppliedFilter
                ? "border-primary/50 bg-primary/5 text-primary" // ✅ active state
                : "text-muted-foreground"
            )}
          >
            <CalendarIcon className="h-4 w-4" />
            {triggerLabel()}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-0" align="start" sideOffset={8}>
          <div className="flex">
            {/* ✅ Presets Sidebar */}
            <div className="flex w-36 flex-col gap-1 border-r p-3">
              <p className="mb-1 px-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Presets
              </p>
              {PRESETS.map((preset) => (
                <Button
                  key={preset.label}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 justify-start px-2 text-sm font-normal",
                    activePreset === preset.label &&
                      "bg-accent font-medium text-accent-foreground"
                  )}
                  onClick={() => handlePreset(preset)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>

            {/* ✅ Calendar + Footer */}
            <div className="flex flex-col">
              <Calendar
                mode="range"
                defaultMonth={draft?.from}
                selected={draft}
                onSelect={handleCalendarSelect}
                numberOfMonths={2}
                disabled={{ after: new Date() }}
              />

              {/* Footer */}
              <div className="flex items-center justify-between border-t px-4 py-3">
                {/* Draft range label */}
                <span className="text-xs text-muted-foreground">
                  {draft?.from && draft?.to
                    ? `${format(draft.from, "dd MMM")} – ${format(draft.to, "dd MMM yyyy")}`
                    : draft?.from
                      ? `From ${format(draft.from, "dd MMM yyyy")}`
                      : "Select a range"}
                </span>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8"
                    onClick={handleClear}
                  >
                    Clear
                  </Button>
                  <Button
                    size="sm"
                    className="h-8"
                    onClick={handleApply}
                    disabled={!hasDraft} // ✅ disabled until user picks something
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* ✅ Inline clear pill — clears without opening popover */}
      {hasAppliedFilter && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-muted-foreground"
          onClick={handleClear}
          aria-label="Clear date filter"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </Field>
  );
}
