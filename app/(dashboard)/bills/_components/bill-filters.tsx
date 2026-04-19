"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export function BillFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (params: Record<string, string | null>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(params)) {
        if (value === null) {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, value);
        }
      }

      return newSearchParams.toString();
    },
    [searchParams]
  );

  const status = searchParams.get("status") || "all";
  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";

  const handleStatusChange = (value: string) => {
    router.push(pathname + "?" + createQueryString({ status: value === "all" ? null : value }));
  };

  const handleDateChange = (key: "from" | "to", value: string) => {
    router.push(pathname + "?" + createQueryString({ [key]: value || null }));
  };

  const clearFilters = () => {
    router.push(pathname);
  };

  const hasFilters = searchParams.get("status") || searchParams.get("from") || searchParams.get("to");

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="w-full max-w-[200px]">
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="partial">Partial</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Input
          type="date"
          value={from}
          onChange={(e) => handleDateChange("from", e.target.value)}
          className="w-[160px]"
        />
        <span className="text-muted-foreground">to</span>
        <Input
          type="date"
          value={to}
          onChange={(e) => handleDateChange("to", e.target.value)}
          className="w-[160px]"
        />
      </div>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="h-10">
          <X className="mr-2 h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  );
}
