"use client";

import { MessageCircleIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { reminderWhatsAppMessage, whatsappNumber } from "@/lib/whatsapp";
import type { Customer } from "@/types";

export function SendRemindersButton({ customers, shopName }: { customers: Customer[]; shopName: string }) {
  const send = () => {
    const recipients = customers.flatMap((customer) => {
      const phone = whatsappNumber(customer.phone);
      if (!phone || !customer.outstandingBalancePaise || customer.outstandingBalancePaise <= 0) return [];
      const message = reminderWhatsAppMessage({ customerName: customer.name, shopName, balance: formatCurrency(customer.outstandingBalancePaise), url: window.location.origin });
      return [`https://wa.me/${phone}?text=${encodeURIComponent(message)}`];
    });
    if (!recipients.length) return toast.error("No customers with a phone number and an outstanding balance.");
    recipients.forEach((url, index) => window.setTimeout(() => window.open(url, "_blank", "noopener,noreferrer"), index * 750));
    toast.success(`Opening ${recipients.length} WhatsApp reminder${recipients.length === 1 ? "" : "s"}.`);
  };

  return <Button variant="outline" onClick={send}><MessageCircleIcon data-icon="inline-start" />Send payment reminders</Button>;
}
