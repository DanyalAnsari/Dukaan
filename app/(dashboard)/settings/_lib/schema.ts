import { z } from "zod";

export const shopSettingsSchema = z.object({
  name: z.string().min(1, "Shop name is required"),
  phone: z
    .string()
    .regex(/^\d{10}$/, "Enter a 10-digit mobile number")
    .nullable()
    .or(z.literal("")),
  gstin: z
    .string()
    .length(15, "GSTIN must be exactly 15 characters")
    .nullable()
    .or(z.literal("")),
  address: z.string().nullable().or(z.literal("")),
  invoicePrefix: z.string().min(1, "Invoice prefix is required"),
});

export type ShopSettingsInput = z.input<typeof shopSettingsSchema>;
export type ShopSettingsOutput = z.output<typeof shopSettingsSchema>;
export type ShopSettingsSchema = z.infer<typeof shopSettingsSchema>;
