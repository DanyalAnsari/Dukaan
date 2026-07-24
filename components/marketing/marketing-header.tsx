import Image from "next/image";
import Link from "next/link";

import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";

export function MarketingHeader() {
  return <header className="border-b bg-background/90 backdrop-blur"><nav aria-label="Main navigation" className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6"><Link href="/" className="flex items-center gap-2 font-heading text-lg font-semibold"><Image src="/icon-192.png" alt="" width={32} height={32} className="size-8 rounded-md" priority />Dukaan</Link><div className="flex items-center gap-2"><ThemeToggle /><Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex"><Link href="/login">Sign in</Link></Button><Button asChild size="sm"><Link href="/signup">Start free</Link></Button></div></nav></header>;
}
