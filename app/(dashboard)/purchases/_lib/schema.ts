import { z } from "zod";

export const purchaseSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  unitCostPaise: z.coerce.number().min(0, "Cost must be positive"),
  purchaseDate: z.string().default(() => new Date().toISOString()),
  supplierName: z.string().optional(),
  batchNumber: z.string().optional(),
  expiryDate: z.string().optional().nullable(),
  notes: z.string().optional(),
});

export type PurchaseSchema = z.infer<typeof purchaseSchema>;
