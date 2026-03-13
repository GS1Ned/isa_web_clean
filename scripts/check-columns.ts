import { config } from 'dotenv';
import { format as utilFormat } from "node:util";
const cliOut = (...args) => process.stdout.write(`${utilFormat(...args)}\n`);
const cliErr = (...args) => process.stderr.write(`${utilFormat(...args)}\n`);

config({ override: true });
import mysql from 'mysql2/promise';

async function checkColumns() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  try {
    const [rows] = await connection.query('DESCRIBE dataset_registry');
    cliOut('Columns in dataset_registry:');
    rows.forEach(row => cliOut(`  - ${row.Field} (${row.Type})`));
  } finally {
    await connection.end();
  }
}

checkColumns();
