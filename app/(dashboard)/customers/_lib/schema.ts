import { z } from "zod";

// Schema for form input (strings from form fields)
// This works directly with react-hook-form
export const customerSchema = z.object({
  name: z.string().min(1, "Customer name is required"),
  phone: z
    .string()
    .regex(/^\d{10}$/, "Enter a 10-digit mobile number")
    .nullable()
    .or(z.literal("")),
  email: z.email("Invalid email address").nullable().or(z.literal("")),
  address: z.string().nullable().or(z.literal("")),
  creditLimitPaise: z.coerce.number().optional(),
});

export type CustomerInput = z.input<typeof customerSchema>;
export type CustomerSchema = z.infer<typeof customerSchema>;
