import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { eq, desc, and } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { db } from "@/database";
import { customers, bills, payments } from "@/database/schemas";
import { getSession } from "@/lib/get-session";
import { getShopByUserId } from "@/database/data/shop";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import CustomerActions from "./_components/customer-actions";

// ─── Metadata ────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const session = await getSession();
  if (!session?.user) return {};

  const shop = await getShopByUserId(session.user.id);
  if (!shop) return {};

  const customer = await db.query.customers.findFirst({
    where: and(eq(customers.id, id), eq(customers.shopId, shop.id)),
    columns: { name: true },
  });

  return {
    title: customer ? `${customer.name} — Ledger` : "Customer Ledger",
  };
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ id: string }>;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

type BillStatus = "paid" | "partial" | "credit";

const BILL_STATUS_STYLES: Record<
  BillStatus,
  { variant: "default" | "secondary" | "destructive"; className: string }
> = {
  paid: {
    variant: "default",
    className: "bg-green-50 text-green-700 border-green-200",
  },
  partial: {
    variant: "secondary",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  credit: {
    variant: "destructive",
    className: "bg-red-50 text-red-700 border-red-200",
  },
};

function BillStatusBadge({ status }: { status: string }) {
  const style =
    BILL_STATUS_STYLES[status as BillStatus] ?? BILL_STATUS_STYLES.credit;
  return (
    <Badge variant={style.variant} className={style.className}>
      {status}
    </Badge>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CustomerLedgerPage({ params }: PageProps) {
  const { id: customerId } = await params;

  // Explicit guards — no ! assertions
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const shop = await getShopByUserId(session.user.id);
  if (!shop) redirect("/setup");

  // All three queries scoped to this shop — prevents cross-shop data leaks
  const [customerResult, customerBills, customerPayments] = await Promise.all([
    db.query.customers.findFirst({
      where: and(eq(customers.id, customerId), eq(customers.shopId, shop.id)),
    }),
    db.query.bills.findMany({
      where: and(eq(bills.customerId, customerId), eq(bills.shopId, shop.id)),
      orderBy: [desc(bills.billDate)],
    }),
    db.query.payments.findMany({
      where: and(
        eq(payments.customerId, customerId),
        eq(payments.shopId, shop.id)
      ),
      orderBy: [desc(payments.createdAt)],
    }),
  ]);

  if (!customerResult) notFound();

  // Pre-compute summary totals once on the server
  const totalBilledPaise = customerBills.reduce((s, b) => s + b.totalPaise, 0);
  const totalPaidPaise = customerPayments.reduce(
    (s, p) => s + p.amountPaise,
    0
  );
  const outstandingBalance = customerResult.outstandingBalancePaise ?? 0;

  return (
    <div className="space-y-6">
      {/* Back link */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/customers">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Customers
          </Link>
        </Button>
      </div>

      {/* Customer header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{customerResult.name}</h1>
          <p className="font-mono text-muted-foreground">
            {customerResult.phone ?? "No phone"}
          </p>
          <p className="text-sm text-muted-foreground">
            Customer since{" "}
            {customerResult.createdAt.toLocaleDateString("en-IN", {
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <CustomerActions
          customer={{
            id: customerResult.id,
            name: customerResult.name,
            phone: customerResult.phone,
            email: customerResult.email,
            address: customerResult.address,
            creditLimitPaise: customerResult.creditLimitPaise ?? 0,
          }}
          outstandingBalance={outstandingBalance}
        />
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Bill history */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Bill History</CardTitle>
            </CardHeader>
            <CardContent>
              {customerBills.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">
                  No bills yet
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Paid</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customerBills.map((bill) => {
                      const paid = bill.amountPaidPaise ?? 0;
                      const balance = bill.totalPaise - paid;
                      return (
                        <TableRow
                          key={bill.id}
                          className={balance > 0 ? "bg-red-50/50" : ""}
                        >
                          <TableCell className="font-mono font-medium">
                            <Link
                              href={`/bills/${bill.id}`}
                              className="hover:underline"
                            >
                              {bill.invoiceNumber}
                            </Link>
                          </TableCell>
                          {/* billDate is already a JS Date from Drizzle — no new Date() needed */}
                          <TableCell className="text-muted-foreground">
                            {formatDate(bill.billDate)}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatCurrency(bill.totalPaise)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-muted-foreground">
                            {formatCurrency(paid)}
                          </TableCell>
                          <TableCell
                            className={`text-right font-mono ${
                              balance > 0 ? "font-medium text-red-600" : ""
                            }`}
                          >
                            {formatCurrency(balance)}
                          </TableCell>
                          <TableCell>
                            <BillStatusBadge status={bill.status} />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Payments received */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Payments Received</CardTitle>
            </CardHeader>
            <CardContent>
              {customerPayments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No payments yet</p>
              ) : (
                <div className="space-y-3">
                  {customerPayments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <div>
                        {/* createdAt is already a JS Date from Drizzle */}
                        <div className="text-muted-foreground">
                          {formatDate(payment.createdAt)}
                        </div>
                        <Badge variant="outline" className="text-xs capitalize">
                          {payment.paymentMethod}
                        </Badge>
                      </div>
                      <span className="font-mono text-green-600">
                        +{formatCurrency(payment.amountPaise)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Billed</span>
                <span className="font-mono">
                  {formatCurrency(totalBilledPaise)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Paid</span>
                <span className="font-mono text-green-600">
                  {formatCurrency(totalPaidPaise)}
                </span>
              </div>
              <div className="flex justify-between border-t pt-3">
                <span className="font-medium">Outstanding</span>
                <span
                  className={`font-mono font-bold ${
                    outstandingBalance > 0 ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {formatCurrency(outstandingBalance)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
