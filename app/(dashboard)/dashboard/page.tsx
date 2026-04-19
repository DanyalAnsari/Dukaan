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
import { getTodaysBills, getSalesPerformance } from "@/database/data/bills";
import { getLowStockProducts } from "@/database/data/products";
import { getOutstandingCustomers } from "@/database/data/customers";

import { SalesChart } from "./_components/sales-chart";
import { PaymentBreakdown } from "./_components/payment-breakdown";
import { CardWrapper } from "./_components/card-wrapper";

export default async function DashboardPage() {
  const session = await getSession();
  const shop = (await getShopByUserId(session!.user.id))!;

  const [todayBills, lowStockProducts, pendingCustomers, performanceData] =
    await Promise.all([
      getTodaysBills(shop.id),
      getLowStockProducts(shop.id),
      getOutstandingCustomers(shop.id),
      getSalesPerformance(shop.id, 7),
    ]);

  // Chart data: Sales by day
  const salesByDay = performanceData.reduce(
    (acc, bill) => {
      const day = format(bill.billDate, "MMM dd");
      if (!acc[day]) acc[day] = 0;
      acc[day] += bill.totalPaise;
      return acc;
    },
    {} as Record<string, number>
  );

  const chartData = Object.entries(salesByDay).map(([date, total]) => ({
    date,
    total,
  }));

  // Chart data: Payment breakdown
  const paymentMethods = performanceData.reduce(
    (acc, bill) => {
      const method = bill.paymentMethod || "cash";
      if (!acc[method]) acc[method] = 0;
      acc[method] += bill.totalPaise;
      return acc;
    },
    {} as Record<string, number>
  );

  const paymentData = Object.entries(paymentMethods).map(([name, value]) => ({
    name,
    value,
  }));

  // Calculate stats
  const todayCollection = todayBills
    .filter((b) => b.status === "paid")
    .reduce((sum, b) => sum + b.totalPaise, 0);

  const billsTodayCount = todayBills.length;

  const totalPendingUdhar = pendingCustomers.reduce(
    (sum, c) =>
      c.outstandingBalancePaise ? sum + c.outstandingBalancePaise : sum,
    0
  );

  const lowStockCount = lowStockProducts.length;

  // Greeting based on time of day
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  // Day name in Indian format
  const dayName = new Date().toLocaleDateString("en-IN", { weekday: "long" });
  const dateStr = new Date().toLocaleDateString("en-IN", {
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
      className: `font-mono ${totalPendingUdhar > 0 ? "text-rose-600" : ""}`,
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
        {stats.map((item, idx) => (
          <StatsCard
            key={idx}
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
        <PaymentBreakdown data={paymentData} />
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
