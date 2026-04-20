"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { LOGO } from "@/constants";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { Shop } from "@/types";
import {
  LayoutDashboard,
  LogOut,
  Package,
  Receipt,
  Settings,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

const navigation = [
  { href: "/dashboard", name: "Dashboard", icon: LayoutDashboard },
  { href: "/bills", name: "Bills", icon: Receipt },
  { href: "/products", name: "Products", icon: Package },
  { href: "/purchases", name: "Purchases", icon: ShoppingCart },
  { href: "/customers", name: "Customers", icon: Users },
  { href: "/reports", name: "Reports", icon: TrendingUp },
  { href: "/settings", name: "Settings", icon: Settings },
];

interface DashboardSidebarProps {
  shop: Shop;
  userEmail: string;
}

export default function DashboardSidebar({
  shop,
  userEmail,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => pathname.startsWith(href);

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
          toast.warning("You have been logged out.");
        },
      },
    });
  };

  return (
    <Sidebar>
      <SidebarHeader className="justify-center px-4">
        <h1 className="text-2xl font-medium tracking-tight text-primary">
          {LOGO}
        </h1>
        <p className="text-sm font-medium tracking-tight text-muted-foreground/90">
          {shop.name}
        </p>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5 p-2">
              {navigation.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    className={cn(
                      "font-medium",
                      isActive(item.href)
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Link href={item.href}>
                      <item.icon className="size-4" />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarSeparator />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleSignOut}
              className="flex w-full items-center justify-between"
            >
              <span className="truncate text-sm">{userEmail}</span>
              <LogOut className="size-4 shrink-0" aria-label="Log Out" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
