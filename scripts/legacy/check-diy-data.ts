import { getDb } from '../server/db.js';
import { gs1Attributes, attributeRegulationMappings } from '../drizzle/schema.js';
import { eq } from 'drizzle-orm';

async function checkDiyData() {
  const db = await getDb();
  if (!db) {
    console.error('Database not available');
    process.exit(1);
  }

  console.log('Checking DIY/Garden/Pets data...\n');

  // Check total DIY attributes
  const diyAttrs = await db
    .select()
    .from(gs1Attributes)
    .where(eq(gs1Attributes.sector, 'DIY/Garden/Pets'))
    .execute();

  console.log(`Total DIY attributes: ${diyAttrs.length}`);

  // Check packaging-related
  const packagingDiy = diyAttrs.filter((a) => a.isPackagingRelated);
  console.log(`DIY with packaging flag: ${packagingDiy.length}`);

  // Check sustainability-related
  const sustainabilityDiy = diyAttrs.filter((a) => a.isSustainabilityRelated);
  console.log(`DIY with sustainability flag: ${sustainabilityDiy.length}`);

  // Check mappings
  const mappings = await db
    .select()
    .from(attributeRegulationMappings)
    .execute();

  const diyMappings = mappings.filter((m) => {
    const attr = diyAttrs.find((a) => a.id === m.attributeId);
    return attr !== undefined;
  });

  console.log(`DIY attribute mappings: ${diyMappings.length}`);

  // Sample data
  if (diyAttrs.length > 0) {
    console.log('\nSample DIY attribute:');
    console.log(JSON.stringify(diyAttrs[0], null, 2));
  }

  process.exit(0);
}

checkDiyData().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
