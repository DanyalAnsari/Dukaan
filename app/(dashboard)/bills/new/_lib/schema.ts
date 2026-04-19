import { z } from "zod";

export const billSchema = z.object({
  customerId: z.string().nullable(),
  items: z.array(
    z.object({
      productId: z.string(),
      productName: z.string(),
      productSku: z.string().nullable(),
      hsnCode: z.string().nullable(),
      unitPricePaise: z.number(),
      gstRate: z.number(),
      quantity: z.number(),
    })
  ),
  paymentMethod: z.enum(["cash", "upi", "card", "credit"]),
  discountPaise: z.number().default(0),
  amountPaidPaise: z.number().default(0),
  status: z.enum(["paid", "partial", "credit", "draft"]).default("paid"),
});

export type BillSchema = z.infer<typeof billSchema>;
