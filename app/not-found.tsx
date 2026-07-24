import Link from "next/link";
import { Home, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <SearchX className="size-10 text-muted-foreground" aria-hidden="true" />
      <div className="space-y-1"><h1 className="font-heading text-2xl font-semibold">Page not found</h1><p className="text-sm text-muted-foreground">The page you’re looking for doesn’t exist.</p></div>
      <Button asChild><Link href="/"><Home />Go home</Link></Button>
    </main>
  );
}
