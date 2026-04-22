import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().min(1, "Customer name is required"),

  phone: z
    .string()
    .regex(/^\d{10}$/, "Enter a 10-digit mobile number")
    .or(z.literal(""))
    .nullable()
    .optional()
    .transform((v) => v || null),

  email: z
    .email("Invalid email address")
    .or(z.literal(""))
    .nullable()
    .optional()
    .transform((v) => v || null),

  address: z
    .string()
    .nullable()
    .optional()
    .transform((v) => v || null),

  // User enters rupees in the UI; actions multiply × 100 → paise
  creditLimitRupees: z.coerce.number().nonnegative().optional().default(0),
});

export type CustomerInput = z.input<typeof customerSchema>;
export type CustomerOutput = z.output<typeof customerSchema>;
