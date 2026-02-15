/**
 * Database Health Guard Test
 * 
 * This test MUST run before any database-dependent tests.
 * It validates that:
 * 1. DATABASE_URL is configured
 * 2. SSL configuration is correct
 * 3. Database connection succeeds
 * 
 * If this test fails, all database tests should be skipped.
 */

import { describe, it, expect } from "vitest";
import { buildMysqlConfig, createMysqlConnection } from "./db-connection";

describe("Database Health Guard", () => {
  it("should have DATABASE_URL configured", () => {
    expect(process.env.DATABASE_URL).toBeDefined();
    expect(process.env.DATABASE_URL).not.toBe("");
  });

  it("should parse SSL configuration correctly", () => {
    const config = buildMysqlConfig(process.env.DATABASE_URL!);
    
    // SSL should be configured for TiDB Cloud
    expect(config.ssl).toBeDefined();
  });

  it("should connect to database with SSL", async () => {
    let connection;
    try {
      connection = await createMysqlConnection(process.env.DATABASE_URL!);
      await connection.ping();
    } catch (error) {
      const err = error as Error;
      
      if (err.message.includes("insecure transport")) {
        throw new Error(
          "SSL configuration error: Database requires secure connection. " +
          "Check that DATABASE_URL includes ssl parameter or sslmode=require"
        );
      }
      
      throw error;
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  });

  it("should execute a simple query", async () => {
    const connection = await createMysqlConnection(process.env.DATABASE_URL!);
    
    try {
      const [rows] = await connection.query<any[]>("SELECT 1 as test");
      expect(rows).toHaveLength(1);
      expect(rows[0].test).toBe(1);
    } finally {
      await connection.end();
    }
  });
});
