"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Send, DollarSign, Pencil } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { PaymentDialog } from "./payment-dialog";
import { EditCustomerDialog } from "./edit-customer-dialog";
import { useState } from "react";

interface CustomerActionsProps {
  customer: {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    creditLimitPaise: number;
  };
  outstandingBalance: number;
}

export default function CustomerActions({
  customer,
  outstandingBalance,
}: CustomerActionsProps) {
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const isSettled = outstandingBalance === 0;

  const handleSendReminder = () => {
    if (!customer.phone) return;
    const message = `Namaste ${customer.name} ji, aapka ${formatCurrency(
      outstandingBalance
    )} baaki hai. Kripya payment kar dijiye.`;
    window.open(
      `https://wa.me/91${customer.phone}?text=${encodeURIComponent(message)}`
    );
  };

  return (
    <div className="text-right">
      <div
        className={`text-3xl font-bold font-mono ${
          outstandingBalance > 0 
            ? "text-red-600" 
            : outstandingBalance < 0 
              ? "text-green-600" 
              : "text-muted-foreground"
        }`}
      >
        {outstandingBalance === 0 ? (
          <span className="text-muted-foreground">₹0 — Settled</span>
        ) : outstandingBalance < 0 ? (
          <span>{formatCurrency(Math.abs(outstandingBalance))} Advance</span>
        ) : (
          <span>{formatCurrency(outstandingBalance)} due</span>
        )}
      </div>
      <div className="flex gap-2 mt-2 justify-end">
        {customer.phone && (
          <Button variant="outline" size="sm" onClick={handleSendReminder}>
            <Send className="h-4 w-4 mr-1" />
            Send Reminder
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setEditDialogOpen(true)}
        >
          <Pencil className="h-4 w-4 mr-1" />
          Edit
        </Button>
        <Button size="sm" onClick={() => setPaymentDialogOpen(true)}>
          <DollarSign className="h-4 w-4 mr-1" />
          Record Payment
        </Button>
      </div>

      <PaymentDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        customerId={customer.id}
        customerName={customer.name}
        outstandingBalance={outstandingBalance}
      />

      <EditCustomerDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        customer={customer}
      />
    </div>
  );
}
