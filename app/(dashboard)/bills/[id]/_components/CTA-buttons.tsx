"use client";

import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Bill, Shop } from "@/types";
import { FileText, Printer, Share2, Banknote } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { BillPaymentDialog } from "./bill-payment-dialog";

export default function CTAbuttons({
  bill,
  shop,
  id,
}: {
  bill: Bill;
  shop: Shop;
  id: string;
}) {
  const [payDialogOpen, setPayDialogOpen] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    if (!shop) return;
    const message = `🧾 *Invoice ${bill.invoiceNumber}*\n\n*${shop.name}*\nDate: ${formatDate(new Date(bill.billDate))}\n\nTotal: *${formatCurrency(bill.totalPaise)}*\nStatus: ${bill.status?.toUpperCase()}\n\nThank you for your business!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`);
  };

  const isPaid = bill.status === "paid";

  return (
    <div className="flex gap-2">
      {!isPaid && (
        <Button
          variant="default"
          className="bg-green-600 hover:bg-green-700"
          onClick={() => setPayDialogOpen(true)}
        >
          <Banknote className="mr-2 h-4 w-4" />
          Record Payment
        </Button>
      )}
      <Button variant="outline" onClick={handlePrint}>
        <Printer className="mr-2 h-4 w-4" />
        Print
      </Button>
      <Button variant="outline" onClick={handleWhatsAppShare}>
        <Share2 className="mr-2 h-4 w-4" />
        WhatsApp
      </Button>
      <Link href={`/api/bills/${id}/pdf`} target="_blank">
        <Button variant="secondary">
          <FileText className="mr-2 h-4 w-4" />
          PDF
        </Button>
      </Link>

      <BillPaymentDialog
        open={payDialogOpen}
        onOpenChange={setPayDialogOpen}
        billId={bill.id}
        invoiceNumber={bill.invoiceNumber}
        customerId={bill.customerId}
        amountDue={bill.amountDuePaise || 0}
      />
    </div>
  );
}
