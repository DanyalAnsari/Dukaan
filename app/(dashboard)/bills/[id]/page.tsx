import { formatCurrency, formatDate, amountInWords } from "@/lib/utils";
import { db } from "@/database";
import { bills } from "@/database/schemas";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import CTAbuttons from "./_components/CTA-buttons";
import { getShopById, getShopByUserId } from "@/database/data/shop";
import { getSession } from "@/lib/get-session";
import { and } from "drizzle-orm";
import { Separator } from "@/components/ui/separator";
import { redirect } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BillViewPage({ params }: PageProps) {
  const { id } = await params;

  const session = await getSession();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userShop = await getShopByUserId(session.user.id);
  if (!userShop) {
    notFound();
  }

  const bill = await db.query.bills.findFirst({
    where: and(eq(bills.id, id), eq(bills.shopId, userShop.id)),
    with: {
      items: true,
      customer: true,
    },
  });

  if (!bill) notFound();

  const shop = await getShopById(bill.shopId);

  if (!shop) notFound();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <div>
          <Link href="/bills">
            <Button variant="link" size="sm">
              ← Back to Bills
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Invoice {bill.invoiceNumber}</h1>
          <p className="text-muted-foreground">
            {formatDate(new Date(bill.billDate))}
          </p>
        </div>
        <CTAbuttons bill={bill} shop={shop} id={id} />
      </div>

      {/* Invoice Document */}
      <Card className="space-y-4 p-6 print:border-0 print:p-0">
        {/* Shop Header */}
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-wide">
            {shop?.name || "Shop"}
          </CardTitle>
          <CardDescription className="space-y-1/2 text-sm font-medium tracking-wide text-muted-foreground">
            {shop?.address && <h5>{shop.address}</h5>}
            <h5>
              {shop?.phone && <span>{shop.phone}</span>}
              {shop?.gstin && (
                <>
                  {shop?.phone && " | "}
                  <span>GSTIN: {shop.gstin}</span>
                </>
              )}
            </h5>
          </CardDescription>
        </CardHeader>
        <Separator />

        <CardContent className="space-y-6 px-0">
          {/* Invoice Details */}
          <div className="flex justify-between">
            <div>
              <div className="text-sm text-muted-foreground">
                Invoice Number
              </div>
              <div className="font-mono font-medium">{bill.invoiceNumber}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Date</div>
              <div className="font-medium">
                {formatDate(new Date(bill.billDate))}
              </div>
            </div>
          </div>

          {/* Customer Info */}
          {bill.customer ? (
            <div className="rounded-lg bg-muted p-4">
              <div className="text-sm text-muted-foreground">Bill To</div>
              <div className="font-medium">{bill.customer.name}</div>
              {bill.customer.phone && (
                <div className="font-mono text-sm text-muted-foreground">
                  {bill.customer.phone}
                </div>
              )}
            </div>
          ) : (
            <div className="mb-6 rounded-lg bg-muted p-4">
              <div className="text-sm text-muted-foreground">Bill To</div>
              <div className="font-medium">Walk-in Customer</div>
            </div>
          )}

          {/* Items Table */}
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader className="bg-muted">
                <TableRow>
                  {["#", "Item", "HSN", "Qty", "Rate", "GST", "Amount"].map(
                    (h) => (
                      <TableHead key={h} className="p-3 text-center text-sm">
                        {h}
                      </TableHead>
                    )
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {bill.items.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell className="px-3 text-center text-muted-foreground">
                      {index + 1}
                    </TableCell>
                    <TableCell className="px-3 text-center">
                      <div className="font-medium">{item.productName}</div>
                      {item.productSku && (
                        <div className="font-mono text-xs text-muted-foreground">
                          SKU: {item.productSku}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="px-3 text-center font-mono text-xs">
                      {item.hsnCode || "—"}
                    </TableCell>
                    <TableCell className="px-3 text-center">
                      {item.quantity} {item.unit}
                    </TableCell>
                    <TableCell className="px-3 text-center font-mono">
                      {formatCurrency(item.unitPricePaise)}
                    </TableCell>
                    <TableCell className="px-3 text-center">
                      {item.gstRate}%
                    </TableCell>
                    <TableCell className="px-3 text-center font-mono">
                      {formatCurrency(item.lineTotalPaise)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Totals */}
          <Card className="flex justify-end border-none bg-transparent px-0 shadow-none">
            <CardContent className="w-72">
              <div className="space-y-1.5">
                <div className="flex justify-between py-1 text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-mono">
                    {formatCurrency(bill.subtotalPaise)}
                  </span>
                </div>
                <div className="flex justify-between py-1 text-sm">
                  <span className="text-muted-foreground">
                    GST (CGST + SGST)
                  </span>
                  <span className="font-mono">
                    {formatCurrency(bill.gstTotalPaise)}
                  </span>
                </div>
                {bill.discountPaise ? (
                  <div className="flex justify-between py-1 text-sm text-green-600">
                    <span>Discount</span>
                    <span className="font-mono">
                      -{formatCurrency(bill.discountPaise)}
                    </span>
                  </div>
                ) : null}

                <Separator className="my-2" />

                <div className="flex justify-between py-1 text-lg font-bold">
                  <span>Grand Total</span>
                  <span className="font-mono">
                    {formatCurrency(bill.totalPaise)}
                  </span>
                </div>

                {bill.status !== "paid" && (
                  <>
                    <Separator className="my-2" />
                    <div className="flex justify-between py-1 text-sm font-medium">
                      <span>Amount Paid</span>
                      <span className="font-mono text-green-600">
                        {formatCurrency(bill.amountPaidPaise || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 text-sm font-bold text-destructive">
                      <span>Balance Due</span>
                      <span className="font-mono">
                        {formatCurrency(bill.amountDuePaise || 0)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* GST Breakdown */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
              GST Tax Summary
            </h3>
            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="h-9 text-xs">GST Rate</TableHead>
                    <TableHead className="h-9 text-center text-xs">
                      Taxable Amt
                    </TableHead>
                    <TableHead className="h-9 text-center text-xs">
                      CGST
                    </TableHead>
                    <TableHead className="h-9 text-center text-xs">
                      SGST
                    </TableHead>
                    <TableHead className="h-9 text-center text-xs">
                      Total Tax
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(
                    bill.items.reduce(
                      (acc, item) => {
                        const rate = item.gstRate;
                        if (!acc[rate]) acc[rate] = { taxable: 0, tax: 0 };
                        acc[rate].taxable +=
                          item.lineTotalPaise - item.gstAmountPaise;
                        acc[rate].tax += item.gstAmountPaise;
                        return acc;
                      },
                      {} as Record<number, { taxable: number; tax: number }>
                    )
                  ).map(([rate, data]) => (
                    <TableRow key={rate} className="text-xs">
                      <TableCell>{rate}%</TableCell>
                      <TableCell className="text-center font-mono">
                        {formatCurrency(data.taxable)}
                      </TableCell>
                      <TableCell className="text-center font-mono">
                        {formatCurrency(data.tax / 2)}
                      </TableCell>
                      <TableCell className="text-center font-mono">
                        {formatCurrency(data.tax / 2)}
                      </TableCell>
                      <TableCell className="text-center font-mono font-medium">
                        {formatCurrency(data.tax)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-6">
            {/* Amount in Words */}
            <div className="flex-1 rounded-lg bg-muted p-4">
              <div className="text-sm text-muted-foreground">
                Amount in Words
              </div>
              <div className="font-medium capitalize">
                {amountInWords(bill.totalPaise)}
              </div>
            </div>

            {/* UPI QR Code */}
            {shop.upiId && bill.status !== "paid" && (
              <div className="flex flex-col items-center gap-2 rounded-lg border p-3">
                <div className="text-[10px] font-bold text-muted-foreground uppercase">
                  Scan to Pay (UPI)
                </div>
                <QRCodeSVG
                  value={`upi://pay?pa=${shop.upiId}&pn=${encodeURIComponent(
                    shop.name
                  )}&am=${((bill.amountDuePaise || 0) / 100).toFixed(
                    2
                  )}&cu=INR&tn=${encodeURIComponent(bill.invoiceNumber)}`}
                  size={80}
                  level="M"
                />
                <div className="font-mono text-[10px]">{shop.upiId}</div>
              </div>
            )}
          </div>

          {/* Payment Info */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Payment Mode</div>
              <div className="font-medium capitalize">
                {bill.status === "credit" 
                  ? "Credit (Udhar)" 
                  : bill.status === "partial" 
                    ? "Partial Payment" 
                    : "Fully Paid"}
              </div>
            </div>
            <div
              className={`rounded-full px-3 py-1 text-sm font-medium ${
                bill.status === "paid"
                  ? "bg-(--status-paid-bg) text-(--status-paid-text)"
                  : bill.status === "credit"
                    ? "bg-(--status-unpaid-bg) text-(--status-unpaid-text)"
                    : "bg-(--status-partial-bg) text-(--status-partial-text)"
              }`}
            >
              {(bill.status ?? "paid").toUpperCase()}
            </div>
          </div>
        </CardContent>

        {/* Footer */}
        <Separator />
        <CardFooter className="mt-8 justify-center">
          <h6 className="text-sm text-muted-foreground">
            Thank you for your business!
          </h6>
        </CardFooter>
      </Card>
    </div>
  );
}