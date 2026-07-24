import Link from "next/link";
import type { ReactNode } from "react";

import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function LegalPage({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return <div className="flex min-h-screen flex-col"><MarketingHeader /><main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:py-20"><Card><CardHeader className="gap-2"><p className="text-sm font-medium text-primary">Dukaan legal</p><CardTitle className="text-3xl sm:text-4xl">{title}</CardTitle><CardDescription>{description}</CardDescription></CardHeader><CardContent className="flex flex-col gap-7 text-sm leading-6 text-muted-foreground">{children}<p>Questions? Write to <a className="text-primary underline underline-offset-4" href="mailto:support@yourdomain.in">support@yourdomain.in</a>.</p><Link className="font-medium text-primary hover:underline" href="/">Back to Dukaan</Link></CardContent></Card></main><MarketingFooter /></div>;
}
