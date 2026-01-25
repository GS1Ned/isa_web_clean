import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { sql } from "drizzle-orm";

async function countESRSRows() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  const db = drizzle(connection);
  
  const result = await db.execute(sql`SELECT COUNT(*) as count FROM esrs_datapoints`);
  const count = (result[0] as any)[0].count;
  
  console.log(`ESRS Datapoints count: ${count}`);
  
  await connection.end();
  return count;
}

countESRSRows().catch(console.error);
