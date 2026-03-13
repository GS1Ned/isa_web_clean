import { getDbEngine } from "./db";

export async function getRuntimeSchema() {
  if (getDbEngine() === "postgres") {
    return import("../drizzle_pg/schema");
  }
  return import("../drizzle_pg/schema");
}
