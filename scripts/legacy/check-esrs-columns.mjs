import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { sql } from 'drizzle-orm';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

const result = await db.execute(sql`DESCRIBE esrs_datapoints`);
console.log('Current esrs_datapoints columns:');
result[0].forEach((row) => {
  console.log(`  - ${row.Field} (${row.Type})`);
});

await connection.end();
