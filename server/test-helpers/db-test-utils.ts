/**
 * Database Test Utilities
 * 
 * Provides transaction-based test isolation and seed data factories for ISA test suite.
 * 
 * Key features:
 * - Transaction-based isolation: each test runs in a transaction that is rolled back
 * - Seed helpers with realistic defaults matching production schema
 * - Support for partial overrides via spread pattern
 * - Proper handling of Drizzle mysql2 insertId
 */

import { drizzle } from "drizzle-orm/mysql2";
import type { MySql2Database } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import {
  users,
  hubNews,
  esrsDatapoints,
  gs1Attributes,
  type InsertUser,
} from "../../drizzle/schema";
import { beforeEach, afterEach } from "vitest";
import { serverLogger } from '../utils/server-logger';

// Type for database instance with transaction support
export type TestDb = MySql2Database<Record<string, never>>;

// Transaction context for test isolation
let testConnection: mysql.Connection | null = null;
let testDb: TestDb | null = null;

/**
 * Setup database test isolation using transactions.
 * 
 * This function should be called in a `beforeEach` hook to establish a transaction
 * that will be rolled back after each test, ensuring test isolation.
 * 
 * @example
 * ```ts
 * import { describe, it, expect } from 'vitest';
 * import { setupDbTestIsolation, seedTestUser } from './test-helpers/db-test-utils';
 * 
 * describe('User tests', () => {
 *   setupDbTestIsolation();
 * 
 *   it('creates a user', async ({ db }) => {
 *     const user = await seedTestUser(db);
 *     expect(user.id).toBeDefined();
 *   });
 * });
 * ```
 */
export function setupDbTestIsolation() {
  beforeEach(async (context) => {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is required for database tests");
    }

    // Create a dedicated connection for this test
    const url = new URL(process.env.DATABASE_URL);
    testConnection = await mysql.createConnection({
      host: url.hostname,
      port: url.port ? Number(url.port) : 3306,
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname.replace(/^\//, ""),
      ssl: { rejectUnauthorized: false },
    });

    // Start transaction
    await testConnection.beginTransaction();

    // Create Drizzle instance with this connection
    testDb = drizzle(testConnection);

    // Inject db into test context
    (context as any).db = testDb;
  });

  afterEach(async () => {
    if (testConnection) {
      try {
        // Rollback transaction to undo all changes
        await testConnection.rollback();
        await testConnection.end();
      } catch (error) {
        serverLogger.error("[db-test-utils] Failed to rollback transaction:", error);
      } finally {
        testConnection = null;
        testDb = null;
      }
    }
  });
}

/**
 * Create a test database instance.
 * 
 * Note: For transaction-based isolation, use `setupDbTestIsolation()` instead.
 * This function is provided for compatibility with the spec but is not recommended
 * for new tests.
 * 
 * @returns A Drizzle database instance
 */
export async function createTestDb(): Promise<TestDb> {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required for database tests");
  }

  const url = new URL(process.env.DATABASE_URL);
  const connection = await mysql.createConnection({
    host: url.hostname,
    port: url.port ? Number(url.port) : 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ""),
    ssl: { rejectUnauthorized: false },
  });

  return drizzle(connection);
}

/**
 * Cleanup test database by rolling back the transaction.
 * 
 * Note: When using `setupDbTestIsolation()`, cleanup is automatic.
 * This function is provided for manual cleanup scenarios.
 * 
 * @param db - The database instance to cleanup
 */
export async function cleanupTestDb(db: TestDb): Promise<void> {
  // When using transaction-based isolation, cleanup is handled by afterEach
  // This function is a no-op but kept for API compatibility
  return Promise.resolve();
}

/**
 * Seed a test user with realistic defaults.
 * 
 * @param db - The database instance
 * @param overrides - Partial user data to override defaults
 * @returns The created user with generated ID
 * 
 * @example
 * ```ts
 * const user = await seedTestUser(db, {
 *   name: 'Jane Doe',
 *   email: 'jane@example.com',
 *   role: 'admin'
 * });
 * ```
 */
export async function seedTestUser(
  db: TestDb,
  overrides: Partial<InsertUser> = {}
): Promise<InsertUser & { id: number }> {
  const timestamp = new Date().toISOString();
  const randomSuffix = Math.random().toString(36).substring(7);

  const userData: InsertUser = {
    openId: `test-user-${randomSuffix}`,
    name: "Test User",
    email: `test-${randomSuffix}@example.com`,
    loginMethod: "manus",
    role: "user",
    createdAt: timestamp,
    updatedAt: timestamp,
    lastSignedIn: timestamp,
    ...overrides,
  };

  const result = await db.insert(users).values(userData);
  
  // Handle Drizzle mysql2 insertId correctly
  const insertId = (result as any)[0]?.insertId ?? (result as any).insertId;
  
  if (!insertId) {
    throw new Error("Failed to get insertId from user insert");
  }

  return {
    ...userData,
    id: Number(insertId),
  };
}

/**
 * Seed a test news item with realistic defaults.
 * 
 * @param db - The database instance
 * @param overrides - Partial news data to override defaults
 * @returns The created news item with generated ID
 * 
 * @example
 * ```ts
 * const newsItem = await seedTestNewsItem(db, {
 *   title: 'CSRD Implementation Update',
 *   newsType: 'GUIDANCE',
 *   impactLevel: 'HIGH'
 * });
 * ```
 */
export async function seedTestNewsItem(
  db: TestDb,
  overrides: Partial<typeof hubNews.$inferInsert> = {}
): Promise<typeof hubNews.$inferInsert & { id: number }> {
  const timestamp = new Date().toISOString();
  const randomSuffix = Math.random().toString(36).substring(7);

  const newsData = {
    title: `Test News Item ${randomSuffix}`,
    summary: "This is a test news item for automated testing",
    content: "Full content of the test news item with detailed information about regulatory changes.",
    newsType: "GUIDANCE" as const,
    relatedRegulationIds: JSON.stringify([1, 2]),
    sourceUrl: `https://example.com/news/${randomSuffix}`,
    sourceTitle: "Test News Source",
    credibilityScore: "0.85",
    gs1ImpactTags: JSON.stringify(["PRODUCT_MASTER_DATA", "TRACEABILITY"]),
    sectorTags: JSON.stringify(["FOOD", "RETAIL"]),
    relatedStandardIds: JSON.stringify([1]),
    gs1ImpactAnalysis: "This regulation impacts GS1 product identification standards.",
    suggestedActions: JSON.stringify([
      "Review GTIN allocation process",
      "Update product master data"
    ]),
    publishedDate: timestamp,
    createdAt: timestamp,
    updatedAt: timestamp,
    regulationTags: JSON.stringify(["CSRD", "ESRS"]),
    impactLevel: "MEDIUM" as const,
    sourceType: "EU_OFFICIAL" as const,
    retrievedAt: timestamp,
    isAutomated: 1,
    sources: JSON.stringify([{ id: "test-source", name: "Test Source" }]),
    ...overrides,
  };

  const result = await db.insert(hubNews).values(newsData);
  
  // Handle Drizzle mysql2 insertId correctly
  const insertId = (result as any)[0]?.insertId ?? (result as any).insertId;
  
  if (!insertId) {
    throw new Error("Failed to get insertId from hubNews insert");
  }

  return {
    ...newsData,
    id: Number(insertId),
  };
}

/**
 * Seed a test ESRS datapoint with realistic defaults.
 * 
 * @param db - The database instance
 * @param overrides - Partial ESRS datapoint data to override defaults
 * @returns The created ESRS datapoint with generated ID
 * 
 * @example
 * ```ts
 * const datapoint = await seedTestEsrsDatapoint(db, {
 *   code: 'E1-1_01',
 *   esrsStandard: 'ESRS E1',
 *   name: 'Greenhouse gas emissions'
 * });
 * ```
 */
export async function seedTestEsrsDatapoint(
  db: TestDb,
  overrides: Partial<typeof esrsDatapoints.$inferInsert> = {}
): Promise<typeof esrsDatapoints.$inferInsert & { id: number }> {
  const timestamp = new Date().toISOString();
  const randomSuffix = Math.random().toString(36).substring(7);

  const datapointData = {
    code: `TEST-${randomSuffix}`,
    esrsStandard: "ESRS E1",
    disclosureRequirement: "E1-1",
    paragraph: "E1-1.01",
    relatedAr: "AR 1",
    name: `Test ESRS Datapoint ${randomSuffix}`,
    dataType: "Narrative",
    conditional: 0,
    voluntary: 0,
    sfdrMapping: null,
    createdAt: timestamp,
    updatedAt: timestamp,
    ...overrides,
  };

  const result = await db.insert(esrsDatapoints).values(datapointData);
  
  // Handle Drizzle mysql2 insertId correctly
  const insertId = (result as any)[0]?.insertId ?? (result as any).insertId;
  
  if (!insertId) {
    throw new Error("Failed to get insertId from esrsDatapoints insert");
  }

  return {
    ...datapointData,
    id: Number(insertId),
  };
}

/**
 * Seed a test GS1 attribute with realistic defaults.
 * 
 * @param db - The database instance
 * @param overrides - Partial GS1 attribute data to override defaults
 * @returns The created GS1 attribute with generated ID
 * 
 * @example
 * ```ts
 * const attribute = await seedTestGs1Attribute(db, {
 *   attributeCode: 'productName',
 *   attributeName: 'Product Name',
 *   sector: 'food_hb',
 *   isMandatory: 1
 * });
 * ```
 */
export async function seedTestGs1Attribute(
  db: TestDb,
  overrides: Partial<typeof gs1Attributes.$inferInsert> = {}
): Promise<typeof gs1Attributes.$inferInsert & { id: number }> {
  const timestamp = new Date().toISOString();
  const randomSuffix = Math.random().toString(36).substring(7);

  const attributeData = {
    attributeCode: `test_attr_${randomSuffix}`,
    attributeName: `Test Attribute ${randomSuffix}`,
    sector: "food_hb" as const,
    description: "Test attribute for automated testing",
    datatype: "text" as const,
    codeListId: null,
    isMandatory: 0,
    esrsRelevance: "Relevant for ESRS E1 climate disclosures",
    dppRelevance: "Required for Digital Product Passport",
    packagingRelated: 0,
    sustainabilityRelated: 1,
    createdAt: timestamp,
    updatedAt: timestamp,
    ...overrides,
  };

  const result = await db.insert(gs1Attributes).values(attributeData);
  
  // Handle Drizzle mysql2 insertId correctly
  const insertId = (result as any)[0]?.insertId ?? (result as any).insertId;
  
  if (!insertId) {
    throw new Error("Failed to get insertId from gs1Attributes insert");
  }

  return {
    ...attributeData,
    id: Number(insertId),
  };
}
