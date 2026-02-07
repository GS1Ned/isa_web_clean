import { getDb } from '../../server/db';

async function check() {
  const db = await getDb();
  if (!db) {
    console.log('Database not available');
    process.exit(1);
  }
  
  try {
    const result = await db.execute('DESCRIBE esrs_datapoints');
    console.log('Current esrs_datapoints columns:');
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

check();
