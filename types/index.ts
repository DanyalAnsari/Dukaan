import { type InferSelectModel } from "drizzle-orm";
import {
  products,
  customers,
  bills,
  shops,
  billItems,
  payments,
  purchases,
} from "@/database/schemas";

// ---------------------------------------------------------------------------
// Drizzle-inferred types (single source of truth)
// ---------------------------------------------------------------------------

export type Product = InferSelectModel<typeof products>;
export type Customer = InferSelectModel<typeof customers>;
export type Bill = InferSelectModel<typeof bills>;
export type BillItem = InferSelectModel<typeof billItems>;
export type Shop = InferSelectModel<typeof shops>;
export type Payment = InferSelectModel<typeof payments>;
export type Purchase = InferSelectModel<typeof purchases>;
export type BillStatus = "paid" | "credit" | "partial" | "draft";
export type PaymentMethod = "cash" | "upi" | "card" | "credit";

export type ActionResult =
  | { success: true }
  | {
      success: false;
      message: string;
      errors?: { field: unknown; message: string }[];
    };
