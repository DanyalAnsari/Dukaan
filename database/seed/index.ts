import "dotenv/config";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "@/database/schemas";
import {
  seedUserDefs,
  seedShops,
  seedProducts,
  seedCustomers,
  seedBills,
  seedBillItems,
  seedPayments,
  seedPurchases,
  TEST_CREDENTIALS,
  type UserIdMap,
} from "./data";
import { auth } from "@/lib/auth";

// ─────────────────────────────────────────────────────────────────────────────
// Database Connection
// ─────────────────────────────────────────────────────────────────────────────

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("❌  DATABASE_URL is not set");
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL });
const db = drizzle(pool, { schema });

// ─────────────────────────────────────────────────────────────────────────────
// Auth Instance for User Creation
// ─────────────────────────────────────────────────────────────────────────────

const seedAuth = auth;

// ─────────────────────────────────────────────────────────────────────────────
// Seed Runner
// ─────────────────────────────────────────────────────────────────────────────

async function seed() {
  console.log("⏳  Connecting to PostgreSQL…");
  await pool.query("SELECT 1");
  console.log("✅  Connected\n");

  // ── 1. Clear all tables ──────────────────────────────────────────────────

  console.log("🗑   Truncating all tables…");
  await db.execute(sql`
    TRUNCATE TABLE
      "user", session, account, verification,
      shops, products, customers, bills, "billItems", payments, purchases
    CASCADE
  `);
  console.log("✅  All tables truncated\n");

  // ── 2. Create Users ──────────────────────────────────────────────────────

  console.log("👤  Creating users via auth.api.signUpEmail…");

  const userIdMap: Record<string, string> = {};

  for (const def of seedUserDefs) {
    const result = await seedAuth.api.signUpEmail({
      body: {
        name: def.name,
        email: def.email,
        password: def.password,
      },
    });

    if (!result?.user?.id) {
      throw new Error(`Failed to create user: ${def.email}`);
    }

    userIdMap[def.key] = result.user.id;
    console.log(`   ✓ ${def.email} (${def.key}) → ${result.user.id}`);
  }

  const users = userIdMap as UserIdMap;
  console.log(`✅  ${seedUserDefs.length} users created\n`);

  // ── 3. Update user emailVerified ─────────────────────────────────────────

  console.log("🔧  Updating user emailVerified status…");
  for (const def of seedUserDefs) {
    await db
      .update(schema.user)
      .set({
        emailVerified: def.emailVerified,
      })
      .where(sql`${schema.user.id} = ${users[def.key]}`);
  }
  console.log("✅  User fields updated\n");

  // ── 4. Clean up seed sessions ────────────────────────────────────────────

  console.log("🧹  Cleaning up seed sessions…");
  await db.delete(schema.session).where(sql`1=1`);
  console.log("✅  Sessions cleared\n");

  // ── 5. Shops ─────────────────────────────────────────────────────────────

  console.log("🏪  Inserting shops…");
  const shopsData = seedShops(users);
  await db.insert(schema.shops).values(shopsData);
  console.log(`✅  ${shopsData.length} shops inserted\n`);

  // Get shop IDs for later use
  const shopRecords = await db.select().from(schema.shops);
  const shopIdMap: Record<string, string> = {};
  shopRecords.forEach((shop, idx) => {
    shopIdMap[`shop${idx + 1}`] = shop.id;
  });

  // ── 6. Products ──────────────────────────────────────────────────────────

  console.log("📦  Inserting products…");
  const productsData = seedProducts(shopIdMap);
  await db.insert(schema.products).values(productsData);
  console.log(`✅  ${productsData.length} products inserted\n`);

  // Get product IDs
  const productRecords = await db.select().from(schema.products);
  const productIdMap: Record<string, string> = {};
  productRecords.forEach((product, idx) => {
    productIdMap[`product${idx + 1}`] = product.id;
  });

  // ── 7. Customers ─────────────────────────────────────────────────────────

  console.log("👥  Inserting customers…");
  const customersData = seedCustomers(shopIdMap);
  await db.insert(schema.customers).values(customersData);
  console.log(`✅  ${customersData.length} customers inserted\n`);

  // Get customer IDs
  const customerRecords = await db.select().from(schema.customers);
  const customerIdMap: Record<string, string> = {};
  customerRecords.forEach((customer, idx) => {
    customerIdMap[`customer${idx + 1}`] = customer.id;
  });

  // ── 8. Bills ─────────────────────────────────────────────────────────────

  console.log("🧾  Inserting bills…");
  const billsData = seedBills(shopIdMap, customerIdMap);
  await db.insert(schema.bills).values(billsData);
  console.log(`✅  ${billsData.length} bills inserted\n`);

  // Get bill IDs
  const billRecords = await db.select().from(schema.bills);
  const billIdMap: Record<string, string> = {};
  billRecords.forEach((bill, idx) => {
    billIdMap[`bill${idx + 1}`] = bill.id;
  });

  // ── 9. Bill Items ────────────────────────────────────────────────────────

  console.log("📋  Inserting bill items…");
  const billItemsData = seedBillItems(billIdMap, productIdMap);
  await db.insert(schema.billItems).values(billItemsData);
  console.log(`✅  ${billItemsData.length} bill items inserted\n`);

  // ── 10. Payments ─────────────────────────────────────────────────────────

  console.log("💰  Inserting payments…");
  const paymentsData = seedPayments(shopIdMap, customerIdMap, billIdMap);
  await db.insert(schema.payments).values(paymentsData);
  console.log(`✅  ${paymentsData.length} payments inserted\n`);

  // ── 11. Purchases ────────────────────────────────────────────────────────

  console.log("📥  Inserting purchases…");
  const purchasesData = seedPurchases(shopIdMap, productIdMap);
  await db.insert(schema.purchases).values(purchasesData);
  console.log(`✅  ${purchasesData.length} purchases inserted\n`);

  // ── Summary ──────────────────────────────────────────────────────────────

  console.log("\n🎉  Database seeded successfully!\n");
  console.log("─── Summary ─────────────────────────────────────────────");
  console.log(`   Users:              ${seedUserDefs.length}`);
  console.log(`   Shops:              ${shopsData.length}`);
  console.log(`   Products:           ${productsData.length}`);
  console.log(`   Customers:          ${customersData.length}`);
  console.log(`   Bills:              ${billsData.length}`);
  console.log(`   Bill Items:         ${billItemsData.length}`);
  console.log(`   Payments:           ${paymentsData.length}`);
  console.log(`   Purchases:          ${purchasesData.length}`);
  console.log("─────────────────────────────────────────────────────────\n");

  console.log("🔑  Test credentials:");
  console.log("   EMAIL                        │ PASSWORD");
  console.log("   ─────────────────────────────┼─────────────────");
  for (const c of TEST_CREDENTIALS) {
    console.log(`   ${c.email.padEnd(29)}│ ${c.password}`);
  }

  console.log("\n📎  User IDs:");
  for (const [key, id] of Object.entries(users)) {
    console.log(`   ${key.padEnd(10)}→ ${id}`);
  }
  console.log("");
}

// ─────────────────────────────────────────────────────────────────────────────
// Run
// ─────────────────────────────────────────────────────────────────────────────

seed()
  .catch((err) => {
    console.error("❌  Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
    console.log("🔌  Disconnected from PostgreSQL");
  });
