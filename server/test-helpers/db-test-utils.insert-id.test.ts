import { describe, expect, it } from "vitest";
import { seedTestNewsItem, seedTestUser, type TestDb } from "./db-test-utils";

function createMockDb(insertResult: unknown): TestDb {
  return {
    insert: () => ({
      values: async () => insertResult,
    }),
  } as unknown as TestDb;
}

describe("db-test-utils insertId extraction", () => {
  it("accepts mysql2 tuple-style insert results", async () => {
    const db = createMockDb([{ insertId: 123 }]);

    const user = await seedTestUser(db, { name: "Tuple Insert User" });

    expect(user.id).toBe(123);
  });

  it("accepts direct insert result objects", async () => {
    const db = createMockDb({ insertId: 456 });

    const newsItem = await seedTestNewsItem(db);

    expect(newsItem.id).toBe(456);
  });

  it("throws when insertId is missing", async () => {
    const db = createMockDb({});

    await expect(seedTestUser(db)).rejects.toThrow(
      "Failed to get insertId from user insert",
    );
  });
});
