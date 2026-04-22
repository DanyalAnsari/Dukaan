import { redirect } from "next/navigation";
import type { Metadata } from "next";
import {
  TrendingUp,
  Package,
  Percent,
  IndianRupee,
  Receipt,
  BadgePercent,
} from "lucide-react";

import { getSession } from "@/lib/get-session";
import { getShopByUserId } from "@/database/data/shop";
import {
  getMonthlySalesReport,
  getTopSellingProducts,
  getGSTReport,
} from "@/database/data/reports";
import { formatCurrency } from "@/lib/utils";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import StatsCard from "@/components/shared/stats-card";
import { FadeIn, FadeInStagger } from "@/components/shared/motion-wrapper";

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Business Reports",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function EmptyTableRow({ cols, message }: { cols: number; message: string }) {
  return (
    <TableRow>
      <TableCell
        colSpan={cols}
        className="py-10 text-center text-muted-foreground"
      >
        {message}
      </TableCell>
    </TableRow>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ReportsPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const shop = await getShopByUserId(session.user.id);
  if (!shop) redirect("/setup");

  const [monthlySales, topProducts, gstReport] = await Promise.all([
    getMonthlySalesReport(shop.id),
    getTopSellingProducts(shop.id, 10),
    getGSTReport(shop.id),
  ]);

  // ── Summary stats computed from already-fetched data — no extra DB round-trip

  const totalRevenuePaise = monthlySales.reduce((s, r) => s + r.total, 0);
  const totalBillsCount = monthlySales.reduce((s, r) => s + r.count, 0);
  const totalGSTCollected = gstReport.reduce((s, r) => s + r.gstAmount, 0);

  // Totals for GST table footer
  const gstTotalTaxable = gstReport.reduce((s, r) => s + r.taxableAmount, 0);
  const gstTotalAmount = gstReport.reduce((s, r) => s + r.gstAmount, 0);

  // Totals for monthly sales footer
  const salesTotalRevenue = totalRevenuePaise;
  const salesTotalCount = totalBillsCount;

  const summaryStats = [
    {
      title: "Total Revenue",
      stat: formatCurrency(totalRevenuePaise),
      icon: IndianRupee,
      description: "Last 12 months",
      className: "font-mono",
    },
    {
      title: "Total Bills",
      stat: totalBillsCount,
      icon: Receipt,
      description: "Last 12 months",
      className: "font-mono",
    },
    {
      title: "GST Collected",
      stat: formatCurrency(totalGSTCollected),
      icon: BadgePercent,
      description: "Total tax liability",
      className: "font-mono",
    },
  ];

  return (
    <FadeInStagger className="space-y-6">
      {/* Header */}
      <FadeIn>
        <div>
          <h1 className="font-heading text-2xl font-semibold">
            Business Reports
          </h1>
          <p className="text-sm text-muted-foreground">
            Sales performance, top products, and GST compliance — last 12
            months.
          </p>
        </div>
      </FadeIn>

      {/* Summary stats */}
      <FadeIn>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {summaryStats.map((s) => (
            <StatsCard
              key={s.title}
              icon={s.icon}
              title={s.title}
              stat={s.stat}
              description={s.description}
              contentClassName={s.className}
            />
          ))}
        </div>
      </FadeIn>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Monthly Sales */}
        <FadeIn>
          <Card className="flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="text-base font-semibold">
                  Monthly Sales Performance
                </CardTitle>
                <CardDescription>
                  Revenue trend — last 12 months
                </CardDescription>
              </div>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead className="text-right">Bills</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthlySales.length === 0 ? (
                    <EmptyTableRow cols={3} message="No sales data yet." />
                  ) : (
                    monthlySales.map((item) => (
                      // monthKey is YYYY-MM — stable unique key even if month label repeats across years
                      <TableRow key={item.monthKey}>
                        <TableCell className="font-medium">
                          {item.month}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.count}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(item.total)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
                {monthlySales.length > 0 && (
                  <TableFooter>
                    <TableRow className="border-t-2 font-semibold">
                      <TableCell>Total</TableCell>
                      <TableCell className="text-right">
                        {salesTotalCount}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(salesTotalRevenue)}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                )}
              </Table>
            </CardContent>
          </Card>
        </FadeIn>

        {/* GST Summary */}
        <FadeIn>
          <Card className="flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="text-base font-semibold">
                  GST Tax Summary
                </CardTitle>
                <CardDescription>
                  Tax liability by slab — all time
                </CardDescription>
              </div>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rate</TableHead>
                    <TableHead className="text-right">Taxable</TableHead>
                    <TableHead className="text-right">Tax Collected</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gstReport.length === 0 ? (
                    <EmptyTableRow cols={3} message="No GST data yet." />
                  ) : (
                    gstReport.map((item) => (
                      <TableRow key={item.gstRate}>
                        <TableCell className="font-medium">
                          {item.gstRate}%
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(item.taxableAmount)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(item.gstAmount)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
                {gstReport.length > 0 && (
                  <TableFooter>
                    <TableRow className="border-t-2 font-semibold">
                      <TableCell>Total</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(gstTotalTaxable)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-primary">
                        {formatCurrency(gstTotalAmount)}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                )}
              </Table>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Top Products */}
        <FadeIn className="md:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="text-base font-semibold">
                  Top Selling Products
                </CardTitle>
                <CardDescription>
                  Most popular items by volume and revenue — all time
                </CardDescription>
              </div>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">#</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Units Sold</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProducts.length === 0 ? (
                    <EmptyTableRow cols={4} message="No sales data yet." />
                  ) : (
                    topProducts.map((item, index) => (
                      // productId is the stable key; fall back to name if null (deleted products)
                      <TableRow key={item.productId ?? item.name}>
                        <TableCell className="text-muted-foreground tabular-nums">
                          {index + 1}
                        </TableCell>
                        <TableCell className="font-medium">
                          {item.name}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {item.quantity.toLocaleString("en-IN")}
                        </TableCell>
                        <TableCell className="text-right font-mono text-primary">
                          {formatCurrency(item.revenue)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </FadeInStagger>
  );
}
