import Link from "next/link";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Unauthorized() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <LogIn className="size-10 text-primary" aria-hidden="true" />
      <div className="space-y-1"><h1 className="font-heading text-2xl font-semibold">Sign in required</h1><p className="text-sm text-muted-foreground">Sign in to access your shop dashboard.</p></div>
      <Button asChild><Link href="/login">Sign in</Link></Button>
    </div>
  );
}
