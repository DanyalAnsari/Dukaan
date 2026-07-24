import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Forbidden() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <LockKeyhole className="size-10 text-destructive" aria-hidden="true" />
      <div className="space-y-1"><h1 className="font-heading text-2xl font-semibold">You don’t have access</h1><p className="text-sm text-muted-foreground">Ask your shop owner to update your permissions.</p></div>
      <Button asChild variant="outline"><Link href="/dashboard">Back to dashboard</Link></Button>
    </div>
  );
}
