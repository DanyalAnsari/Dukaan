"use client";

import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  Receipt,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Home", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Bills", icon: Receipt, href: "/bills" },
  { label: "Quick Bill", icon: PlusCircle, href: "/bills/new", primary: true },
  { label: "Reports", icon: TrendingUp, href: "/reports" },
  { label: "More", icon: Package, href: "/products" },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="pb-safe fixed right-0 bottom-0 left-0 z-50 flex h-16 items-center justify-around border-t bg-background/80 px-4 backdrop-blur-lg lg:hidden">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        if (item.primary) {
          return (
            <Link
              key={item.href}
              href={item.href}
              className="group relative -top-6 flex flex-col items-center"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-transform active:scale-95">
                <Icon className="h-7 w-7" />
              </div>
              <span className="mt-1 text-[10px] font-medium text-muted-foreground group-active:text-primary">
                {item.label}
              </span>
            </Link>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 transition-colors",
              isActive ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
