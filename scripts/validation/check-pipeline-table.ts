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
    if (result[0] && Array.isArray(result[0]) && result[0].length > 0) {
      cliOut('✅ pipeline_execution_log table EXISTS');
    } else {
      cliOut('❌ pipeline_execution_log table DOES NOT EXIST');
    }
    process.exit(0);
  } catch (err) {
    cliErr('Error:', err);
    process.exit(1);
  }
}

check();
