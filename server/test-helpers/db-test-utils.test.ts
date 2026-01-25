/**
 * Unit tests for database test utilities
 * 
 * Verifies:
 * - Seed helpers create valid records
 * - Transaction rollback prevents cross-test pollution
 * - Overrides work correctly
 */

import { describe, it, expect } from "vitest";
import {
  setupDbTestIsolation,
  seedTestUser,
  seedTestNewsItem,
  seedTestEsrsDatapoint,
  seedTestGs1Attribute,
  type TestDb,
} from "./db-test-utils";
import { users, hubNews, esrsDatapoints, gs1Attributes } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

describe("db-test-utils", () => {
  setupDbTestIsolation();

  describe("seedTestUser", () => {
    it("creates a user with default values", async ({ db }: { db: TestDb }) => {
      const user = await seedTestUser(db);

      expect(user.id).toBeTypeOf("number");
      expect(user.openId).toMatch(/^test-user-/);
      expect(user.name).toBe("Test User");
      expect(user.email).toMatch(/^test-.*@example\.com$/);
      expect(user.loginMethod).toBe("manus");
      expect(user.role).toBe("user");
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
      expect(user.lastSignedIn).toBeDefined();
    });

    it("creates a user with overrides", async ({ db }: { db: TestDb }) => {
      const user = await seedTestUser(db, {
        name: "Jane Doe",
        email: "jane@example.com",
        role: "admin",
      });

      expect(user.id).toBeTypeOf("number");
      expect(user.name).toBe("Jane Doe");
      expect(user.email).toBe("jane@example.com");
      expect(user.role).toBe("admin");
    });

    it("persists user to database", async ({ db }: { db: TestDb }) => {
      const user = await seedTestUser(db);

      const retrieved = await db
        .select()
        .from(users)
        .where(eq(users.id, user.id))
        .limit(1);

      expect(retrieved).toHaveLength(1);
      expect(retrieved[0]?.openId).toBe(user.openId);
    });
  });

  describe("seedTestNewsItem", () => {
    it("creates a news item with default values", async ({ db }: { db: TestDb }) => {
      const newsItem = await seedTestNewsItem(db);

      expect(newsItem.id).toBeTypeOf("number");
      expect(newsItem.title).toMatch(/^Test News Item /);
      expect(newsItem.summary).toBeDefined();
      expect(newsItem.content).toBeDefined();
      expect(newsItem.newsType).toBe("GUIDANCE");
      expect(newsItem.impactLevel).toBe("MEDIUM");
      expect(newsItem.sourceType).toBe("EU_OFFICIAL");
      expect(newsItem.credibilityScore).toBe("0.85");
    });

    it("creates a news item with overrides", async ({ db }: { db: TestDb }) => {
      const newsItem = await seedTestNewsItem(db, {
        title: "CSRD Implementation Update",
        newsType: "NEW_LAW",
        impactLevel: "HIGH",
      });

      expect(newsItem.id).toBeTypeOf("number");
      expect(newsItem.title).toBe("CSRD Implementation Update");
      expect(newsItem.newsType).toBe("NEW_LAW");
      expect(newsItem.impactLevel).toBe("HIGH");
    });

    it("persists news item to database", async ({ db }: { db: TestDb }) => {
      const newsItem = await seedTestNewsItem(db);

      const retrieved = await db
        .select()
        .from(hubNews)
        .where(eq(hubNews.id, newsItem.id))
        .limit(1);

      expect(retrieved).toHaveLength(1);
      expect(retrieved[0]?.title).toBe(newsItem.title);
    });
  });

  describe("seedTestEsrsDatapoint", () => {
    it("creates an ESRS datapoint with default values", async ({ db }: { db: TestDb }) => {
      const datapoint = await seedTestEsrsDatapoint(db);

      expect(datapoint.id).toBeTypeOf("number");
      expect(datapoint.code).toMatch(/^TEST-/);
      expect(datapoint.esrsStandard).toBe("ESRS E1");
      expect(datapoint.name).toMatch(/^Test ESRS Datapoint /);
      expect(datapoint.dataType).toBe("Narrative");
      expect(datapoint.conditional).toBe(0);
      expect(datapoint.voluntary).toBe(0);
    });

    it("creates an ESRS datapoint with overrides", async ({ db }: { db: TestDb }) => {
      const datapoint = await seedTestEsrsDatapoint(db, {
        code: "E1-1_01",
        esrsStandard: "ESRS E2",
        name: "Greenhouse gas emissions",
        conditional: 1,
      });

      expect(datapoint.id).toBeTypeOf("number");
      expect(datapoint.code).toBe("E1-1_01");
      expect(datapoint.esrsStandard).toBe("ESRS E2");
      expect(datapoint.name).toBe("Greenhouse gas emissions");
      expect(datapoint.conditional).toBe(1);
    });

    it("persists ESRS datapoint to database", async ({ db }: { db: TestDb }) => {
      const datapoint = await seedTestEsrsDatapoint(db);

      const retrieved = await db
        .select()
        .from(esrsDatapoints)
        .where(eq(esrsDatapoints.id, datapoint.id))
        .limit(1);

      expect(retrieved).toHaveLength(1);
      expect(retrieved[0]?.code).toBe(datapoint.code);
    });
  });

  describe("seedTestGs1Attribute", () => {
    it("creates a GS1 attribute with default values", async ({ db }: { db: TestDb }) => {
      const attribute = await seedTestGs1Attribute(db);

      expect(attribute.id).toBeTypeOf("number");
      expect(attribute.attributeCode).toMatch(/^test_attr_/);
      expect(attribute.attributeName).toMatch(/^Test Attribute /);
      expect(attribute.sector).toBe("food_hb");
      expect(attribute.datatype).toBe("text");
      expect(attribute.isMandatory).toBe(0);
      expect(attribute.sustainabilityRelated).toBe(1);
    });

    it("creates a GS1 attribute with overrides", async ({ db }: { db: TestDb }) => {
      const attribute = await seedTestGs1Attribute(db, {
        attributeCode: "productName",
        attributeName: "Product Name",
        sector: "healthcare",
        isMandatory: 1,
      });

      expect(attribute.id).toBeTypeOf("number");
      expect(attribute.attributeCode).toBe("productName");
      expect(attribute.attributeName).toBe("Product Name");
      expect(attribute.sector).toBe("healthcare");
      expect(attribute.isMandatory).toBe(1);
    });

    it("persists GS1 attribute to database", async ({ db }: { db: TestDb }) => {
      const attribute = await seedTestGs1Attribute(db);

      const retrieved = await db
        .select()
        .from(gs1Attributes)
        .where(eq(gs1Attributes.id, attribute.id))
        .limit(1);

      expect(retrieved).toHaveLength(1);
      expect(retrieved[0]?.attributeCode).toBe(attribute.attributeCode);
    });
  });

  describe("transaction isolation", () => {
    it("prevents cross-test pollution via rollback", async ({ db }: { db: TestDb }) => {
      // Create a user in this test
      const user1 = await seedTestUser(db, { name: "Isolation Test User 1" });

      // Verify it exists in this transaction
      const retrieved1 = await db
        .select()
        .from(users)
        .where(eq(users.id, user1.id))
        .limit(1);

      expect(retrieved1).toHaveLength(1);
      expect(retrieved1[0]?.name).toBe("Isolation Test User 1");
    });

    it("does not see data from previous test", async ({ db }: { db: TestDb }) => {
      // Create a different user in this test
      const user2 = await seedTestUser(db, { name: "Isolation Test User 2" });

      // Verify only this test's user exists
      const allUsers = await db.select().from(users);

      // Should only see the user created in this test, not the previous test
      const testUsers = allUsers.filter(u => u.name?.includes("Isolation Test User"));
      expect(testUsers).toHaveLength(1);
      expect(testUsers[0]?.name).toBe("Isolation Test User 2");
    });
  });
});
