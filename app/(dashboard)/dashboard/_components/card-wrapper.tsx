import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface CardWrapperProps {
  title: string;
  href: string;
  hoverEffect?: boolean;
  children: React.ReactNode;
}

export function CardWrapper({
  title,
  href,
  children,
  hoverEffect = true,
}: CardWrapperProps) {
  return (
    <Card
      className={cn(
        "border-border/50 bg-card/50",
        hoverEffect && "transition-all hover:border-primary/30"
      )}
    >
      <CardHeader className="flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        <Link
          href={href}
          className="flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:underline"
        >
          View all <ArrowRight className="size-4" />
        </Link>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
