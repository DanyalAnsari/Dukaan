import {  notFound } from "next/navigation";
import Link from "next/link";
import { eq, desc, and } from "drizzle-orm";
import { db } from "@/database";
import { customers, bills, payments } from "@/database/schemas";
import { getSession } from "@/lib/get-session";
import { getShopByUserId } from "@/database/data/shop";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import CustomerActions from "./_components/customer-actions";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerLedgerPage({ params }: PageProps) {
  const { id: customerId } = await params;
  const session = await getSession();
  const shop = (await getShopByUserId(session!.user.id))!;

  // Fetch customer details
  const customerResult = await db.query.customers.findFirst({
    where: and(eq(customers.id, customerId), eq(customers.shopId, shop.id)),
  });

  if (!customerResult) notFound();

  // Fetch bills and payments
  const [customerBills, customerPayments] = await Promise.all([
    db.query.bills.findMany({
      where: eq(bills.customerId, customerId),
      orderBy: [desc(bills.billDate)],
    }),
    db.query.payments.findMany({
      where: eq(payments.customerId, customerId),
      orderBy: [desc(payments.createdAt)],
    }),
  ]);

  const outstandingBalance = customerResult.outstandingBalancePaise ?? 0;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/customers">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Customers
          </Link>
        </Button>
      </div>

      {/* Customer Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{customerResult.name}</h1>
          <p className="text-muted-foreground font-mono">
            {customerResult.phone || "No phone"}
          </p>
          <p className="text-sm text-muted-foreground">
            Customer since{" "}
            {new Date(customerResult.createdAt).toLocaleDateString("en-IN", {
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
            creditLimitPaise: customerResult.creditLimitPaise || 0,
          }}
          outstandingBalance={outstandingBalance}
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Bill History */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Bill History</CardTitle>
            </CardHeader>
            <CardContent>
              {customerBills.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
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
                      const paidAmount = bill.amountPaidPaise ?? 0;
                      const balance = bill.totalPaise - paidAmount;
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
                          <TableCell className="text-muted-foreground">
                            {formatDate(new Date(bill.billDate))}
                          </TableCell>
                          <TableCell className="font-mono text-right">
                            {formatCurrency(bill.totalPaise)}
                          </TableCell>
                          <TableCell className="font-mono text-right text-muted-foreground">
                            {formatCurrency(paidAmount)}
                          </TableCell>
                          <TableCell
                            className={`font-mono text-right ${
                              balance > 0 ? "text-red-600 font-medium" : ""
                            }`}
                          >
                            {formatCurrency(balance)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                bill.status === "paid"
                                  ? "default"
                                  : bill.status === "partial"
                                  ? "secondary"
                                  : "destructive"
                              }
                              className={
                                bill.status === "paid"
                                  ? "bg-green-50 text-green-700 border-green-200"
                                  : bill.status === "partial"
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : "bg-red-50 text-red-700 border-red-200"
                              }
                            >
                              {bill.status}
                            </Badge>
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

        {/* Right: Sidebar */}
        <div className="space-y-6">
          {/* Payments Received */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Payments Received</CardTitle>
            </CardHeader>
            <CardContent>
              {customerPayments.length === 0 ? (
                <p className="text-muted-foreground text-sm">No payments yet</p>
              ) : (
                <div className="space-y-3">
                  {customerPayments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <div>
                        <div className="text-muted-foreground">
                          {formatDate(new Date(payment.createdAt))}
                        </div>
                        <Badge variant="outline" className="text-xs capitalize">
                          {payment.paymentMethod}
                        </Badge>
                      </div>
                      <div className="font-mono text-green-600">
                        +{formatCurrency(payment.amountPaise)}
                      </div>
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
                  {formatCurrency(
                    customerBills.reduce((sum, b) => sum + b.totalPaise, 0)
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Paid</span>
                <span className="font-mono text-green-600">
                  {formatCurrency(
                    customerPayments.reduce((sum, p) => sum + p.amountPaise, 0)
                  )}
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