import { getDb } from '../../server/db';
import { pipelineExecutionLog } from './drizzle/schema';
import { desc } from 'drizzle-orm';
import { format as utilFormat } from "node:util";
const cliOut = (...args) => process.stdout.write(`${utilFormat(...args)}\n`);
const cliErr = (...args) => process.stderr.write(`${utilFormat(...args)}\n`);


async function check() {
  const db = await getDb();
  if (!db) {
    cliOut('❌ Database not available');
    process.exit(1);
  }
  
  const logs = await db.select().from(pipelineExecutionLog).orderBy(desc(pipelineExecutionLog.startedAt)).limit(1);
  
  if (logs.length === 0) {
    cliOut('❌ No execution logs found in database');
    process.exit(1);
  }
  
  cliOut('✅ Latest execution log found:');
  cliOut(JSON.stringify(logs[0], null, 2));
  process.exit(0);
}

check().catch((err) => {
  cliErr('Error:', err);
  process.exit(1);
});
