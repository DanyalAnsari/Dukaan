import { relations } from "drizzle-orm";
import { account, member, organization, session, user } from "./auth";
import {
  billItems,
  bills,
  customers,
  payments,
  products,
  purchases,
  shops,
  stockAdjustments,
} from "./business";

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  shops: many(shops),
  memberships: many(member),
}));

export const organizationRelations = relations(organization, ({ many }) => ({
  members: many(member),
}));

export const memberRelations = relations(member, ({ one }) => ({
  organization: one(organization, {
    fields: [member.organizationId],
    references: [organization.id],
  }),
  user: one(user, { fields: [member.userId], references: [user.id] }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const shopRelations = relations(shops, ({ one, many }) => ({
  owner: one(user, {
    fields: [shops.ownerId],
    references: [user.id],
  }),
  products: many(products),
  customers: many(customers),
  bills: many(bills),
  payments: many(payments),
  purchases: many(purchases),
  stockAdjustments: many(stockAdjustments),
}));

export const productRelations = relations(products, ({ one, many }) => ({
  shop: one(shops, {
    fields: [products.shopId],
    references: [shops.id],
  }),
  billItems: many(billItems),
  purchases: many(purchases),
  stockAdjustments: many(stockAdjustments),
}));

export const customerRelations = relations(customers, ({ one, many }) => ({
  shop: one(shops, {
    fields: [customers.shopId],
    references: [shops.id],
  }),
  bills: many(bills),
  payments: many(payments),
}));

export const billRelations = relations(bills, ({ one, many }) => ({
  shop: one(shops, {
    fields: [bills.shopId],
    references: [shops.id],
  }),
  customer: one(customers, {
    fields: [bills.customerId],
    references: [customers.id],
  }),
  createdBy: one(user, {
    fields: [bills.createdByUserId],
    references: [user.id],
  }),
  items: many(billItems),
  payments: many(payments),
}));

export const billItemRelations = relations(billItems, ({ one }) => ({
  bill: one(bills, {
    fields: [billItems.billId],
    references: [bills.id],
  }),
  product: one(products, {
    fields: [billItems.productId],
    references: [products.id],
  }),
}));

export const paymentRelations = relations(payments, ({ one }) => ({
  shop: one(shops, {
    fields: [payments.shopId],
    references: [shops.id],
  }),
  customer: one(customers, {
    fields: [payments.customerId],
    references: [customers.id],
  }),
  bill: one(bills, {
    fields: [payments.billId],
    references: [bills.id],
  }),
  recordedBy: one(user, {
    fields: [payments.recordedByUserId],
    references: [user.id],
  }),
}));

export const purchaseRelations = relations(purchases, ({ one }) => ({
  shop: one(shops, {
    fields: [purchases.shopId],
    references: [shops.id],
  }),
  product: one(products, {
    fields: [purchases.productId],
    references: [products.id],
  }),
}));

export const stockAdjustmentRelations = relations(stockAdjustments, ({ one }) => ({
  shop: one(shops, {
    fields: [stockAdjustments.shopId],
    references: [shops.id],
  }),
  product: one(products, {
    fields: [stockAdjustments.productId],
    references: [products.id],
  }),
}));
