"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <AlertTriangle className="size-10 text-destructive" aria-hidden="true" />
      <div className="space-y-1"><h1 className="font-heading text-2xl font-semibold">Couldn’t load this page</h1><p className="text-sm text-muted-foreground">Your data is safe. Try again in a moment.</p></div>
      <Button onClick={reset}><RefreshCw />Try again</Button>
    </div>
  );
}
