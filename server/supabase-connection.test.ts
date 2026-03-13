import { describe, it, expect } from "vitest";
import postgres from "postgres";

describe("Supabase Postgres Connection", () => {
  it("should connect to Supabase via pooler and execute SELECT 1", async () => {
    const connectionString = process.env.DATABASE_URL_POSTGRES;
    expect(connectionString).toBeDefined();
    expect(connectionString!.length).toBeGreaterThan(0);
    expect(connectionString).toContain("postgresql://");

    const sql = postgres(connectionString!, {
      max: 1,
      idle_timeout: 5,
      connect_timeout: 15,
      ssl: "require",
    });

    try {
      const result = await sql`SELECT 1 AS connected`;
      expect(result).toHaveLength(1);
      expect(result[0].connected).toBe(1);
    } finally {
      await sql.end({ timeout: 5 });
    }
  });

  it("should report correct Postgres version", async () => {
    const connectionString = process.env.DATABASE_URL_POSTGRES!;
    const sql = postgres(connectionString, {
      max: 1,
      idle_timeout: 5,
      connect_timeout: 15,
      ssl: "require",
    });

    try {
      const result = await sql`SELECT version() AS pg_version`;
      expect(result).toHaveLength(1);
      const version = result[0].pg_version as string;
      expect(version).toContain("PostgreSQL");
      console.log("Postgres version:", version);
    } finally {
      await sql.end({ timeout: 5 });
    }
  });

  it("should be able to create and drop a test table", async () => {
    const connectionString = process.env.DATABASE_URL_POSTGRES!;
    const sql = postgres(connectionString, {
      max: 1,
      idle_timeout: 5,
      connect_timeout: 15,
      ssl: "require",
    });

    try {
      // Create a test table
      await sql`CREATE TABLE IF NOT EXISTS _isa_connection_test (id serial PRIMARY KEY, created_at timestamptz DEFAULT now())`;
      // Insert a row
      await sql`INSERT INTO _isa_connection_test DEFAULT VALUES`;
      // Verify
      const result = await sql`SELECT count(*)::int AS cnt FROM _isa_connection_test`;
      expect(result[0].cnt).toBeGreaterThanOrEqual(1);
      // Clean up
      await sql`DROP TABLE _isa_connection_test`;
    } finally {
      await sql.end({ timeout: 5 });
    }
  });
});
