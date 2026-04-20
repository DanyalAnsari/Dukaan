import { ThemeToggle } from "@/components/shared/theme-toggle";
import { LOGO } from "@/constants";
import { getShopByUserId } from "@/database/data/shop";
import { getSession } from "@/lib/get-session";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function SetupPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const shop = await getShopByUserId(session.user.id);
  if (shop) redirect("/dashboard");

  return (
    <div className="flex min-h-screen w-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 lg:p-6">
        <Link
          href="/"
          className="text-xl font-medium tracking-tight lg:text-2xl"
        >
          {LOGO}
        </Link>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </div>
      {/* Main Content */}
      <div className="flex flex-1 items-center justify-center p-2 sm:p-4">
        {children}
      </div>
      <div className="p-4 text-center text-sm text-muted-foreground lg:p-6">
        <p>© {new Date().getFullYear()} Dukaan. All rights reserved.</p>
      </div>
    </div>
  );
}
