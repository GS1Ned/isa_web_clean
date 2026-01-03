import mysql from 'mysql2/promise';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

const connection = await mysql.createConnection(url);
const [rows] = await connection.execute('SELECT COUNT(*) as total FROM esrs_datapoints');
console.log('ESRS datapoints count:', rows[0].total);
await connection.end();
