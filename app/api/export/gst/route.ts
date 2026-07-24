import { NextRequest } from "next/server";

import { getGSTReport } from "@/database/data/reports";
import { requireShopRole } from "@/lib/require-shop";
import { getShopPlan } from "@/lib/plan-limits";

function range(searchParams: URLSearchParams) {
  const from = new Date(`${searchParams.get("from")}T00:00:00.000Z`);
  const to = new Date(`${searchParams.get("to")}T23:59:59.999Z`);
  if (Number.isNaN(from.valueOf()) || Number.isNaN(to.valueOf()) || from > to) throw new Error("Provide a valid date range.");
  return { from, to };
}

export async function GET(request: NextRequest) {
  try {
    const { shop } = await requireShopRole(["owner", "admin"]);
    if (!(await getShopPlan(shop.organizationId)).limits.reports) return new Response("Upgrade to Pro to export GST data.", { status: 403 });
    const { from, to } = range(request.nextUrl.searchParams);
    const report = await getGSTReport(shop.id, from, to);
    const lines = ["GST Rate,Taxable Value,CGST,SGST,IGST,Total GST", ...report.map((row) => `${row.gstRate}%,${(row.taxableAmount / 100).toFixed(2)},${(row.gstAmount / 200).toFixed(2)},${(row.gstAmount / 200).toFixed(2)},0.00,${(row.gstAmount / 100).toFixed(2)}`)];
    return new Response(lines.join("\n"), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="dukaan-gst-${request.nextUrl.searchParams.get("from")}-${request.nextUrl.searchParams.get("to")}.csv"` } });
  } catch (error) {
    return new Response(error instanceof Error ? error.message : "Unable to export GST data.", { status: 400 });
  }
}
