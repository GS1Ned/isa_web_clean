import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { regulations } from "../drizzle/schema.ts";
import { like, or } from "drizzle-orm";

const dbUrl = process.env.DATABASE_URL;
const connection = await mysql.createConnection(dbUrl);
const db = drizzle(connection);

const eudrRegs = await db
  .select()
  .from(regulations)
  .where(
    or(
      like(regulations.title, "%EUDR%"),
      like(regulations.title, "%Deforestation%")
    )
  );

console.log("EUDR Regulations found:");
eudrRegs.forEach(reg => {
  console.log(`ID: ${reg.id} | Title: ${reg.title} | CELEX: ${reg.celexId}`);
});

await connection.end();
