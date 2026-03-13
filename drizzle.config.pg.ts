import { defineConfig } from "drizzle-kit";

const connectionString = process.env.DATABASE_URL_POSTGRES ?? process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL_POSTGRES or DATABASE_URL is required to run postgres drizzle commands");
}

export default defineConfig({
  schema: "./drizzle_pg/schema.ts",
  out: "./drizzle_pg",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString,
  },
});
