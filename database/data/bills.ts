import { db } from "@/database";
import { startOfToday } from "@/lib/utils";

export const getTodaysBills = async (shopId: string) => {
  const today = startOfToday();
  return await db.query.bills.findMany({
    where: (bills, { and, eq, gte }) =>
      and(eq(bills.shopId, shopId), gte(bills.billDate, today)),
    orderBy: (bills, { desc }) => [desc(bills.billDate)],
  });
};

export const getAllBills = async (
  shopId: string,
  filters?: { status?: string; startDate?: Date; endDate?: Date }
) => {
  return await db.query.bills.findMany({
    where: (bills, { and, eq, gte, lte }) => {
      const conditions = [eq(bills.shopId, shopId)];
      if (filters?.status && filters.status !== "all") {
        conditions.push(eq(bills.status, filters.status));
      }
      if (filters?.startDate) {
        conditions.push(gte(bills.billDate, filters.startDate));
      }
      if (filters?.endDate) {
        conditions.push(lte(bills.billDate, filters.endDate));
      }
      return and(...conditions);
    },
    with: { customer: { columns: { name: true } } },
    orderBy: (bills, { desc }) => [desc(bills.billDate)],
  });
};

export const getSalesPerformance = async (shopId: string, days: number = 7) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return await db.query.bills.findMany({
    where: (bills, { and, eq, gte }) =>
      and(eq(bills.shopId, shopId), gte(bills.billDate, startDate)),
    orderBy: (bills, { asc }) => [asc(bills.billDate)],
  });
};
