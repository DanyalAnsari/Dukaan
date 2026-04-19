import { getSession } from "@/lib/get-session";
import { getShopByUserId } from "@/database/data/shop";
import { formatCurrency } from "@/lib/utils";
import { CustomersDataTable } from "./_components/data-table";
import CreateCustomerDialog from "./_components/create-customer-dialog";
import StatsCard from "@/components/shared/stats-card";
import { getActiveCustomers } from "@/database/data/customers";

export default async function CustomersPage() {
  const session = await getSession();
  const shop = (await getShopByUserId(session!.user.id))!;

  // Fetch active customers from data layer
  const allCustomers = await getActiveCustomers(shop.id);

  // Stats
  const totalCustomers = allCustomers.length;
  const customersWithBalance = allCustomers.filter(
    (c) => (c.outstandingBalancePaise ?? 0) > 0
  ).length;
  const totalUdhar = allCustomers.reduce(
    (sum, c) => sum + (c.outstandingBalancePaise ?? 0),
    0
  );

  const stats = [
    {
      title: "Total Customers",
      stat: totalCustomers,
    },
    {
      title: "Customers With Balance",
      stat: customersWithBalance,
      className: "text-amber-600",
    },
    {
      title: "Total Udhar",
      stat: formatCurrency(totalUdhar),
      className: "text-red-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Customers</h1>
          <p className="font-heading text-sm text-muted-foreground">
            Manage your customers.
          </p>
        </div>
        <CreateCustomerDialog />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <StatsCard
            key={stat.title}
            title={stat.title}
            stat={stat.stat}
            contentClassName={stat.className}
          />
        ))}
      </div>

      {/* Table */}

      <CustomersDataTable data={allCustomers} />
    </div>
  );
}
