import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  category: z.string().default("Uncategorized"),
  sku: z.string().nullable().or(z.literal("")),
  barcode: z.string().nullable().or(z.literal("")),
  hsnCode: z.string().nullable().or(z.literal("")),
  unit: z.string().default("pcs"),
  unitPricePaise: z.coerce.number().min(0, "Price must be positive"),
  mrpPaise: z.coerce.number().min(0).nullable(),
  gstRate: z.coerce.number().min(0).max(100).default(18),
  stockQty: z.coerce.number().min(0, "Stock cannot be negative").default(0),
  reorderLevel: z.coerce.number().min(0).default(10),
});

export type ProductInput = z.input<typeof productSchema>;
export type ProductOutput = z.output<typeof productSchema>;
export type ProductSchema = z.infer<typeof productSchema>;
