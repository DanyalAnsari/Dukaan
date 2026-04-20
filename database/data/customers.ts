import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "..";
import { customers } from "../schemas";

export const getActiveCustomers = async (shopId: string) =>
  await db.query.customers.findMany({
    where: (customers, { eq, and }) =>
      and(eq(customers.shopId, shopId), eq(customers.isActive, true)),
    orderBy: (customers, { desc }) => [desc(customers.createdAt)],
  });

export const getOutstandingCustomers = async (shopId: string, limit = 5) =>
  await db.query.customers.findMany({
    where: (customers, { and, eq }) =>
      and(
        eq(customers.shopId, shopId),
        eq(customers.isActive, true),
        sql`${customers.outstandingBalancePaise} > 0`
      ),
    orderBy: (customers, { desc }) => [desc(customers.outstandingBalancePaise)],
    limit,
  });
