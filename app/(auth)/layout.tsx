import Link from "next/link";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { LOGO } from "@/constants";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left — branding */}
      <div className="relative hidden bg-primary/50 lg:flex lg:w-1/2">
        <div className="relative z-10 flex w-full flex-col justify-between p-12">
          <Link
            href="/"
            className="text-2xl font-medium tracking-tight text-primary"
          >
            {LOGO}
          </Link>
          <div className="max-w-md">
            <blockquote className="text-muted-background/90 font-heading text-3xl leading-snug italic">
              &quot;The best businesses are built on trust, one customer at a
              time.&quot;
            </blockquote>
            <p className="text-muted-background/60 mt-4">— Dukaan</p>
          </div>
          <p className="text-muted-background/60 text-sm">
            Simple billing for Indian shopkeepers.
          </p>
        </div>
      </div>

      {/* Right — form shell */}
      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between p-4 lg:p-6">
          <Link
            href="/"
            className="text-xl font-medium tracking-tight lg:hidden"
          >
            {LOGO}
          </Link>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center p-4 sm:p-8">
          <div className="w-full max-w-md">{children}</div>
        </div>

        <div className="p-4 text-center text-sm text-muted-foreground lg:p-6">
          <p>© {new Date().getFullYear()} Dukaan. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
