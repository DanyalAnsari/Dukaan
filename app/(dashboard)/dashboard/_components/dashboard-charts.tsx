"use client";

import dynamic from "next/dynamic";

import { Skeleton } from "@/components/ui/skeleton";

const SalesChart = dynamic(
  () => import("./sales-chart").then((module) => module.SalesChart),
  { ssr: false, loading: () => <Skeleton className="col-span-3 h-96" /> }
);
const PaymentBreakdown = dynamic(
  () => import("./payment-breakdown").then((module) => module.PaymentBreakdown),
  { ssr: false, loading: () => <Skeleton className="col-span-2 h-96" /> }
);

export function DashboardCharts({ sales, payments }: { sales: { date: string; total: number }[]; payments: { paymentMethod: string; totalPaise: number }[] }) {
  return <><SalesChart data={sales} /><PaymentBreakdown data={payments} /></>;
}
