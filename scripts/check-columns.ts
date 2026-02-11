import { config } from 'dotenv';
config({ override: true });
import mysql from 'mysql2/promise';

async function checkColumns() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  try {
    const [rows] = await connection.query('DESCRIBE dataset_registry');
    console.log('Columns in dataset_registry:');
    rows.forEach(row => console.log(`  - ${row.Field} (${row.Type})`));
  } finally {
    await connection.end();
  }
}

checkColumns();
