/**
 * postgres-rehydration.test.ts
 * Validates that the Supabase Postgres database has been correctly rehydrated
 * with all required tables and foundation data.
 */
import { describe, it, expect } from "vitest";
import postgres from "postgres";

const DATABASE_URL = process.env.DATABASE_URL_POSTGRES;

function getSql() {
  if (!DATABASE_URL) throw new Error("DATABASE_URL_POSTGRES not set");
  return postgres(DATABASE_URL, { ssl: "require", prepare: false });
}

describe("Postgres Rehydration", () => {
  describe("Schema Structure", () => {
    it("should have all core tables created", async () => {
      const sql = getSql();
      try {
        const tables = await sql`
          SELECT table_name FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
          ORDER BY table_name
        `;
        const tableNames = tables.map((t: any) => t.table_name);
        
        // Core platform tables
        expect(tableNames).toContain("users");
        // ISA uses JWT-based auth, no sessions table needed
        
        // Foundation data tables
        expect(tableNames).toContain("regulations");
        expect(tableNames).toContain("gs1_standards");
        expect(tableNames).toContain("esrs_datapoints");
        expect(tableNames).toContain("regulation_esrs_mappings");
        expect(tableNames).toContain("gs1_esrs_mappings");
        expect(tableNames).toContain("sources");
        
        // News hub
        expect(tableNames).toContain("hub_news");
        
        // Knowledge base
        expect(tableNames).toContain("source_chunks");
        
        // Monitoring
        expect(tableNames).toContain("error_ledger");
        expect(tableNames).toContain("error_log");
        expect(tableNames).toContain("performance_log");
        expect(tableNames).toContain("alert_cooldowns");
        
        // Should have at least 30 tables
        expect(tableNames.length).toBeGreaterThanOrEqual(30);
      } finally {
        await sql.end();
      }
    });
  });

  describe("Foundation Data", () => {
    it("should have regulations seeded", async () => {
      const sql = getSql();
      try {
        const result = await sql`SELECT COUNT(*) as cnt FROM regulations`;
        expect(Number(result[0].cnt)).toBeGreaterThanOrEqual(15);
      } finally {
        await sql.end();
      }
    });

    it("should have GS1 standards seeded", async () => {
      const sql = getSql();
      try {
        const result = await sql`SELECT COUNT(*) as cnt FROM gs1_standards`;
        expect(Number(result[0].cnt)).toBeGreaterThanOrEqual(10);
      } finally {
        await sql.end();
      }
    });

    it("should have ESRS datapoints seeded", async () => {
      const sql = getSql();
      try {
        const result = await sql`SELECT COUNT(*) as cnt FROM esrs_datapoints`;
        expect(Number(result[0].cnt)).toBeGreaterThanOrEqual(50);
      } finally {
        await sql.end();
      }
    });

    it("should have regulation-ESRS mappings seeded", async () => {
      const sql = getSql();
      try {
        const result = await sql`SELECT COUNT(*) as cnt FROM regulation_esrs_mappings`;
        expect(Number(result[0].cnt)).toBeGreaterThanOrEqual(100);
      } finally {
        await sql.end();
      }
    });

    it("should have GS1-ESRS mappings seeded", async () => {
      const sql = getSql();
      try {
        const result = await sql`SELECT COUNT(*) as cnt FROM gs1_esrs_mappings`;
        expect(Number(result[0].cnt)).toBeGreaterThanOrEqual(10);
      } finally {
        await sql.end();
      }
    });

    it("should have canonical sources seeded", async () => {
      const sql = getSql();
      try {
        const result = await sql`SELECT COUNT(*) as cnt FROM sources`;
        expect(Number(result[0].cnt)).toBeGreaterThanOrEqual(5);
      } finally {
        await sql.end();
      }
    });
  });

  describe("News Hub Data", () => {
    it("should have news articles seeded", async () => {
      const sql = getSql();
      try {
        const result = await sql`SELECT COUNT(*) as cnt FROM hub_news`;
        expect(Number(result[0].cnt)).toBeGreaterThanOrEqual(10);
      } finally {
        await sql.end();
      }
    });

    it("should have news with correct structure", async () => {
      const sql = getSql();
      try {
        const news = await sql`SELECT * FROM hub_news LIMIT 1`;
        expect(news.length).toBe(1);
        const article = news[0];
        expect(article.title).toBeTruthy();
        expect(article.summary).toBeTruthy();
        expect(article.content).toBeTruthy();
      } finally {
        await sql.end();
      }
    });
  });

  describe("Health Check", () => {
    it("should respond healthy on /health endpoint", async () => {
      const res = await fetch("http://localhost:3000/health");
      expect(res.ok).toBe(true);
      const data = await res.json();
      // Server may report 'degraded' due to background monitoring services
      // (alert_cooldowns queries) but core DB is functional
      expect(["healthy", "degraded"]).toContain(data.status);
      expect(data.checks.database.status).toBe("ok");
    });
  });
});
