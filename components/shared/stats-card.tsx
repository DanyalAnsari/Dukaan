import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  contentClassName?: string;
  stat: number | string | React.ReactElement;
  icon?: LucideIcon;
  iconClass?: string;
  description?: string;
  trend?: {
    value: number;
    isUp: boolean;
  };
}

export default function StatsCard({
  title,
  contentClassName,
  stat,
  icon: Icon,
  iconClass = "",
  description,
  trend,
}: StatsCardProps) {
  return (
    <Card className="relative overflow-hidden border-border/50 bg-card/50 transition-all hover:border-primary/30 hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && (
          <div
            className={cn(
              "rounded-lg bg-primary/10 p-2 text-primary",
              iconClass
            )}
          >
            <Icon className="size-4" />
          </div>
        )}
      </CardHeader>
      <CardContent className="pb-6">
        <div
          className={cn(
            "text-xl font-bold tracking-tight sm:text-2xl",
            contentClassName
          )}
        >
          {stat}
        </div>
        {(description || trend) && (
          <div className="mt-1 flex items-center gap-2">
            {trend && (
              <span
                className={cn(
                  "text-xs font-medium",
                  trend.isUp ? "text-emerald-500" : "text-rose-500"
                )}
              >
                {trend.isUp ? "+" : "-"}
                {trend.value}%
              </span>
            )}
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
