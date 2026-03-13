import { describe, it, expect } from "vitest";

/**
 * Validates that the Postgres connection factory works correctly
 * through the Supabase Supavisor transaction-mode pooler.
 *
 * The key assertion: multiple sequential queries succeed without
 * "prepared statement does not exist" errors — proving that
 * `prepare: false` is correctly set.
 */
describe("Postgres connection factory (transaction-mode pooler)", () => {
  it("should connect and run queries without prepared statement errors", async () => {
    const pgUrl = process.env.DATABASE_URL_POSTGRES;
    if (!pgUrl) {
      console.warn("DATABASE_URL_POSTGRES not set — skipping pooler test");
      return;
    }

    // Import the factory under test
    const { createPostgresDb } = await import("./db-connection-pg.js");
    const { db, sql } = createPostgresDb(pgUrl);

    try {
      // Run multiple sequential queries — if prepare: false is missing,
      // the second or third query will fail with "prepared statement does not exist"
      // because transaction-mode pooling reassigns backend connections.
      const r1 = await sql`SELECT 1 AS a`;
      expect(r1[0].a).toBe(1);

      const r2 = await sql`SELECT 2 AS b`;
      expect(r2[0].b).toBe(2);

      const r3 = await sql`SELECT current_setting('server_version') AS ver`;
      expect(r3[0].ver).toBeDefined();

      console.log("Postgres version:", r3[0].ver);
    } finally {
      await sql.end({ timeout: 5 });
    }
  });

  it("should handle parameterised queries without prepared statements", async () => {
    const pgUrl = process.env.DATABASE_URL_POSTGRES;
    if (!pgUrl) return;

    const { createPostgresDb } = await import("./db-connection-pg.js");
    const { sql } = createPostgresDb(pgUrl);

    try {
      // Parameterised queries are the ones most likely to trigger
      // prepared statement creation — verify they work in transaction mode.
      const name = "ISA_test";
      const result = await sql`SELECT ${name} AS echo`;
      expect(result[0].echo).toBe("ISA_test");

      const num = 42;
      const result2 = await sql`SELECT ${num}::int AS num`;
      expect(result2[0].num).toBe(42);
    } finally {
      await sql.end({ timeout: 5 });
    }
  });
});
