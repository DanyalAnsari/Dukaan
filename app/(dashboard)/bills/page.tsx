import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { BillsDataTable } from "./_components/data-table";
import StatsCard from "@/components/shared/stats-card";
import { getSession } from "@/lib/get-session";
import { getShopByUserId } from "@/database/data/shop";
import { getAllBills } from "@/database/data/bills";

import { startOfDay, endOfDay, parseISO } from "date-fns";
import { BillFilters } from "./_components/bill-filters";

export default async function BillsPage(props: {
  searchParams: Promise<{
    status?: string;
    from?: string;
    to?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const session = await getSession();
  const shop = (await getShopByUserId(session!.user.id))!;

  const filters = {
    status: searchParams.status,
    startDate: searchParams.from
      ? startOfDay(parseISO(searchParams.from))
      : undefined,
    endDate: searchParams.to ? endOfDay(parseISO(searchParams.to)) : undefined,
  };

  // Fetch filtered bills from data layer
  const allBills = await getAllBills(shop.id, filters);

  // Stats (should probably be based on ALL bills or filtered? Let's use filtered for now but total revenue might need all)
  const totalBills = allBills.length;
  const todayBillsCount = allBills.filter((b) => {
    const billDate = new Date(b.billDate).toDateString();
    const today = new Date().toDateString();
    return billDate === today;
  }).length;

  const totalAmount = allBills.reduce((sum, b) => sum + b.totalPaise, 0);
  const paidAmount = allBills
    .filter((b) => b.status === "paid")
    .reduce((sum, b) => sum + b.totalPaise, 0);
  const pendingAmount = allBills.reduce(
    (sum, b) => sum + (b.amountDuePaise || 0),
    0
  );

  const stats = [
    {
      title: "Total Bills",
      stat: totalBills,
    },
    {
      title: "Total Revenue",
      stat: formatCurrency(totalAmount),
    },
    {
      title: "Paid Amount",
      stat: formatCurrency(paidAmount),
    },
    {
      title: "Pending Amount",
      stat: formatCurrency(pendingAmount),
      className: "text-unpaid",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold">
            Invoice History
          </h1>
          <p className="font-heading text-sm text-muted-foreground">
            View all your invoices and track payments.
          </p>
        </div>
        <Button asChild>
          <Link href="/bills/new">
            <Plus className="mr-2 h-4 w-4" />
            New Bill
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((item) => (
          <StatsCard
            key={item.title}
            title={item.title}
            stat={item.stat}
            contentClassName={item.className}
          />
        ))}
      </div>

      {/* Filters */}
      <BillFilters />

      {/* Table */}
      <Card className="border-none bg-transparent p-0">
        <CardContent className="p-0">
          {allBills.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="mb-4 text-muted-foreground">No Bills found</p>
              <Button asChild>
                <Link href="/bills/new">Create new bill</Link>
              </Button>
            </div>
          ) : (
            <BillsDataTable data={allBills} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
