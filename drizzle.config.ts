import { config } from 'dotenv';
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });
if (!process.env.DATABASE_URL) {
  console.warn(
    "DATABASE_URL is not set. Set it before running drizzle-kit commands (use Supabase connection string).",
  );
}

export default defineConfig({
  schema: "./src/lib/drizzle/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  }
});