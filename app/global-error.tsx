"use client";

import { useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return <html lang="en"><body className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground"><main className="flex max-w-sm flex-col items-center gap-4 text-center"><h1 className="font-sans text-2xl font-semibold">Something went wrong</h1><p className="text-sm text-muted-foreground">Please try loading the page again.</p><Button onClick={reset}><RefreshCw />Try again</Button></main></body></html>;
}
