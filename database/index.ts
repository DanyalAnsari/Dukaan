import * as schema from "./schemas";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");

const createDb = async () => {
  if (process.env.NODE_ENV === "production") {
    // ✅ Production: Neon WebSocket driver (supports interactive transactions)
    const { Pool, neonConfig } = await import("@neondatabase/serverless");
    const { drizzle } = await import("drizzle-orm/neon-serverless");

    // Node.js usually needs an explicit WS constructor
    if (typeof (globalThis).WebSocket === "undefined") {
      const ws = (await import("ws")).default;
      neonConfig.webSocketConstructor = ws;
    }

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    return drizzle({ client: pool, schema });
  } else {
    // ✅ Dev: node-postgres
    const { Pool } = await import("pg");
    const { drizzle } = await import("drizzle-orm/node-postgres");

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    return drizzle(pool, { schema });
  }
};

export const db = await createDb();
export { schema };
