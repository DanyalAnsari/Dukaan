import { db } from "@/database";
import { sql } from "drizzle-orm";
import { bills, billItems } from "@/database/schemas/business";
import { eq, and, gte, lte } from "drizzle-orm";

export const getMonthlySalesReport = async (shopId: string) => {
  return await db
    .select({
      month: sql<string>`TO_CHAR(${bills.billDate}, 'YYYY-MM')`,
      total: sql<number>`SUM(${bills.totalPaise})`,
      count: sql<number>`COUNT(*)`,
    })
    .from(bills)
    .where(eq(bills.shopId, shopId))
    .groupBy(sql`TO_CHAR(${bills.billDate}, 'YYYY-MM')`)
    .orderBy(sql`TO_CHAR(${bills.billDate}, 'YYYY-MM')`);
};

export const getTopSellingProducts = async (shopId: string, limit: number = 5) => {
  return await db
    .select({
      name: billItems.productName,
      quantity: sql<number>`SUM(${billItems.quantity})`,
      revenue: sql<number>`SUM(${billItems.lineTotalPaise})`,
    })
    .from(billItems)
    .innerJoin(bills, eq(billItems.billId, bills.id))
    .where(eq(bills.shopId, shopId))
    .groupBy(billItems.productName)
    .orderBy(sql`SUM(${billItems.quantity}) DESC`)
    .limit(limit);
};

export const getGSTReport = async (shopId: string, startDate?: Date, endDate?: Date) => {
  const conditions = [eq(bills.shopId, shopId)];
  if (startDate) conditions.push(gte(bills.billDate, startDate));
  if (endDate) conditions.push(lte(bills.billDate, endDate));

  return await db
    .select({
      gstRate: billItems.gstRate,
      taxableAmount: sql<number>`SUM(${billItems.lineTotalPaise} - ${billItems.gstAmountPaise})`,
      gstAmount: sql<number>`SUM(${billItems.gstAmountPaise})`,
    })
    .from(billItems)
    .innerJoin(bills, eq(billItems.billId, bills.id))
    .where(and(...conditions))
    .groupBy(billItems.gstRate);
};
