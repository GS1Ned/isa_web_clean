import { getDb } from './server/db';
import { pipelineExecutionLog } from './drizzle/schema';
import { desc } from 'drizzle-orm';

async function check() {
  const db = await getDb();
  if (!db) {
    console.log('❌ Database not available');
    process.exit(1);
  }
  
  const logs = await db.select().from(pipelineExecutionLog).orderBy(desc(pipelineExecutionLog.startedAt)).limit(1);
  
  if (logs.length === 0) {
    console.log('❌ No execution logs found in database');
    process.exit(1);
  }
  
  console.log('✅ Latest execution log found:');
  console.log(JSON.stringify(logs[0], null, 2));
  process.exit(0);
}

check().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
