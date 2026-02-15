import { getDb } from '../../server/db';
import { format as utilFormat } from "node:util";
const cliOut = (...args) => process.stdout.write(`${utilFormat(...args)}\n`);
const cliErr = (...args) => process.stderr.write(`${utilFormat(...args)}\n`);


async function main() {
  const db = await getDb();
  try {
    const result = await db.execute('SHOW TABLES LIKE "error_ledger"');
    cliOut('error_ledger exists:', result[0].length > 0);
    if (result[0].length > 0) {
      const desc = await db.execute('DESCRIBE error_ledger');
      cliOut('Columns:', desc[0].map((r: any) => r.Field).join(', '));
    } else {
      cliOut('❌ Table does not exist - this explains INSERT failures during tests');
    }
  } catch (e: any) {
    cliErr('Error:', e.message);
  }
  process.exit(0);
}

main();
