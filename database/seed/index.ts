import { sql, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { createAuthClient } from "better-auth/client";

import * as schema from "../schemas/index.js";
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
} from "./data.js";

// ─────────────────────────────────────────────────────────────────────────────
// Validate env
// ─────────────────────────────────────────────────────────────────────────────

const DATABASE_URL = process.env.DATABASE_URL;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

if (!DATABASE_URL) {
  console.error("❌  DATABASE_URL is not set");
  process.exit(1);
}

// ─────────────────────────────────────────────────────────────────────────────
// Database connection
// ─────────────────────────────────────────────────────────────────────────────

const pool = new Pool({ connectionString: DATABASE_URL });
const db = drizzle(pool, { schema });

// ─────────────────────────────────────────────────────────────────────────────
// Better-auth client
// Uses the running Next.js dev server to create users via the auth API.
// Make sure your dev server is running before seeding.
// ─────────────────────────────────────────────────────────────────────────────

const authClient = createAuthClient({
  baseURL: APP_URL,
});

// ─────────────────────────────────────────────────────────────────────────────
// Seed
// ─────────────────────────────────────────────────────────────────────────────

async function seed() {
  console.log("⏳  Connecting to PostgreSQL…");
  await pool.query("SELECT 1");
  console.log(`✅  Connected to: ${DATABASE_URL!.split("@")[1]}\n`);

  // ── 1. Truncate all tables ────────────────────────────────────────────────

  console.log("🗑   Truncating all tables…");
  await db.execute(sql`
    TRUNCATE TABLE
      "user",
      "session",
      "account",
      "verification",
      "shops",
      "products",
      "customers",
      "bills",
      "billItems",
      "payments",
      "purchases"
    RESTART IDENTITY
    CASCADE
  `);
  console.log("✅  All tables truncated\n");

  // ── 2. Create users via better-auth client ────────────────────────────────

  console.log(`👤  Creating users via better-auth at ${APP_URL}…`);
  console.log(
    "⚠️   Make sure your Next.js dev server is running on the above URL\n"
  );

  const userIdMap: UserIdMap = {};

  for (const def of seedUserDefs) {
    const { data, error } = await authClient.signUp.email({
      name: def.name,
      email: def.email,
      password: def.password,
    });

    if (error || !data?.user?.id) {
      console.error(`❌  Failed to create user ${def.email}:`, error?.message);
      throw new Error(`User creation failed for ${def.email}`);
    }

    userIdMap[def.key] = data.user.id;
    console.log(`   ✓ ${def.email} (${def.key}) → ${data.user.id}`);
  }

  console.log(`\n✅  ${seedUserDefs.length} users created\n`);

  // ── 3. Mark emails as verified ───────────────────────────────────────────

  console.log("🔧  Marking emails as verified…");

  for (const def of seedUserDefs) {
    const userId = userIdMap[def.key];
    if (!userId) continue;

    await db
      .update(schema.user)
      .set({ emailVerified: def.emailVerified })
      .where(eq(schema.user.id, userId));

    console.log(`   ✓ ${def.email} emailVerified → ${def.emailVerified}`);
  }

  console.log("✅  Email verification updated\n");

  // ── 4. Clear sessions created during signup ───────────────────────────────

  console.log("🧹  Clearing seed sessions…");
  await db.delete(schema.session);
  console.log("✅  Sessions cleared\n");

  // ── 5. Shops ──────────────────────────────────────────────────────────────

  console.log("🏪  Inserting shops…");
  const shopsData = seedShops(userIdMap);
  const insertedShops = await db
    .insert(schema.shops)
    .values(shopsData)
    .returning({ id: schema.shops.id });

  const shopIdMap: Record<string, string> = {};
  insertedShops.forEach((shop, idx) => {
    shopIdMap[`shop${idx + 1}`] = shop.id;
  });

  console.log(`✅  ${insertedShops.length} shops inserted\n`);

  // ── 6. Products ───────────────────────────────────────────────────────────

  console.log("📦  Inserting products…");
  const productsData = seedProducts(shopIdMap);
  const insertedProducts = await db
    .insert(schema.products)
    .values(productsData)
    .returning({ id: schema.products.id });

  const productIdMap: Record<string, string> = {};
  insertedProducts.forEach((product, idx) => {
    productIdMap[`product${idx + 1}`] = product.id;
  });

  console.log(`✅  ${insertedProducts.length} products inserted\n`);

  // ── 7. Customers ──────────────────────────────────────────────────────────

  console.log("👥  Inserting customers…");
  const customersData = seedCustomers(shopIdMap);
  const insertedCustomers = await db
    .insert(schema.customers)
    .values(customersData)
    .returning({ id: schema.customers.id });

  const customerIdMap: Record<string, string> = {};
  insertedCustomers.forEach((customer, idx) => {
    customerIdMap[`customer${idx + 1}`] = customer.id;
  });

  console.log(`✅  ${insertedCustomers.length} customers inserted\n`);

  // ── 8. Bills ──────────────────────────────────────────────────────────────

  console.log("🧾  Inserting bills…");
  const billsData = seedBills(shopIdMap, customerIdMap);
  const insertedBills = await db
    .insert(schema.bills)
    .values(billsData)
    .returning({ id: schema.bills.id });

  const billIdMap: Record<string, string> = {};
  insertedBills.forEach((bill, idx) => {
    billIdMap[`bill${idx + 1}`] = bill.id;
  });

  console.log(`✅  ${insertedBills.length} bills inserted\n`);

  // ── 9. Bill Items ─────────────────────────────────────────────────────────

  console.log("📋  Inserting bill items…");
  const billItemsData = seedBillItems(billIdMap, productIdMap);
  await db.insert(schema.billItems).values(billItemsData);
  console.log(`✅  ${billItemsData.length} bill items inserted\n`);

  // ── 10. Payments ──────────────────────────────────────────────────────────

  console.log("💰  Inserting payments…");
  const paymentsData = seedPayments(shopIdMap, customerIdMap, billIdMap);
  await db.insert(schema.payments).values(paymentsData);
  console.log(`✅  ${paymentsData.length} payments inserted\n`);

  // ── 11. Purchases ─────────────────────────────────────────────────────────

  console.log("📥  Inserting purchases…");
  const purchasesData = seedPurchases(shopIdMap, productIdMap);
  await db.insert(schema.purchases).values(purchasesData);
  console.log(`✅  ${purchasesData.length} purchases inserted\n`);

  // ── Summary ───────────────────────────────────────────────────────────────

  const line = "─".repeat(55);

  console.log(`\n🎉  Database seeded successfully!\n`);
  console.log(line);
  console.log("  ENTITY".padEnd(28) + "COUNT");
  console.log(line);
  console.log(`  Users`.padEnd(28) + seedUserDefs.length);
  console.log(`  Shops`.padEnd(28) + shopsData.length);
  console.log(`  Products`.padEnd(28) + productsData.length);
  console.log(`  Customers`.padEnd(28) + customersData.length);
  console.log(`  Bills`.padEnd(28) + billsData.length);
  console.log(`  Bill Items`.padEnd(28) + billItemsData.length);
  console.log(`  Payments`.padEnd(28) + paymentsData.length);
  console.log(`  Purchases`.padEnd(28) + purchasesData.length);
  console.log(line);

  console.log("\n🔑  Test credentials:");
  console.log("  EMAIL".padEnd(33) + "PASSWORD");
  console.log("─".repeat(55));
  for (const c of TEST_CREDENTIALS) {
    console.log(`  ${c.email.padEnd(31)}${c.password}`);
  }

  console.log("\n📎  User IDs:");
  for (const [key, id] of Object.entries(userIdMap)) {
    console.log(`  ${key.padEnd(12)}→  ${id}`);
  }

  console.log("");
}

// ─────────────────────────────────────────────────────────────────────────────
// Run
// ─────────────────────────────────────────────────────────────────────────────

seed()
  .catch((err) => {
    console.error("\n❌  Seed failed:", err?.message ?? err);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
    console.log("🔌  Disconnected from PostgreSQL");
  });
