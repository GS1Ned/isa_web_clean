import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { regulations } from "../drizzle/schema.ts";
import { or, like } from "drizzle-orm";

const dbUrl = process.env.DATABASE_URL;
const connection = await mysql.createConnection(dbUrl);
const db = drizzle(connection);

console.log("Checking regulation IDs in database...\n");

// Get all regulations
const allRegs = await db.select().from(regulations);

console.log(`Total regulations: ${allRegs.length}\n`);

// Check for suspicious IDs
const suspiciousIds = allRegs.filter(reg => {
  const idStr = String(reg.id);
  return idStr.length > 5 || idStr.startsWith("3300");
});

if (suspiciousIds.length > 0) {
  console.log(
    `❌ Found ${suspiciousIds.length} regulations with suspicious IDs:`
  );
  suspiciousIds.forEach(reg => {
    console.log(
      `  ID: ${reg.id} (${String(reg.id).length} digits) | Type: ${reg.regulationType} | Title: ${reg.title.substring(0, 50)}`
    );
  });
} else {
  console.log("✅ All regulation IDs look normal");
}

// Check specific regulations mentioned in reports
console.log("\n\nChecking specific regulations:");
const specificRegs = await db
  .select()
  .from(regulations)
  .where(
    or(
      like(regulations.title, "%EUDR%"),
      like(regulations.title, "%PPWR%"),
      like(regulations.title, "%DPP%")
    )
  );

specificRegs.forEach(reg => {
  console.log(
    `  ID: ${reg.id} | Type: ${reg.regulationType} | Title: ${reg.title}`
  );
});

await connection.end();
