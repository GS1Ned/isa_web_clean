import { getDb } from '../../server/db';

async function check() {
  const db = await getDb();
  if (!db) {
    console.log('Database not available');
    process.exit(1);
  }
  
  try {
    const result = await db.execute('SHOW TABLES LIKE "pipeline_execution_log"');
    if (result[0] && Array.isArray(result[0]) && result[0].length > 0) {
      console.log('✅ pipeline_execution_log table EXISTS');
    } else {
      console.log('❌ pipeline_execution_log table DOES NOT EXIST');
    }
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

check();
