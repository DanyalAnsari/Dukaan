import { Product } from "@/types";
import { ProductInput } from "./schema";

export function buildDefaultValues(p?: Product): ProductInput {
  return {
    name: p?.name ?? "",
    category: p?.category ?? "Uncategorized",
    sku: p?.sku ?? "",
    barcode: p?.barcode ?? "",
    hsnCode: p?.hsnCode ?? "",
    unit: (p?.unit as ProductInput["unit"]) ?? "pcs",
    unitPricePaise: p ? p.unitPricePaise / 100 : 0,
    mrpPaise: p?.mrpPaise ? p.mrpPaise / 100 : null,
    gstRate: (p?.gstRate as ProductInput["gstRate"]) ?? 18,
    stockQty: p?.stockQty ?? 0,
    reorderLevel: p?.reorderLevel ?? 10,
  };
}
