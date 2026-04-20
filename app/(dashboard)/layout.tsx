import { redirect } from "next/navigation";
import { getSession } from "@/lib/get-session";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import DashboardSidebar from "./_components/dashboard-sidebar";
import { getShopByUserId } from "@/database/data/shop";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import BackLink from "@/components/shared/back-link";
import MobileNav from "./_components/mobile-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const shop = await getShopByUserId(session.user.id);
  if (!shop) redirect("/setup");

  return (
    <SidebarProvider>
      {/* Sidebar */}
      <DashboardSidebar userEmail={session.user.email} shop={shop} />

      {/* Main content */}
      <div className="flex-1 bg-secondary/20 pb-20 lg:pb-0">
        <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b">
          <div className="flex w-full items-center justify-between px-4">
            <div className="flex items-center justify-between gap-2">
              <SidebarTrigger />
              <Separator orientation="vertical" className="h-8" />
              <BackLink>Back</BackLink>
            </div>
            <ThemeToggle />
          </div>
        </header>
        <main className="p-4 lg:p-6">{children}</main>
      </div>
      <MobileNav />
    </SidebarProvider>
  );
}
