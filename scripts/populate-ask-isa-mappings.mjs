/**
 * Populate Ask ISA Knowledge Base with ESRS-GS1 Mappings
 * 
 * This script generates knowledge chunks for the ESRS-GS1 mapping data,
 * enabling Ask ISA to answer questions about compliance mapping.
 */

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: join(__dirname, '../.env') });

// Import database functions
const { getAllEsrsGs1Mappings } = await import('../server/db-esrs-gs1-mapping.ts');
const { storeKnowledgeChunk } = await import('../server/db-knowledge.ts');
const { prepareContentForEmbedding, generateEmbeddingTitle, generateEmbeddingUrl } = await import('../server/embedding.ts');

async function populateMappings() {
  console.log('🔍 Fetching ESRS-GS1 mappings from database...');
  
  const mappings = await getAllEsrsGs1Mappings();
  
  if (!Array.isArray(mappings) || mappings.length === 0) {
    console.log('❌ No mappings found. Please ensure the database is populated.');
    process.exit(1);
  }
  
  console.log(`✅ Found ${mappings.length} ESRS-GS1 mappings`);
  console.log('📝 Generating knowledge chunks...\n');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const mapping of mappings) {
    try {
      // Prepare mapping data with proper field names
      const mappingData = {
        id: mapping.mapping_id,
        mapping_id: mapping.mapping_id,
        esrsStandard: mapping.esrs_standard,
        esrsTopic: mapping.esrs_topic,
        esrsRequirement: mapping.data_point_name,
        gs1Standard: 'GS1 WebVoc', // All mappings reference GS1 WebVoc
        gs1Attribute: mapping.short_name,
        mappingType: 'official',
        confidence: 'high',
        rationale: mapping.definition || mapping.gs1_relevance,
      };
      
      const content = prepareContentForEmbedding('esrs_gs1_mapping', mappingData);
      const title = generateEmbeddingTitle('esrs_gs1_mapping', mappingData);
      const url = generateEmbeddingUrl('esrs_gs1_mapping', mapping.mapping_id);
      
      await storeKnowledgeChunk({
        sourceType: 'esrs_gs1_mapping',
        sourceId: mapping.mapping_id,
        content,
        title,
        url,
      });
      
      successCount++;
      
      if (successCount % 5 === 0) {
        console.log(`  ✓ Processed ${successCount}/${mappings.length} mappings...`);
      }
    } catch (error) {
      console.error(`  ✗ Failed to process mapping ${mapping.mapping_id}:`, error.message);
      errorCount++;
    }
  }
  
  console.log('\n📊 Summary:');
  console.log(`  ✅ Successfully processed: ${successCount}`);
  console.log(`  ❌ Errors: ${errorCount}`);
  console.log(`  📈 Total: ${mappings.length}`);
  
  if (successCount > 0) {
    console.log('\n🎉 Ask ISA knowledge base updated successfully!');
    console.log('   Users can now ask questions like:');
    console.log('   - "How do I report circular economy metrics using GS1 standards?"');
    console.log('   - "Which GS1 attributes help with ESRS E1 climate disclosures?"');
    console.log('   - "What GS1 data supports biodiversity reporting?"');
  }
}

populateMappings()
  .then(() => {
    console.log('\n✨ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
