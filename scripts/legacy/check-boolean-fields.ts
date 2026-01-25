import { getDb } from '../server/db.js';
import { gs1Attributes } from '../drizzle/schema.js';
import { eq, and } from 'drizzle-orm';

async function checkBooleanFields() {
  const db = await getDb();
  if (!db) {
    console.error('Database not available');
    process.exit(1);
  }

  console.log('Checking boolean field values...\n');

  // Get sample DIY attributes
  const diyAttrs = await db
    .select()
    .from(gs1Attributes)
    .where(eq(gs1Attributes.sector, 'diy_garden_pet'))
    .limit(5);

  console.log('Sample DIY attributes:');
  diyAttrs.forEach((attr, i) => {
    console.log(`\n${i + 1}. ${attr.attributeName}`);
    console.log(`   packagingRelated: ${attr.packagingRelated} (type: ${typeof attr.packagingRelated})`);
    console.log(`   sustainabilityRelated: ${attr.sustainabilityRelated} (type: ${typeof attr.sustainabilityRelated})`);
  });

  // Try querying with boolean filter
  console.log('\n\nQuerying with packagingRelated = true:');
  const packagingAttrs = await db
    .select()
    .from(gs1Attributes)
    .where(
      and(
        eq(gs1Attributes.sector, 'diy_garden_pet'),
        eq(gs1Attributes.packagingRelated, true)
      )
    )
    .limit(5);

  console.log(`Found ${packagingAttrs.length} attributes`);
  if (packagingAttrs.length > 0) {
    console.log('Sample:', packagingAttrs[0].attributeName);
  }

  // Try querying with = 1 (MySQL boolean representation)
  console.log('\n\nQuerying with packagingRelated = 1:');
  const packagingAttrs2 = await db
    .select()
    .from(gs1Attributes)
    .where(
      and(
        eq(gs1Attributes.sector, 'diy_garden_pet'),
        eq(gs1Attributes.packagingRelated, 1 as any)
      )
    )
    .limit(5);

  console.log(`Found ${packagingAttrs2.length} attributes`);

  process.exit(0);
}

checkBooleanFields().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
