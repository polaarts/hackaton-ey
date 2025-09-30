import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schema";

type DrizzleClient = ReturnType<typeof drizzle<typeof schema>>;

let pool: Pool | null = null;
let db: DrizzleClient | null = null;

const requiredEnv = ["DATABASE_URL"] as const;

function ensureEnv() {
  const missing = requiredEnv.filter((key) => !process.env[key] || process.env[key] === "");
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}. Check .env.local and deployment settings.`,
    );
  }
}

export function getDb(): DrizzleClient {
  if (db) {
    return db;
  }

  ensureEnv();

  if (!pool) {
    pool = new Pool({
      connectionString: `${process.env.DATABASE_URL}/postgres`,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
    });
  }

  db = drizzle(pool, { schema });
  return db;
}

export async function closeDb(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    db = null;
  }
}


