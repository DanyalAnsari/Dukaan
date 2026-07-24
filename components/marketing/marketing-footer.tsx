import Link from "next/link";

export function MarketingFooter() {
  return <footer className="border-t"><div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6"><p className="text-muted-foreground">© {new Date().getFullYear()} Dukaan. Built for Indian retail.</p><div className="flex flex-wrap gap-5"><Link className="text-muted-foreground hover:text-foreground" href="/privacy">Privacy</Link><Link className="text-muted-foreground hover:text-foreground" href="/terms">Terms</Link><a className="text-muted-foreground hover:text-foreground" href="mailto:support@yourdomain.in">support@yourdomain.in</a></div></div></footer>;
}
