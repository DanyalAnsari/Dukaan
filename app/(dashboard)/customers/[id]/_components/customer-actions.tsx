// app/(dashboard)/customers/[id]/_components/customer-actions.tsx
"use client";

import { useState } from "react";
import { Send, IndianRupee, Pencil } from "lucide-react"; // IndianRupee > DollarSign
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PaymentDialog } from "./payment-dialog";
import { EditCustomerDialog } from "./edit-customer-dialog";

interface CustomerActionsProps {
  customer: {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    creditLimitPaise: number;
  };
  outstandingBalance: number; // in paise
}

// ─── Pure helper — no JSX, easy to unit-test ─────────────────────────────────

function BalanceDisplay({ balance }: { balance: number }) {
  if (balance === 0) {
    return <span className="text-muted-foreground">₹0 — Settled</span>;
  }
  if (balance < 0) {
    return (
      <span className="text-green-600">
        {formatCurrency(Math.abs(balance))} Advance
      </span>
    );
  }
  return <span className="text-red-600">{formatCurrency(balance)} due</span>;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function CustomerActions({
  customer,
  outstandingBalance,
}: CustomerActionsProps) {
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  function handleSendReminder() {
    if (!customer.phone) return;
    const message = `Namaste ${customer.name} ji, aapka ${formatCurrency(
      outstandingBalance
    )} baaki hai. Kripya payment kar dijiye.`;
    window.open(
      `https://wa.me/91${customer.phone}?text=${encodeURIComponent(message)}`
    );
  }

  return (
    <div className="text-right">
      <div className="font-mono text-3xl font-bold">
        <BalanceDisplay balance={outstandingBalance} />
      </div>

      <div className="mt-2 flex justify-end gap-2">
        {customer.phone && (
          <Button variant="outline" size="sm" onClick={handleSendReminder}>
            <Send className="mr-1 h-4 w-4" />
            Send Reminder
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setEditDialogOpen(true)}
        >
          <Pencil className="mr-1 h-4 w-4" />
          Edit
        </Button>
        <Button size="sm" onClick={() => setPaymentDialogOpen(true)}>
          <IndianRupee className="mr-1 h-4 w-4" />
          Record Payment
        </Button>
      </div>

      {/* billId omitted — this is a ledger-level advance payment, not bill-specific */}
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
