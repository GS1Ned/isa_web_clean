/**
 * Postgres connection factory for the ISA Postgres runtime path.
 *
 * Used when DB_ENGINE=postgres is set.  Uses the `postgres` (postgres-js)
 * package with drizzle-orm/postgres-js adapter and the drizzle_pg schema
 * so that the PG path shares the same table definitions as the migration set.
 *
 * The MySQL path (server/db-connection.ts) is unmodified and remains the
 * default runtime.
 */

// @ts-nocheck — postgres-js and drizzle-orm/postgres-js types differ from the
// mysql2 types used elsewhere; this module is only loaded when DB_ENGINE=postgres.
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as pgSchema from "../drizzle_pg/schema";

/**
 * Creates a drizzle-orm Postgres instance connected to `databaseUrl`.
 * The connection is a single postgres-js pool appropriate for a long-running
 * server process.  Call `.end()` on the returned `sql` client if needed for
 * graceful shutdown.
 *
 * `prepare: false` is required when connecting through Supabase Supavisor
 * in transaction mode (port 6543).  Transaction-mode pooling reassigns
 * backend connections between queries, so server-side prepared statements
 * created on one connection are invisible to the next — causing
 * "prepared statement does not exist" errors.
 *
 * See: https://orm.drizzle.team/docs/connect-supabase
 * See: https://supabase.com/docs/guides/troubleshooting/disabling-prepared-statements-qL8lEL
 */
export function createPostgresDb(databaseUrl: string) {
  const sql = postgres(databaseUrl, {
    max: 10,
    idle_timeout: 30,
    connect_timeout: 10,
    prepare: false,
    ssl: "require",
  });
  const db = drizzle(sql, { schema: pgSchema });
  return { db, sql };
}
