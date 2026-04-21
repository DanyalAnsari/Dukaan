"use client";

import { useMemo } from "react";
import { Pie, PieChart } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatCurrency } from "@/lib/utils";

const METHOD_COLORS: Record<string, string> = {
  cash: "var(--chart-1)",
  upi: "var(--chart-3)",
  card: "var(--chart-2)",
  credit: "var(--chart-4)",
};
const FALLBACK_COLOR = "var(--chart-5)";

interface PaymentBreakdownProps {
  data: {
    paymentMethod: string;
    totalPaise: number;
  }[];
}

export function PaymentBreakdown({ data }: PaymentBreakdownProps) {
  const { chartData, chartConfig } = useMemo(() => {
    const chartConfig: ChartConfig = {};
    const chartData: {
      method: string;
      total: number;
      fill: string;
    }[] = [];

    for (const { paymentMethod, totalPaise } of data) {
      const key = paymentMethod.toLowerCase();
      const color = METHOD_COLORS[key] ?? FALLBACK_COLOR;

      chartConfig[key] = {
        label: key.charAt(0).toUpperCase() + key.slice(1),
        color,
      };

      chartData.push({
        method: key,
        total: totalPaise,
        fill: `var(--color-${key})`,
      });
    }

    return { chartData, chartConfig };
  }, [data]);

  if (chartData.length === 0) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>Last 7 days</CardDescription>
        </CardHeader>
        <CardContent className="flex h-[300px] items-center justify-center">
          <p className="text-sm text-muted-foreground">No payment data</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Payment Methods</CardTitle>
        <CardDescription>Last 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="mx-auto h-[300px] w-full"
        >
          <PieChart accessibilityLayer>
            <Pie
              data={chartData}
              dataKey="total"
              nameKey="method"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={4}
              strokeWidth={2}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  nameKey="method"
                  formatter={(value) => formatCurrency(value as number)}
                />
              }
            />
            <ChartLegend
              content={<ChartLegendContent nameKey="method" />}
              className="mt-4 flex-wrap gap-2"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
