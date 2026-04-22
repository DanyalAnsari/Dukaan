import Link from "next/link";
import { BillStatus } from "@/types";
import { format } from "date-fns";
import { getSession } from "@/lib/get-session";
import { formatCurrency } from "@/lib/utils";

import { IndianRupee, Package, Plus, Receipt, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import StatsCard from "@/components/shared/stats-card";
import StatusBadge from "@/components/shared/status-badge";

import { getShopByUserId } from "@/database/data/shop";
import {
  getTodaysBills,
  getPaymentBreakdown,
  getSalesByDay,
} from "@/database/data/bills";
import { getLowStockProducts } from "@/database/data/products";
import { getOutstandingCustomers } from "@/database/data/customers";

import { SalesChart } from "./_components/sales-chart";
import { PaymentBreakdown } from "./_components/payment-breakdown";
import { CardWrapper } from "./_components/card-wrapper";

export const metadata = {
  title: "Dashboard",
  description: "Your shop overview",
};

export default async function DashboardPage() {
  const session = await getSession();
  const shop = (await getShopByUserId(session!.user.id))!;

  const [
    todayBills,
    lowStockProducts,
    pendingCustomers,
    salesByDay,
    paymentBreakdown,
  ] = await Promise.all([
    getTodaysBills(shop.id),
    getLowStockProducts(shop.id),
    getOutstandingCustomers(shop.id),
    getSalesByDay(shop.id, 7),
    getPaymentBreakdown(shop.id, 7),
  ]);

  // Calculate stats
  const todayCollection = todayBills.reduce(
    (sum, b) => (b.status === "paid" ? sum + b.totalPaise : 0),
    0
  );

  const billsTodayCount = todayBills.length;

  const totalPendingUdhar = pendingCustomers.reduce(
    (sum, c) => sum + (c.outstandingBalancePaise ?? 0),
    0
  );

  const chartData = salesByDay.map(({ day, totalPaise }) => ({
    date: format(new Date(day), "MMM dd"),
    total: totalPaise,
  }));

  const lowStockCount = lowStockProducts.length;

  // Greeting based on time of day
  const date = new Date();
  const hour = date.getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  // Day name in Indian format
  const dayName = date.toLocaleDateString("en-IN", { weekday: "long" });
  const dateStr = date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const stats = [
    {
      title: "Today's Collection",
      className: "font-mono text-emerald-600",
      stat: formatCurrency(todayCollection),
      icon: IndianRupee,
      description: "Paid bills today",
    },
    {
      title: "Bills Today",
      stat: billsTodayCount,
      icon: Receipt,
      description: "Invoices generated",
    },
    {
      title: "Pending Udhar",
      className: `font-mono ${totalPendingUdhar > 0 ? "text-unpaid" : ""}`,
      stat: formatCurrency(totalPendingUdhar),
      icon: Users,
      description: "Total outstanding",
    },
    {
      title: "Low Stock",
      className: lowStockCount > 0 ? "text-amber-600" : "",
      stat: lowStockCount,
      icon: Package,
      description: "Items to reorder",
    },
  ];

  const columns = ["Time", "Invoice", "Total", "Status"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-baseline gap-2 text-2xl font-medium lg:text-4xl">
            {greeting} !{" "}
            <span className="font-normal text-muted-foreground">
              {shop?.name || "Shop"}
            </span>
          </h1>
          <p className="text-sm text-muted-foreground">
            {dayName}, {dateStr}
          </p>
        </div>
        <Button asChild className="hidden md:inline-flex">
          <Link href="/bills/new">
            <Plus className="mr-2 h-4 w-4" />
            New Bill
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((item) => (
          <StatsCard
            key={item.title}
            title={item.title}
            stat={item.stat}
            icon={item.icon}
            description={item.description}
            contentClassName={item.className}
          />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <SalesChart data={chartData} />
        <PaymentBreakdown data={paymentBreakdown} />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Left: Today's Bills */}
        <div className="lg:col-span-3">
          <CardWrapper title="Today's Bills" href="/bills" hoverEffect={false}>
            {todayBills.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">
                No bills today
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    {columns.map((col) => (
                      <TableHead key={col} className="text-muted-foreground">
                        {col}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {todayBills.map((bill) => (
                    <TableRow
                      key={bill.id}
                      className="cursor-pointer transition-colors hover:bg-muted/50"
                    >
                      <TableCell className="text-muted-foreground">
                        {new Date(bill.billDate).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                      <TableCell className="font-mono font-medium">
                        <Link
                          href={`/bills/${bill.id}`}
                          className="underline transition-colors hover:text-primary"
                        >
                          {bill.invoiceNumber}
                        </Link>
                      </TableCell>
                      <TableCell className="font-mono">
                        {formatCurrency(bill.totalPaise)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge variant={bill.status as BillStatus}>
                          {bill.status}
                        </StatusBadge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardWrapper>
        </div>

        {/* Right: Sidebar Cards */}
        <div className="space-y-6 lg:col-span-2">
          {/* Unpaid Customers */}
          <CardWrapper title="Unpaid Bills" href="/customers">
            {pendingCustomers.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No pending payments
              </p>
            ) : (
              <div className="space-y-3">
                {pendingCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <div className="text-sm font-medium">{customer.name}</div>
                      <div className="font-mono text-xs text-muted-foreground">
                        {customer.phone || "-"}
                      </div>
                    </div>
                    <div className="font-mono text-sm text-red-600">
                      {formatCurrency(customer.outstandingBalancePaise!)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardWrapper>

          {/* Low Stock */}
          <CardWrapper title="Low Stock" href="/products">
            {lowStockProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                All items in stock
              </p>
            ) : (
              <div className="space-y-3">
                {lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between"
                  >
                    <div className="text-sm font-medium">{product.name}</div>
                    <div className="font-mono text-sm text-amber-600">
                      {product.stockQty} {product.unit}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardWrapper>
        </div>
      </div>
    </div>
  );
}
