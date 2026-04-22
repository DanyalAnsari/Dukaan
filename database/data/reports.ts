import { db } from "@/database";
import { sql, eq, and, gte, lte } from "drizzle-orm";
import { bills, billItems } from "@/database/schemas";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MonthlySalesRow {
  /** Formatted for display: "Jan 2025" */
  month: string;
  /** Raw YYYY-MM for sorting / keying */
  monthKey: string;
  total: number;
  count: number;
}

export interface TopProductRow {
  productId: string | null;
  name: string;
  quantity: number;
  revenue: number;
}

export interface GSTReportRow {
  gstRate: number;
  taxableAmount: number;
  gstAmount: number;
}

// ─── Monthly Sales ────────────────────────────────────────────────────────────

export async function getMonthlySalesReport(
  shopId: string
): Promise<MonthlySalesRow[]> {
  // Limit to last 12 months — unbounded would grow forever and slow the query
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
  twelveMonthsAgo.setDate(1);
  twelveMonthsAgo.setHours(0, 0, 0, 0);

  const rows = await db
    .select({
      // YYYY-MM for deterministic ordering
      monthKey: sql<string>`TO_CHAR(${bills.billDate}, 'YYYY-MM')`,
      // Human-readable label — formatted in DB so the page needs no helper
      month: sql<string>`TO_CHAR(${bills.billDate}, 'Mon YYYY')`,
      // ::integer cast — Postgres SUM returns text, not number
      total: sql<number>`SUM(${bills.totalPaise})::integer`,
      count: sql<number>`COUNT(*)::integer`,
    })
    .from(bills)
    .where(and(eq(bills.shopId, shopId), gte(bills.billDate, twelveMonthsAgo)))
    .groupBy(
      sql`TO_CHAR(${bills.billDate}, 'YYYY-MM')`,
      sql`TO_CHAR(${bills.billDate}, 'Mon YYYY')`
    )
    .orderBy(sql`TO_CHAR(${bills.billDate}, 'YYYY-MM') ASC`);

  return rows;
}

// ─── Top Selling Products ─────────────────────────────────────────────────────

export async function getTopSellingProducts(
  shopId: string,
  limit = 10
): Promise<TopProductRow[]> {
  return (
    db
      .select({
        // Include productId so two products with the same name don't merge
        productId: billItems.productId,
        name: billItems.productName,
        quantity: sql<number>`SUM(${billItems.quantity})::integer`,
        revenue: sql<number>`SUM(${billItems.lineTotalPaise})::integer`,
      })
      .from(billItems)
      .innerJoin(bills, eq(billItems.billId, bills.id))
      .where(eq(bills.shopId, shopId))
      // Group by both productId and productName — prevents name collision merges
      .groupBy(billItems.productId, billItems.productName)
      .orderBy(sql`SUM(${billItems.quantity}) DESC`)
      .limit(limit)
  );
}

// ─── GST Report ───────────────────────────────────────────────────────────────

export async function getGSTReport(
  shopId: string,
  startDate?: Date,
  endDate?: Date
): Promise<GSTReportRow[]> {
  const conditions = [eq(bills.shopId, shopId)];
  if (startDate) conditions.push(gte(bills.billDate, startDate));
  if (endDate) conditions.push(lte(bills.billDate, endDate));

  return (
    db
      .select({
        gstRate: billItems.gstRate,
        // Taxable amount = line total minus the GST portion
        taxableAmount: sql<number>`SUM(${billItems.lineTotalPaise} - ${billItems.gstAmountPaise})::integer`,
        gstAmount: sql<number>`SUM(${billItems.gstAmountPaise})::integer`,
      })
      .from(billItems)
      .innerJoin(bills, eq(billItems.billId, bills.id))
      .where(and(...conditions))
      .groupBy(billItems.gstRate)
      // Ordered by rate so the table always renders 0% → 5% → 12% → 18% → 28%
      .orderBy(billItems.gstRate)
  );
}
