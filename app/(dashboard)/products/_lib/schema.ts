import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  category: z.string().default("Uncategorized"),
  sku: z.string().optional().default(""),
  barcode: z.string().optional().default(""),
  hsnCode: z.string().optional().default(""),
  unit: z.enum(["pcs", "kg", "g", "ltr", "pkt", "box"]).default("pcs"),
  // UI layer: rupees (float). Server layer converts to paise.
  unitPricePaise: z
    .number({ error: "Enter a valid price" })
    .nonnegative("Price must be ≥ 0"),
  mrpPaise: z
    .number({ error: "Enter a valid MRP" })
    .nonnegative()
    .nullable()
    .default(null),
  gstRate: z
    .union([
      z.literal(0),
      z.literal(5),
      z.literal(12),
      z.literal(18),
      z.literal(28),
    ])
    .default(18),
  stockQty: z.number().int().nonnegative().default(0),
  reorderLevel: z.number().int().nonnegative().default(10),
});

export type ProductInput = z.input<typeof productSchema>;
export type ProductOutput = z.output<typeof productSchema>;
// What the server action actually receives (already in paise)
export type ProductSchema = ProductOutput & {
  unitPricePaise: number;
  mrpPaise: number | null;
};
