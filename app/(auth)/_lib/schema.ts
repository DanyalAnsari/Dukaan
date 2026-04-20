import * as z from "zod";

export const loginSchema = z.object({
  email: z
    .email("Invalid email address")
    .max(255, "Email must not exceed 255 characters"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type SignupSchema = z.infer<typeof registerSchema>;
export type LoginSchema = z.infer<typeof loginSchema>;
