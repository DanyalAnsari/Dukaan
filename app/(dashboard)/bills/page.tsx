import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { IndianRupee, Plus, Receipt } from "lucide-react";
import { BillsDataTable } from "./_components/data-table";
import StatsCard from "@/components/shared/stats-card";
import { getSession } from "@/lib/get-session";
import { getShopByUserId } from "@/database/data/shop";
import { getAllBills, getBillsStat } from "@/database/data/bills";

export const metadata = {
  title: "Invoice",
  description: "View all your invoices and track payments.",
};

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

  // Fetch filtered bills from data layer
  const [filteredBills, billStats] = await Promise.all([
    getAllBills(shop.id),
    getBillsStat(shop.id),
  ]);

  const { totalBills, totalAmount, paidAmount, pendingAmount } =
    billStats[0] || {};

  const stats = [
    {
      title: "Total Bills",
      stat: totalBills,
      icon: Receipt,
      description: "Invoices generated",
    },
    {
      title: "Total Revenue",
      stat: formatCurrency(totalAmount),
      icon: IndianRupee,
      description: "Toatal revenue",
      className: "font-mono text-emerald-600",
    },
    {
      title: "Paid Amount",
      stat: formatCurrency(paidAmount),
      icon: IndianRupee,
      description: "Total paid amount",
      className: "font-mono text-paid",
    },
    {
      title: "Pending Amount",
      stat: formatCurrency(pendingAmount),
      icon: IndianRupee,
      description: "Total pending amount",
      className: `font-mono ${pendingAmount > 0 ? "text-unpaid" : ""}`,
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
        <Button asChild className="hidden md:inline-flex">
          <Link href="/bills/new">
            <Plus className="mr-2 h-4 w-4" />
            New Bill
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((item) => (
          <StatsCard
            key={item.title}
            icon={item.icon}
            title={item.title}
            stat={item.stat}
            contentClassName={item.className}
            description={item.description}
          />
        ))}
      </div>

      {/* Table */}

      <BillsDataTable
        data={filteredBills}
        initialFrom={searchParams.from}
        initialTo={searchParams.to}
        initialStatus={searchParams.status}
      />
    </div>
  );
}
