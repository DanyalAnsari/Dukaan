"use client";

import { useCartStore } from "@/components/providers/cart-store-provider";
import StatsCard from "@/components/shared/stats-card";
import { formatCurrency } from "@/lib/utils";
import { getCartSubtotal, getCartTotal } from "@/stores/cartStore";
import { FileText, IndianRupee, Package } from "lucide-react";
import { useMemo } from "react";

export default function StatsSection() {
  const items = useCartStore((s) => s.items);
  const discountPaise = useCartStore((s) => s.discountPaise);

  const stats = useMemo(() => {
    const subtotal = getCartSubtotal(items);
    const total = getCartTotal(items, discountPaise);
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    return [
      {
        title: "Cart Items",
        stat: totalItems,
        icon: Package,
        description: "Items in cart",
      },
      {
        title: "Subtotal",
        stat: formatCurrency(subtotal),
        icon: IndianRupee,
        description: "Amount without taxes", // fixed typo: "Amout"
      },
      {
        title: "Total",
        stat: formatCurrency(total),
        icon: FileText,
        className: "font-mono text-primary",
        description: "Total amount",
      },
    ];
  }, [items, discountPaise]);

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {stats.map((item) => (
        <StatsCard
          key={item.title}
          title={item.title}
          icon={item.icon}
          stat={item.stat}
          contentClassName={item.className}
          description={item.description}
        />
      ))}
    </section>
  );
}
