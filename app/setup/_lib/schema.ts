import z from "zod";

const step1Schema = z.object({
  name: z.string().min(1, "Shop name is required"),
  phone: z
    .string()
    .regex(/^\d{10}$/, "Enter a 10-digit mobile number")
    .or(z.literal("")),
});

const step2Schema = z.object({
  pan: z
    .string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format")
    .or(z.literal("")),
  gstin: z
    .string()
    .length(15, "GSTIN must be exactly 15 characters")
    .or(z.literal("")),
});

const step3Schema = z.object({
  upiId: z
    .string()
    .regex(/^[\w.-]+@[\w.-]+$/, "Invalid UPI ID format")
    .or(z.literal("")),
  invoicePrefix: z.string().min(1, "Prefix is required"),
  address: z.string().optional(),
});

export const setupFormSchema = step1Schema.extend(
  step2Schema.extend(step3Schema.shape).shape
);

export type SetupFormValues = z.infer<typeof setupFormSchema>;
