export function whatsappNumber(phone?: string | null) {
  const digits = phone?.replace(/\D/g, "") ?? "";
  if (!digits) return null;
  return digits.length === 10 ? `91${digits}` : digits;
}

export function invoiceWhatsAppMessage({ shopName, invoiceNumber, total, url }: { shopName: string; invoiceNumber: string; total: string; url: string }) {
  return `🧾 *Invoice ${invoiceNumber}*\n\n*${shopName}*\nTotal: *${total}*\n\nView your invoice: ${url}\n\nThank you for your business!`;
}

export function reminderWhatsAppMessage({ customerName, shopName, balance, url }: { customerName: string; shopName: string; balance: string; url: string }) {
  return `Hello ${customerName},\n\nYour outstanding balance with *${shopName}* is *${balance}*.\n\nPlease pay at your convenience. ${url}\n\nThank you!`;
}
