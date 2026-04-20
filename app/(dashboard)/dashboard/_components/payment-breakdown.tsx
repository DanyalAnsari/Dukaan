"use client";

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

// Colors reference your CSS variables from globals.css
// cash → chart-1 (green), upi → chart-3 (blue),
// card → chart-2 (amber), credit → chart-4 (red)
const METHOD_COLORS: Record<string, string> = {
  cash: "var(--chart-1)",
  upi: "var(--chart-3)",
  card: "var(--chart-2)",
  credit: "var(--chart-4)",
};

const FALLBACK_COLOR = "var(--chart-5)";

interface PaymentBreakdownProps {
  data: {
    name: string; // lowercase key e.g. "cash", "upi"
    value: number; // amount in paise
  }[];
}

export function PaymentBreakdown({ data }: PaymentBreakdownProps) {
  if (data.length === 0) {
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

  // Build chartConfig from data — colors come from METHOD_COLORS
  const chartConfig = data.reduce<ChartConfig>((acc, entry) => {
    const key = entry.name.toLowerCase();
    acc[key] = {
      label: entry.name.toUpperCase(),
      color: METHOD_COLORS[key] ?? FALLBACK_COLOR,
    };
    return acc;
  }, {});

  // chartData keys must match chartConfig keys exactly
  // fill uses the CSS variable that ChartContainer resolves
  const chartData = data.map((entry) => {
    const key = entry.name.toLowerCase();
    return {
      name: key,
      value: entry.value,
      fill: METHOD_COLORS[key] ?? FALLBACK_COLOR,
    };
  });

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
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={4}
              strokeWidth={2}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  nameKey="name"
                  formatter={(value) => formatCurrency(value as number)}
                />
              }
            />
            <ChartLegend
              content={<ChartLegendContent nameKey="name" />}
              className="mt-4 flex-wrap gap-2"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
