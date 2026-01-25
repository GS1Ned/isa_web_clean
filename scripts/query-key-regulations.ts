import { getDb } from '../server/db.js';
import { regulations } from '../drizzle/schema.js';
import { or, like } from 'drizzle-orm';

async function main() {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const keyRegulations = await db.select().from(regulations)
    .where(
      or(
        like(regulations.title, '%CSRD%'),
        like(regulations.title, '%EUDR%'),
        like(regulations.title, '%DPP%'),
        like(regulations.title, '%PPWR%'),
        like(regulations.title, '%Deforestation%'),
        like(regulations.title, '%Product Passport%')
      )
    )
    .limit(10);

  console.log(JSON.stringify(keyRegulations.map(r => ({
    id: r.id,
    title: r.title,
    celexId: r.celexId,
    effectiveDate: r.effectiveDate
  })), null, 2));
}

main().catch(console.error);
