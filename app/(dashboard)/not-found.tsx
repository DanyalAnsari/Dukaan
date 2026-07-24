import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardNotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <FileQuestion className="size-10 text-muted-foreground" aria-hidden="true" />
      <div className="space-y-1"><h1 className="font-heading text-2xl font-semibold">Page not found</h1><p className="text-sm text-muted-foreground">It may have been moved, deleted, or you may not have access.</p></div>
      <Button asChild><Link href="/dashboard">Back to dashboard</Link></Button>
    </div>
  );
}
