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
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TrendingUp, Package, Percent } from "lucide-react";
import { FadeIn, FadeInStagger } from "@/components/shared/motion-wrapper";

export default async function ReportsPage() {
  const session = await getSession();
  const shop = (await getShopByUserId(session!.user.id))!;

  const [monthlySales, topProducts, gstReport] = await Promise.all([
    getMonthlySalesReport(shop.id),
    getTopSellingProducts(shop.id, 10),
    getGSTReport(shop.id),
  ]);

  return (
    <FadeInStagger className="space-y-6">
      <FadeIn className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Business Reports</h1>
        <p className="text-muted-foreground">
          Detailed insights into your sales, inventory, and tax compliance.
        </p>
      </FadeIn>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Monthly Sales */}
        <FadeIn>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="text-base font-semibold">
                  Monthly Sales Performance
                </CardTitle>
                <CardDescription>Sales trend over time</CardDescription>
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
                  {monthlySales.map((item) => (
                    <TableRow key={item.month}>
                      <TableCell className="font-medium">
                        {item.month}
                      </TableCell>
                      <TableCell className="text-right">{item.count}</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(item.total)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </FadeIn>

        {/* GST Summary */}
        <FadeIn>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="text-base font-semibold">
                  GST Tax Summary
                </CardTitle>
                <CardDescription>Tax liability breakdown</CardDescription>
              </div>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rate</TableHead>
                    <TableHead className="text-right">Taxable</TableHead>
                    <TableHead className="text-right">Tax Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gstReport.map((item) => (
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
                  ))}
                </TableBody>
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
                  Most popular items by volume and revenue
                </CardDescription>
              </div>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead className="text-right">Quantity Sold</TableHead>
                    <TableHead className="text-right">Total Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProducts.map((item) => (
                    <TableRow key={item.name}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-right">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-right font-mono text-primary">
                        {formatCurrency(item.revenue)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </FadeInStagger>
  );
}
