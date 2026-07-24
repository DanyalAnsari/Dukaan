// seed/index.ts
import "dotenv/config";
import { eq, sql } from "drizzle-orm";

import * as schema from "../schemas/index.js";
import {
  seedUserDefs,
  seedShops,
  seedProducts,
  seedCustomers,
  seedBills,
  seedBillItems,
  seedMembers,
  seedPayments,
  seedPurchases,
  seedOrganizations,
  seedSubscriptions,
  TEST_CREDENTIALS,
  type UserIdMap,
} from "./data.js";
import { db } from "../index.js";
import { auth } from "@/lib/auth.js";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌  DATABASE_URL is not set");
  process.exit(1);
}

// ─────────────────────────────────────────────────────────────────────────────
// Seed
// ─────────────────────────────────────────────────────────────────────────────

async function seed() {
  console.log("⏳  Connecting to PostgreSQL…");
  console.log(`✅  Connected to: ${DATABASE_URL!.split("@")[1]}\n`);

  // ── 1. Truncate all tables ────────────────────────────────────────────────

  console.log("🗑   Truncating all tables…");
  await db.execute(sql`
    TRUNCATE TABLE
      "user",
      "session",
      "account",
      "verification",
      "organization",
      "member",
      "invitation",
      "subscription",
      "shops",
      "products",
      "customers",
      "bills",
      "bill_items",
      "payments",
      "purchases"
    RESTART IDENTITY
    CASCADE
  `);
  console.log("✅  All tables truncated\n");

  // ── 2. Create users via better-auth admin API ─────────────────────────────
  // Using createUser instead of signUpEmail because:
  //   • sets emailVerified in one call — no second DB pass needed
  //   • skips sending verification emails
  //   • no session side-effect to clean up

  console.log("👤  Creating users via better-auth admin API…\n");

  const userIdMap: UserIdMap = {};

  for (const def of seedUserDefs) {
    try {
      const result = await auth.api.signUpEmail({
        body: {
          name: def.name,
          email: def.email,
          password: def.password,
        },
      });

      if (!result?.user.id) {
        throw new Error(`No user ID returned for ${def.email}`);
      }
      if (def.emailVerified) {
        await db
          .update(schema.user)
          .set({ emailVerified: true })
          .where(eq(schema.user.id, result.user.id));
      }

      userIdMap[def.key] = result.user.id;
      console.log(`   ✓ ${def.email} (${def.key}) → ${result.user.id}`);
    } catch (err: unknown) {
      console.error(
        `❌  Failed to create user ${def.email}:`,
        err instanceof Error ? err.message : err
      );
      throw err;
    }
  }

  console.log(`\n✅  ${seedUserDefs.length} users created\n`);

  // ── 3. Shops ──────────────────────────────────────────────────────────────

  console.log("🏢  Inserting organizations and memberships…");
  const insertedOrganizations = await db
    .insert(schema.organization)
    .values(seedOrganizations)
    .returning({ id: schema.organization.id });
  const organizationIdMap = Object.fromEntries(
    insertedOrganizations.map((organization, index) => [
      `organization${index + 1}`,
      organization.id,
    ])
  );
  const membersData = seedMembers(organizationIdMap, userIdMap);
  await db.insert(schema.member).values(membersData);
  const subscriptionsData = seedSubscriptions(organizationIdMap);
  await db.insert(schema.subscription).values(subscriptionsData);
  console.log(`✅  ${insertedOrganizations.length} organizations, ${membersData.length} members, and ${subscriptionsData.length} subscriptions inserted\n`);

  console.log("🏪  Inserting shops…");
  const shopsData = seedShops(userIdMap).map((shop, index) => ({
    ...shop,
    organizationId: organizationIdMap[`organization${index + 1}`],
    billsThisMonth: 2,
  }));
  const insertedShops = await db
    .insert(schema.shops)
    .values(shopsData)
    .returning({ id: schema.shops.id });

  const shopIdMap: Record<string, string> = {};
  insertedShops.forEach((shop, idx) => {
    shopIdMap[`shop${idx + 1}`] = shop.id;
  });

  console.log(`✅  ${insertedShops.length} shops inserted\n`);

  // ── 4. Products ───────────────────────────────────────────────────────────

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

  // ── 5. Customers ──────────────────────────────────────────────────────────

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

  // ── 6. Bills ──────────────────────────────────────────────────────────────

  console.log("🧾  Inserting bills…");
  const billsData = seedBills(shopIdMap, customerIdMap, userIdMap);
  const insertedBills = await db
    .insert(schema.bills)
    .values(billsData)
    .returning({ id: schema.bills.id });

  const billIdMap: Record<string, string> = {};
  insertedBills.forEach((bill, idx) => {
    billIdMap[`bill${idx + 1}`] = bill.id;
  });

  console.log(`✅  ${insertedBills.length} bills inserted\n`);

  // ── 7. Bill Items ─────────────────────────────────────────────────────────

  console.log("📋  Inserting bill items…");
  const billItemsData = seedBillItems(billIdMap, productIdMap);
  await db.insert(schema.billItems).values(billItemsData);
  console.log(`✅  ${billItemsData.length} bill items inserted\n`);

  // ── 8. Payments ───────────────────────────────────────────────────────────
  // userId is required on the payments table — pass userIdMap through

  console.log("💰  Inserting payments…");
  const paymentsData = seedPayments(
    shopIdMap,
    customerIdMap,
    billIdMap,
    userIdMap
  );
  await db.insert(schema.payments).values(paymentsData);
  console.log(`✅  ${paymentsData.length} payments inserted\n`);

  // ── 9. Purchases ──────────────────────────────────────────────────────────

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
  .finally(() => {
    console.log("🔌  Disconnected from PostgreSQL");
  });
