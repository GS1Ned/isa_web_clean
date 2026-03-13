import { getDb } from '../../server/db';
import { format as utilFormat } from "node:util";
const cliOut = (...args) => process.stdout.write(`${utilFormat(...args)}\n`);
const cliErr = (...args) => process.stderr.write(`${utilFormat(...args)}\n`);


async function check() {
  const db = await getDb();
  if (!db) {
    cliOut('Database not available');
    process.exit(1);
  }
  
  try {
    const result = await db.execute('SHOW TABLES LIKE "pipeline_execution_log"');
    cliOut('Table check result:', JSON.stringify(result, null, 2));
    process.exit(0);
  } catch (err) {
    cliErr('Error:', err);
    process.exit(1);
  }
}

check();
