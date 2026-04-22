import {
  pgTable,
  pgEnum,
  text,
  timestamp,
  boolean,
  integer,
  uniqueIndex,
  index,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

// ─── Enums ────────────────────────────────────────────────────────────────────
// Drizzle pgEnum → type-safe column + Postgres CHECK constraint in one shot
export const billStatusEnum = pgEnum("bill_status", [
  "paid",
  "credit",
  "partial",
  "draft",
]);
export const paymentMethodEnum = pgEnum("payment_method", [
  "cash",
  "upi",
  "card",
  "bank",
  "credit",
]);

// ─── Shops ────────────────────────────────────────────────────────────────────
export const shops = pgTable(
  "shops",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    address: text("address"),
    phone: text("phone"),
    gstin: text("gstin"),
    pan: text("pan"),
    upiId: text("upi_id"),
    invoicePrefix: text("invoice_prefix").default("INV").notNull(),
    nextInvoiceNumber: integer("next_invoice_number").default(1).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [index("shop_owner_idx").on(t.ownerId)]
);

// ─── Products ─────────────────────────────────────────────────────────────────
export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    shopId: uuid("shop_id")
      .notNull()
      .references(() => shops.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    category: text("category").default("Uncategorized").notNull(),
    sku: text("sku"),
    barcode: text("barcode"),
    hsnCode: text("hsn_code"),
    unit: text("unit").default("pcs").notNull(),
    unitPricePaise: integer("unit_price_paise").notNull(),
    mrpPaise: integer("mrp_paise"),
    gstRate: integer("gst_rate").default(18).notNull(),
    stockQty: integer("stock_qty").default(0).notNull(),
    reorderLevel: integer("reorder_level").default(10).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index("product_shop_idx").on(t.shopId),
    index("product_sku_idx").on(t.sku),
    index("product_barcode_idx").on(t.barcode),
    // Partial index — only index active products for fast lookup
    index("product_active_shop_idx").on(t.shopId, t.isActive),
  ]
);

// ─── Customers ────────────────────────────────────────────────────────────────
export const customers = pgTable(
  "customers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    shopId: uuid("shop_id")
      .notNull()
      .references(() => shops.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    phone: text("phone"),
    email: text("email"),
    address: text("address"),
    outstandingBalancePaise: integer("outstanding_balance_paise")
      .default(0)
      .notNull(),
    creditLimitPaise: integer("credit_limit_paise"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index("customer_shop_idx").on(t.shopId),
    index("customer_phone_idx").on(t.phone),
  ]
);

// ─── Bills ────────────────────────────────────────────────────────────────────
export const bills = pgTable(
  "bills",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    shopId: uuid("shop_id")
      .notNull()
      .references(() => shops.id, { onDelete: "cascade" }),
    // Unique per shop — enforced at DB level, not just app level
    invoiceNumber: text("invoice_number").notNull(),
    customerId: uuid("customer_id").references(() => customers.id, {
      onDelete: "set null",
    }),
    billDate: timestamp("bill_date").defaultNow().notNull(),
    subtotalPaise: integer("subtotal_paise").notNull(),
    discountPaise: integer("discount_paise").default(0).notNull(),
    gstTotalPaise: integer("gst_total_paise").notNull(),
    totalPaise: integer("total_paise").notNull(),
    status: billStatusEnum("status").default("draft").notNull(),
    paymentMethod: paymentMethodEnum("payment_method")
      .default("cash")
      .notNull(),
    amountPaidPaise: integer("amount_paid_paise").default(0).notNull(),
    amountDuePaise: integer("amount_due_paise").default(0).notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    // Composite unique — invoice numbers unique within a shop
    uniqueIndex("bill_shop_invoice_unique_idx").on(t.shopId, t.invoiceNumber),
    index("bill_shop_idx").on(t.shopId),
    index("bill_customer_idx").on(t.customerId),
    index("bill_date_idx").on(t.billDate),
  ]
);

// ─── Bill Items ───────────────────────────────────────────────────────────────
export const billItems = pgTable(
  "bill_items", // snake_case table name for consistency
  {
    id: uuid("id").primaryKey().defaultRandom(),
    billId: uuid("bill_id")
      .notNull()
      .references(() => bills.id, { onDelete: "cascade" }),
    productId: uuid("product_id").references(() => products.id, {
      onDelete: "set null",
    }),
    // Snapshot columns — intentionally denormalised
    productName: text("product_name").notNull(),
    productSku: text("product_sku"),
    unit: text("unit").notNull(),
    quantity: integer("quantity").notNull(),
    unitPricePaise: integer("unit_price_paise").notNull(),
    gstRate: integer("gst_rate").notNull(),
    hsnCode: text("hsn_code"),
    gstAmountPaise: integer("gst_amount_paise").notNull(),
    lineTotalPaise: integer("line_total_paise").notNull(),
  },
  (t) => [
    index("bill_item_bill_idx").on(t.billId),
    index("bill_item_product_idx").on(t.productId),
  ]
);

// ─── Payments ─────────────────────────────────────────────────────────────────
export const payments = pgTable(
  "payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    shopId: uuid("shop_id")
      .notNull()
      .references(() => shops.id, { onDelete: "cascade" }),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "restrict" }),
    billId: uuid("bill_id").references(() => bills.id, {
      onDelete: "set null",
    }),
    amountPaise: integer("amount_paise").notNull(),
    paymentMethod: paymentMethodEnum("payment_method")
      .default("cash")
      .notNull(),
    referenceNumber: text("reference_number"),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("payment_shop_idx").on(t.shopId),
    index("payment_customer_idx").on(t.customerId),
    index("payment_bill_idx").on(t.billId),
  ]
);

// ─── Purchases ────────────────────────────────────────────────────────────────
export const purchases = pgTable(
  "purchases",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    shopId: uuid("shop_id")
      .notNull()
      .references(() => shops.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    purchaseDate: timestamp("purchase_date").defaultNow().notNull(),
    quantity: integer("quantity").notNull(),
    unitCostPaise: integer("unit_cost_paise").notNull(),
    batchNumber: text("batch_number"),
    expiryDate: timestamp("expiry_date"),
    supplierName: text("supplier_name"),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("purchase_shop_idx").on(t.shopId),
    index("purchase_product_idx").on(t.productId),
  ]
);
