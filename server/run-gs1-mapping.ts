/**
 * Run GS1 Mapping Algorithm
 * 
 * Generates regulation-to-standard mappings for all regulations in the database.
 * 
 * Run with: npx tsx server/run-gs1-mapping.ts
 */

import { mapAllRegulations } from './gs1-mapping-engine';

async function runMapping() {
  console.log('🔗 Starting GS1 mapping algorithm...\n');
  
  try {
    const results = await mapAllRegulations();
    
    console.log('\n✅ Mapping completed successfully!\n');
    console.log(`📊 Statistics:`);
    console.log(`   - Regulations processed: ${results.length}`);
    console.log(`   - Total mappings generated: ${results.reduce((sum, r) => sum + r.mappingsCount, 0)}`);
    console.log(`   - Average mappings per regulation: ${(results.reduce((sum, r) => sum + r.mappingsCount, 0) / results.length).toFixed(1)}`);
    
    console.log('\n📋 Mappings by regulation:');
    for (const result of results) {
      console.log(`   - Regulation ${result.regulationId}: ${result.mappingsCount} standards mapped`);
    }
    
  } catch (error) {
    console.error('\n❌ Mapping failed:', error);
    throw error;
  }
}

runMapping()
  .then(() => {
    console.log('\n🎉 Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
