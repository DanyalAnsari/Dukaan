import Link from "next/link";
import { differenceInCalendarDays } from "date-fns";
import { AlertTriangleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TrialBanner({ trialEndsAt }: { trialEndsAt?: Date }) {
  if (!trialEndsAt) return null;
  const days = Math.max(0, differenceInCalendarDays(trialEndsAt, new Date()));
  if (days > 7) return null;

  return (
    <aside className="flex flex-wrap items-center justify-between gap-3 border-b bg-muted px-4 py-3 text-sm">
      <p className="flex items-center gap-2">
        <AlertTriangleIcon aria-hidden />
        Your free trial ends {days === 0 ? "today" : `in ${days} day${days === 1 ? "" : "s"}`}.
        Upgrade to keep your plan features.
      </p>
      <Button asChild size="sm">
        <Link href="/settings/billing">View plans</Link>
      </Button>
    </aside>
  );
}
