import { NextRequest } from "next/server";
import { sql } from "drizzle-orm";

import { db } from "@/database";
import { customers, shops } from "@/database/schemas";
import { formatCurrency } from "@/lib/utils";
import { reminderWhatsAppMessage, whatsappNumber } from "@/lib/whatsapp";

export async function GET(request: NextRequest) {
  if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) return new Response("Unauthorized", { status: 401 });
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;
  const outstanding = await db.select({ customer: customers, shop: shops }).from(customers).innerJoin(shops, sql`${customers.shopId} = ${shops.id}`).where(sql`${customers.outstandingBalancePaise} > 0 AND ${customers.isActive}`);
  const reminders = outstanding.flatMap(({ customer, shop }) => {
    const phone = whatsappNumber(customer.phone);
    if (!phone) return [];
    const message = reminderWhatsAppMessage({ customerName: customer.name, shopName: shop.name, balance: formatCurrency(customer.outstandingBalancePaise), url: appUrl });
    return [`https://wa.me/${phone}?text=${encodeURIComponent(message)}`];
  });
  console.info("Payment reminder URLs", reminders);
  return Response.json({ queued: reminders.length });
}
