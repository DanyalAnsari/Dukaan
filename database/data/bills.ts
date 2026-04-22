import { db } from "@/database";
import { startOfToday } from "@/lib/utils";
import { and, eq, gte, sql } from "drizzle-orm";
import { cache } from "react";
import { bills } from "../schemas";
import { subDays } from "date-fns";

export const getTodaysBills = cache(async (shopId: string) => {
  const today = startOfToday();
  return await db.query.bills.findMany({
    where: (bills, { and, eq, gte }) =>
      and(eq(bills.shopId, shopId), gte(bills.billDate, today)),
    orderBy: (bills, { desc }) => [desc(bills.billDate)],
  });
});

export const getAllBills = cache(
  async (shopId: string) =>
    await db.query.bills.findMany({
      where: (bills) => eq(bills.shopId, shopId),
      with: { customer: { columns: { name: true } } },
      orderBy: (bills, { desc }) => [desc(bills.billDate)],
    })
);

export const getBillsStat = cache((shopId: string) =>
  db
    .select({
      totalBills: sql<number>`COUNT(*)`.mapWith(Number),
      totalAmount: sql<number>`COALESCE(SUM(total_paise), 0)`.mapWith(Number),
      paidAmount: sql<number>`COALESCE(SUM(amount_paid_paise), 0)`.mapWith(
        Number
      ),
      pendingAmount: sql<number>`COALESCE(SUM(amount_due_paise), 0)`.mapWith(
        Number
      ),
    })
    .from(bills)
    .where(eq(bills.shopId, shopId))
);

// For SalesChart — groups by day only
export const getSalesByDay = async (shopId: string, days: number = 7) => {
  const startDate = subDays(new Date(), days);

  return db
    .select({
      day: sql<string>`DATE(bill_date)`,
      totalPaise: sql<number>`SUM(total_paise)`.mapWith(Number),
    })
    .from(bills)
    .where(and(eq(bills.shopId, shopId), gte(bills.billDate, startDate)))
    .groupBy(sql`DATE(bill_date)`) // ← only day
    .orderBy(sql`DATE(bill_date)`);
};

// For PaymentBreakdown — groups by method only
export const getPaymentBreakdown = async (shopId: string, days: number = 7) => {
  const startDate = subDays(new Date(), days);

  return db
    .select({
      paymentMethod: sql<string>`COALESCE(payment_method, 'cash')`,
      totalPaise: sql<number>`SUM(total_paise)`.mapWith(Number),
    })
    .from(bills)
    .where(and(eq(bills.shopId, shopId), gte(bills.billDate, startDate)))
    .groupBy(sql`COALESCE(payment_method, 'cash')`);
};
