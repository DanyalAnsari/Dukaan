"use client";

import StatusBadge from "@/components/shared/status-badge";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/components/providers/cart-store-provider";
import { User } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

interface Customer {
  id: string;
  name: string;
  phone: string | null;
  outstandingBalancePaise: number | null;
}

interface CustomerComboboxProps {
  customers: Customer[];
}

export default function CustomerCombobox({ customers }: CustomerComboboxProps) {
  const { customerId, setCustomer } = useCartStore((s) => s);
  const [open, setOpen] = useState(false);

  const handleSelectCustomer = useCallback(
    (customer: Customer) => {
      setCustomer(customer.id, customer.name);
      toast.success(`Customer selected: ${customer.name}`);
      setOpen(false);
    },
    [setCustomer]
  );

  const handleSelectWalkIn = useCallback(() => {
    setCustomer(null, "Walk-in Customer");
    toast.success("Walk-in customer selected");
    setOpen(false);
  }, [setCustomer]);

  // Add walk-in option at the top
  const customerItems = useMemo(() => {
    return [
      {
        id: "walk-in",
        name: "Walk-in Customer",
        phone: null,
        outstandingBalancePaise: 0,
      },
      ...customers,
    ];
  }, [customers]);

  const selectedCustomer = useMemo(() => {
    const found = customerId
      ? customerItems.find((c) => c.id === customerId)
      : undefined;
    return found || customerItems[0]; // Default to walk-in
  }, [customerId, customerItems]);

  return (
    <Combobox
      items={customerItems}
      itemToStringValue={(item) => item.name}
      itemToStringLabel={(item) => item.name}
      value={selectedCustomer}
      onValueChange={(customer) => {
        if (!customer) return;
        if (customer.id === "walk-in") {
          handleSelectWalkIn();
        } else {
          handleSelectCustomer(customer);
        }
      }}
      open={open}
      onOpenChange={setOpen}
      autoHighlight
    >
      <ComboboxInput placeholder="Search customer..." />
      <ComboboxContent className="w-[--radix-combobox-trigger-width]">
        <ComboboxEmpty>No customers found.</ComboboxEmpty>
        <ComboboxList>
          {(item) => {
            const customer = item as Customer;
            return (
              <ComboboxItem
                key={customer.id}
                value={customer}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  {customer.id === "walk-in" && <User className="h-4 w-4" />}
                  <div className="flex flex-col">
                    <span className="font-medium">{customer.name}</span>
                    {customer.phone && (
                      <span className="text-xs text-muted-foreground">
                        {customer.phone}
                      </span>
                    )}
                  </div>
                </div>
                {customer.outstandingBalancePaise !== null &&
                  customer.outstandingBalancePaise > 0 && (
                    <StatusBadge variant="unpaid">
                      {formatCurrency(customer.outstandingBalancePaise)}
                    </StatusBadge>
                  )}
              </ComboboxItem>
            );
          }}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
