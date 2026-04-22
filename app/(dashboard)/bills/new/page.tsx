import { getSession } from "@/lib/get-session";
import { getShopByUserId } from "@/database/data/shop";
import { getActiveProducts } from "@/database/data/products";
import { getActiveCustomers } from "@/database/data/customers";
import ClearCartButton from "./_components/clear-cart-button";
import SubmitButton from "./_components/submit-button";
import StatsSection from "./_components/stats-section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, User } from "lucide-react";
import CustomerCombobox from "./_components/customer-combobox";
import SelectedCustomerDisplay from "./_components/selected-customer-display";
import ProductCombobox from "./_components/product-combobox";
import { Separator } from "@/components/ui/separator";
import CartItemsTable from "./_components/cart-item-table";
import BillSummary from "./_components/bill-summary";

export const metadata = {
  title: "New Bill | POS",
  description: "Create a new sales invoice",
};

export default async function NewBillPage() {
  const session = await getSession();
  const shop = (await getShopByUserId(session!.user.id))!;

  // Parallel data fetching
  const [products, customers] = await Promise.all([
    getActiveProducts(shop.id),
    getActiveCustomers(shop.id),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold">New Bill</h1>
          <p className="text-sm text-muted-foreground">
            Create a new sales invoice
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ClearCartButton />
          <SubmitButton />
        </div>
      </div>

      {/* Stats */}
      <StatsSection />

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Customer & Products */}
        <div className="space-y-6 lg:col-span-2">
          {/* Customer Selection */}
          <Card className="border-border/50 bg-card/50 transition-all hover:border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="size-5" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <CustomerCombobox customers={customers} />
              <SelectedCustomerDisplay />
            </CardContent>
          </Card>

          {/* Products */}
          <Card className="border-border/50 bg-card/50 transition-all hover:border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="size-5" />
                Products
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ProductCombobox products={products} />
              <Separator />
              <CartItemsTable products={products} />
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Bill Summary */}
        <div className="lg:col-span-1">
          <BillSummary />
        </div>
      </div>
    </div>
  );
}
