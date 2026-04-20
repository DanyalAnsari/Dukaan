import * as schema from "./schemas";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const createDb = async () => {
  if (process.env.NODE_ENV === "production") {
    // ✅ Production: Neon serverless HTTP driver
    const { neon } = await import("@neondatabase/serverless");
    const { drizzle } = await import("drizzle-orm/neon-http");

    const sql = neon(process.env.DATABASE_URL!);
    return drizzle(sql, { schema });
  } else {
    // ✅ Development: Standard node-postgres driver (works with local installed PG)
    const { Pool } = await import("pg");
    const { drizzle } = await import("drizzle-orm/node-postgres");

    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    return drizzle(pool, { schema });
  }
};

export const db = await createDb();

export { schema };
