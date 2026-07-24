import {
  products,
  customers,
  bills,
  shops,
  billItems,
  payments,
  purchases,
  member,
} from "@/database/schemas";

// ---------------------------------------------------------------------------
// Drizzle-inferred types (single source of truth)
// ---------------------------------------------------------------------------

export type Product = typeof products.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type Bill = typeof bills.$inferSelect;
export type BillItem = typeof billItems.$inferSelect;
export type Shop = typeof shops.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type Purchase = typeof purchases.$inferSelect;
export type Member = typeof member.$inferSelect;
export type BillStatus = "paid" | "credit" | "partial" | "draft";
export type PaymentMethod = "cash" | "upi" | "card" | "credit";

export type ActionResult =
  | { success: true }
  | {
      success: false;
      message: string;
      errors?: { field: unknown; message: string }[];
    };
