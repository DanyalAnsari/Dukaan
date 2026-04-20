import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  index,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

// Shops - each user belongs to a shop
export const shops = pgTable(
  "shops",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(), //shop name
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }), // references auth user
    address: text("address"), //shop address
    phone: text("phone"), //shop's /Owenr phone number
    gstin: text("gstin"), // GSTIN number
    pan: text("pan"), // PAN number
    upiId: text("upi_id"), // UPI ID for payments
    invoicePrefix: text("invoice_prefix").default("INV"),
    nextInvoiceNumber: integer("next_invoice_number").default(1), //for fast lookup while creating new invoice
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("shop_ownerId_idx").on(table.ownerId)]
);

// Products
export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    shopId: uuid("shop_id")
      .notNull()
      .references(() => shops.id, { onDelete: "cascade" }),
    name: text("name").notNull(), //product name
    category: text("category").default("Uncategorized"), //product category for grouping same kind of product
    sku: text("sku"), //product internal code set by owner
    barcode: text("barcode"), //product internal code set by owner
    hsnCode: text("hsn_code"),
    unit: text("unit").default("pcs"), // pcs, kg, liter, etc.
    unitPricePaise: integer("unit_price_paise").notNull(), // price per unit in paise
    mrpPaise: integer("mrp_paise"), // MRP in paise
    gstRate: integer("gst_rate").default(18), // 0, 5, 12, 18, 28
    stockQty: integer("stock_qty").default(0),
    reorderLevel: integer("reorder_level").default(10), //notify when low stock needs re ordering
    isActive: boolean("is_active").default(true).notNull(), // soft delete
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("product_shopId_idx").on(table.shopId),
    index("product_sku_idx").on(table.sku),
    index("product_barcode_idx").on(table.barcode),
  ]
);

// Customers
export const customers = pgTable(
  "customers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    shopId: uuid("shop_id")
      .notNull()
      .references(() => shops.id, { onDelete: "cascade" }),
    name: text("name").notNull(), // customer name
    phone: text("phone"), // customer phone number
    email: text("email"), // customer email address
    address: text("address"), // customer address
    outstandingBalancePaise: integer("outstanding_balance_paise").default(0), // total outstanding balance
    creditLimitPaise: integer("credit_limit_paise"), // optional limit
    isActive: boolean("is_active").default(true).notNull(), // soft delete
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("customer_shopId_idx").on(table.shopId),
    index("customer_phone_idx").on(table.phone),
  ]
);

// Bills
export const bills = pgTable(
  "bills",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    shopId: uuid("shop_id")
      .notNull()
      .references(() => shops.id, { onDelete: "cascade" }),
    invoiceNumber: text("invoice_number").notNull(), // unique invoice number for shop can be created by referencing shop.nextinvoicenumber + invoiceprefix
    customerId: uuid("customer_id").references(() => customers.id),
    billDate: timestamp("bill_date").defaultNow().notNull(), // date of the bill
    subtotalPaise: integer("subtotal_paise").notNull(), // sum of all bill items before discount and gst
    discountPaise: integer("discount_paise").default(0), // discount amount in paise
    gstTotalPaise: integer("gst_total_paise").notNull(), // total gst amount in paise
    totalPaise: integer("total_paise").notNull(), // total amount after discount and gst
    status: text("status").default("paid"), // paid, credit, partial
    paymentMethod: text("payment_method").default("cash"), // cash, upi, card, credit
    amountPaidPaise: integer("amount_paid_paise").default(0), //paid amount in paise
    amountDuePaise: integer("amount_due_paise").default(0), //amount due in paise
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("bill_shopId_idx").on(table.shopId),
    index("bill_invoiceNumber_idx").on(table.invoiceNumber),
    index("bill_customerId_idx").on(table.customerId),
    index("bill_billDate_idx").on(table.billDate),
  ]
);

// Bill Items - snapshots product info at time of sale
export const billItems = pgTable(
  "billItems",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    billId: uuid("bill_id")
      .notNull()
      .references(() => bills.id, { onDelete: "cascade" }),
    productId: uuid("product_id").references(() => products.id),
    productName: text("product_name").notNull(), // snapshot
    productSku: text("product_sku"), // snapshot
    unit: text("unit").notNull(),
    quantity: integer("quantity").notNull(),
    unitPricePaise: integer("unit_price_paise").notNull(), // snapshot
    gstRate: integer("gst_rate").notNull(), // snapshot
    hsnCode: text("hsn_code"), // snapshot
    gstAmountPaise: integer("gst_amount_paise").notNull(), // gst amount in paise
    lineTotalPaise: integer("line_total_paise").notNull(), // total amount of this bill item in paise (price + gst)
  },
  (table) => [
    index("billItem_billId_idx").on(table.billId),
    index("billItem_productId_idx").on(table.productId),
  ]
);

// Payments
export const payments = pgTable(
  "payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    shopId: uuid("shop_id")
      .notNull()
      .references(() => shops.id, { onDelete: "cascade" }), //shop id
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customers.id), //customer id
    billId: uuid("bill_id").references(() => bills.id), // optional - can be advance payment
    amountPaise: integer("amount_paise").notNull(), //paid amount in paise
    paymentMethod: text("payment_method").default("cash"), // cash, card, upi, bank
    referenceNumber: text("reference_number"), //payment reference number for card, upi, bank
    notes: text("notes"), //additional notes for payment
    createdAt: timestamp("created_at").defaultNow().notNull(), //timestamp of payment
  },
  (table) => [
    index("payment_shopId_idx").on(table.shopId),
    index("payment_customerId_idx").on(table.customerId),
    index("payment_billId_idx").on(table.billId),
  ]
);

// Purchases (inventory restocking)
export const purchases = pgTable(
  "purchases",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    shopId: uuid("shop_id")
      .notNull()
      .references(() => shops.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id),
    purchaseDate: timestamp("purchase_date").defaultNow().notNull(),
    quantity: integer("quantity").notNull(),
    unitCostPaise: integer("unit_cost_paise").notNull(),
    batchNumber: text("batch_number"),
    expiryDate: timestamp("expiry_date"),
    supplierName: text("supplier_name"),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("purchase_shopId_idx").on(table.shopId),
    index("purchase_productId_idx").on(table.productId),
  ]
);
