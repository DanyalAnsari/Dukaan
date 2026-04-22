import { z } from "zod";

export const purchaseSchema = z.object({
  productId: z.string().uuid("Product is required"),

  quantity: z.coerce
    .number()
    .int("Quantity must be a whole number")
    .min(1, "Quantity must be at least 1"),

  unitCostRupees: z.coerce.number().nonnegative("Cost must be ≥ 0"),

  purchaseDate: z.coerce.date().default(() => new Date()),

  supplierName: z.string().optional(),
  batchNumber: z.string().optional(),
  expiryDate: z.coerce.date().optional().nullable(),
  notes: z.string().optional(),
});

export type PurchaseInput = z.input<typeof purchaseSchema>;
export type PurchaseOutput = z.output<typeof purchaseSchema>;
