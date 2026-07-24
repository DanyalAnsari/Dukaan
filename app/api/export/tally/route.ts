import { NextRequest } from "next/server";
import { and, eq, gte, lte } from "drizzle-orm";

import { db } from "@/database";
import { bills } from "@/database/schemas";
import { requireShopRole } from "@/lib/require-shop";
import { getShopPlan } from "@/lib/plan-limits";

const xml = (value: string) => value.replace(/[<>&'\"]/g, (character) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[character]!);

function range(searchParams: URLSearchParams) {
  const from = new Date(`${searchParams.get("from")}T00:00:00.000Z`);
  const to = new Date(`${searchParams.get("to")}T23:59:59.999Z`);
  if (Number.isNaN(from.valueOf()) || Number.isNaN(to.valueOf()) || from > to) throw new Error("Provide a valid date range.");
  return { from, to };
}

export async function GET(request: NextRequest) {
  try {
    const { shop } = await requireShopRole(["owner", "admin"]);
    if (!(await getShopPlan(shop.organizationId)).limits.reports) return new Response("Upgrade to Pro to export Tally data.", { status: 403 });
    const { from, to } = range(request.nextUrl.searchParams);
    const rows = await db.query.bills.findMany({
      where: and(eq(bills.shopId, shop.id), gte(bills.billDate, from), lte(bills.billDate, to)),
      with: { customer: { columns: { name: true } } },
      orderBy: (table, { asc }) => [asc(table.billDate)],
    });
    const vouchers = rows.map((bill) => `    <TALLYMESSAGE><VOUCHER VCHTYPE="Sales"><DATE>${bill.billDate.toISOString().slice(0, 10).replaceAll("-", "")}</DATE><VOUCHERTYPENAME>Sales</VOUCHERTYPENAME><VOUCHERNUMBER>${xml(bill.invoiceNumber)}</VOUCHERNUMBER><NARRATION>${xml(`${bill.invoiceNumber} - ${bill.customer?.name ?? "Walk-in Customer"}`)}</NARRATION><ALLLEDGERENTRIESLIST><LEDGERNAME>Sales</LEDGERNAME><ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE><AMOUNT>-${(bill.totalPaise / 100).toFixed(2)}</AMOUNT></ALLLEDGERENTRIESLIST></VOUCHER></TALLYMESSAGE>`).join("\n");
    return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<ENVELOPE><BODY><IMPORTDATA><REQUESTDESC><REPORTNAME>Vouchers</REPORTNAME></REQUESTDESC><REQUESTDATA>\n${vouchers}\n</REQUESTDATA></IMPORTDATA></BODY></ENVELOPE>`, { headers: { "Content-Type": "application/xml; charset=utf-8", "Content-Disposition": `attachment; filename="dukaan-tally-${request.nextUrl.searchParams.get("from")}-${request.nextUrl.searchParams.get("to")}.xml"` } });
  } catch (error) {
    return new Response(error instanceof Error ? error.message : "Unable to export Tally data.", { status: 400 });
  }
}
