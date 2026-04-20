import { z } from "zod";

export const billSchema = z.object({
  customerId: z.string().nullable(),
  items: z.array(
    z.object({
      productId: z.string(),
      productName: z.string(),
      productSku: z.string().nullable(),
      hsnCode: z.string().nullable(),
      unitPricePaise: z.number().int().min(0).max(1_000_000_000),
      gstRate: z.number().min(0).max(100),
      quantity: z.number().int().min(1).max(1_000_000),
    })
  ),
  paymentMethod: z.enum(["cash", "upi", "card", "credit"]),
  discountPaise: z.number().int().min(0).max(1_000_000_000).default(0),
  amountPaidPaise: z.number().int().min(0).max(1_000_000_000).default(0),
  status: z.enum(["paid", "partial", "credit", "draft"]).default("paid"),
});

export type BillSchema = z.infer<typeof billSchema>;