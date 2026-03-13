/**
 * Knowledge Embeddings Generator
 * 
 * Populates the knowledge_embeddings table with vector embeddings
 * for all regulations, standards, and ESRS datapoints.
 * Uses raw SQL to avoid Drizzle schema mismatch issues.
 * 
 * Usage: node scripts/generate-knowledge-embeddings.mjs
 */
import postgres from 'postgres';
import crypto from 'crypto';

const sql = postgres(process.env.DATABASE_URL_POSTGRES, { ssl: { rejectUnauthorized: false } });

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const EMBEDDING_MODEL = 'text-embedding-3-small';
const BATCH_SIZE = 20;

if (!OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY not set');
  process.exit(1);
}

// ========== Embedding Generation ==========

async function generateEmbeddings(texts) {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: texts,
    }),
  });
  
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI API error ${response.status}: ${err}`);
  }
  
  const data = await response.json();
  return data.data.map(d => d.embedding);
}

// ========== Metadata Helpers ==========

function determineAuthorityLevel(sourceType, regulationType) {
  if (sourceType === 'regulation') {
    if (['CSRD', 'EUDR', 'CSDDD'].includes(regulationType)) return 'directive';
    return 'regulation';
  }
  if (sourceType === 'standard') return 'standard';
  if (sourceType === 'esrs_datapoint') return 'guidance';
  return 'guidance';
}

function determineSemanticLayer(sourceType) {
  if (sourceType === 'regulation') return 'juridisch';
  if (sourceType === 'standard') return 'normatief';
  if (sourceType === 'esrs_datapoint') return 'operationeel';
  return 'operationeel';
}

function determineSourceAuthority(sourceType, regulationType) {
  if (sourceType === 'regulation') return 'European Union';
  if (sourceType === 'standard') return 'GS1';
  if (sourceType === 'esrs_datapoint') return 'EFRAG';
  return 'Unknown';
}

function contentHash(text) {
  return crypto.createHash('sha256').update(text).digest('hex').substring(0, 16);
}

// ========== Document Collection ==========

async function collectRegulations() {
  const rows = await sql`
    SELECT id, title, description, celex_id, regulation_type, source_url, 
           status, effective_date
    FROM regulations
  `;
  
  return rows.map(r => ({
    sourceType: 'regulation',
    sourceId: r.id,
    title: r.title,
    content: [
      `EU Regulation: ${r.title}`,
      r.description || '',
      r.regulation_type ? `Type: ${r.regulation_type}` : '',
      r.celex_id ? `CELEX: ${r.celex_id}` : '',

      r.status ? `Status: ${r.status}` : '',
    ].filter(Boolean).join('\n'),
    url: r.source_url || null,
    authorityLevel: determineAuthorityLevel('regulation', r.regulation_type),
    semanticLayer: 'juridisch',
    sourceAuthority: 'European Union',
    celexId: r.celex_id || null,
    regulationId: r.id,
    regulationType: r.regulation_type,
  }));
}

async function collectStandards() {
  const rows = await sql`
    SELECT id, standard_name, description, standard_code, category, 
           reference_url
    FROM gs1_standards
  `;
  
  return rows.map(s => ({
    sourceType: 'standard',
    sourceId: s.id,
    title: s.standard_name,
    content: [
      `GS1 Standard: ${s.standard_name}`,
      s.description || '',
      s.standard_code ? `Code: ${s.standard_code}` : '',
      s.category ? `Category: ${s.category}` : '',

    ].filter(Boolean).join('\n'),
    url: s.reference_url || null,
    authorityLevel: 'standard',
    semanticLayer: 'normatief',
    sourceAuthority: 'GS1',
    celexId: null,
    regulationId: null,
    regulationType: null,
  }));
}

async function collectEsrsDatapoints() {
  const rows = await sql`
    SELECT id, code, name, esrs_standard, 
           disclosure_requirement, data_type, paragraph
    FROM esrs_datapoints
  `;
  
  return rows.map(e => ({
    sourceType: 'esrs_datapoint',
    sourceId: e.id,
    title: `ESRS ${e.esrs_standard}: ${e.name}`,
    content: [
      `ESRS Datapoint: ${e.name}`,
      e.esrs_standard ? `Standard: ${e.esrs_standard}` : '',
      e.disclosure_requirement ? `Disclosure: ${e.disclosure_requirement}` : '',
      e.code ? `Code: ${e.code}` : '',
      e.data_type ? `Data Type: ${e.data_type}` : '',
      e.paragraph ? `Paragraph: ${e.paragraph}` : '',
    ].filter(Boolean).join('\n'),
    url: null,
    authorityLevel: 'guidance',
    semanticLayer: 'operationeel',
    sourceAuthority: 'EFRAG',
    celexId: null,
    regulationId: null,
    regulationType: null,
  }));
}

async function collectMappings() {
  // Regulation-Standard mappings as searchable documents
  const rows = await sql`
    SELECT rsm.id, rsm.regulation_id, rsm.standard_id, rsm.relevance_score, rsm.rationale,
           r.title as reg_title, r.regulation_type,
           s.standard_name
    FROM regulation_standard_mappings rsm
    JOIN regulations r ON r.id = rsm.regulation_id
    JOIN gs1_standards s ON s.id = rsm.standard_id
  `;
  
  return rows.map(m => ({
    sourceType: 'esrs_gs1_mapping',
    sourceId: m.id,
    title: `Mapping: ${m.reg_title} → ${m.standard_name}`,
    content: [
      `Regulation-Standard Mapping`,
      `Regulation: ${m.reg_title} (${m.regulation_type})`,
      `GS1 Standard: ${m.standard_name}`,
      `Relevance: ${m.relevance_score}%`,
      m.rationale ? `Rationale: ${m.rationale}` : '',
    ].filter(Boolean).join('\n'),
    url: null,
    authorityLevel: 'guidance',
    semanticLayer: 'operationeel',
    sourceAuthority: 'ISA Analysis',
    celexId: null,
    regulationId: m.regulation_id,
    regulationType: m.regulation_type,
  }));
}

// ========== Main Execution ==========

async function main() {
  console.log('=== Knowledge Embeddings Generator ===');
  console.log('');
  
  // Step 1: Collect all documents
  console.log('[1/4] Collecting documents...');
  const regulations = await collectRegulations();
  console.log(`  Regulations: ${regulations.length}`);
  
  const standards = await collectStandards();
  console.log(`  Standards: ${standards.length}`);
  
  const esrsDatapoints = await collectEsrsDatapoints();
  console.log(`  ESRS Datapoints: ${esrsDatapoints.length}`);
  
  const mappings = await collectMappings();
  console.log(`  Mappings: ${mappings.length}`);
  
  const allDocs = [...regulations, ...standards, ...esrsDatapoints, ...mappings];
  console.log(`  Total: ${allDocs.length} documents`);
  console.log('');
  
  // Step 2: Clear existing embeddings
  console.log('[2/4] Clearing existing embeddings...');
  await sql`DELETE FROM knowledge_embeddings`;
  console.log('  Cleared.');
  console.log('');
  
  // Step 3: Generate embeddings in batches
  console.log(`[3/4] Generating embeddings (batch size: ${BATCH_SIZE})...`);
  let processed = 0;
  let errors = 0;
  
  for (let i = 0; i < allDocs.length; i += BATCH_SIZE) {
    const batch = allDocs.slice(i, i + BATCH_SIZE);
    const texts = batch.map(d => d.content.substring(0, 8000));
    
    try {
      const embeddings = await generateEmbeddings(texts);
      
      // Insert batch into knowledge_embeddings
      for (let j = 0; j < batch.length; j++) {
        const doc = batch[j];
        const embedding = embeddings[j];
        const hash = contentHash(doc.content);
        
        await sql`
          INSERT INTO knowledge_embeddings (
            source_type, source_id, title, content, content_hash,
            embedding, embedding_model, url,
            authority_level, semantic_layer, source_authority,
            celex_id, regulation_id, confidence_score,
            created_at, updated_at
          ) VALUES (
            ${doc.sourceType}::embedding_source_type,
            ${doc.sourceId},
            ${doc.title},
            ${doc.content},
            ${hash},
            ${JSON.stringify(embedding)}::jsonb,
            ${EMBEDDING_MODEL},
            ${doc.url},
            ${doc.authorityLevel},
            ${doc.semanticLayer},
            ${doc.sourceAuthority},
            ${doc.celexId},
            ${doc.regulationId},
            ${doc.sourceType === 'regulation' ? 0.95 : doc.sourceType === 'standard' ? 0.90 : 0.85},
            NOW(),
            NOW()
          )
        `;
      }
      
      processed += batch.length;
      console.log(`  Processed ${processed}/${allDocs.length} (${Math.round(processed/allDocs.length*100)}%)`);
      
      // Rate limit
      if (i + BATCH_SIZE < allDocs.length) {
        await new Promise(r => setTimeout(r, 200));
      }
    } catch (err) {
      console.error(`  Error in batch ${i}-${i+batch.length}:`, err.message);
      errors += batch.length;
    }
  }
  
  console.log('');
  console.log(`[4/4] Done!`);
  console.log(`  Processed: ${processed}`);
  console.log(`  Errors: ${errors}`);
  
  // Verify
  const count = await sql`SELECT count(*) as c FROM knowledge_embeddings`;
  console.log(`  Total embeddings in DB: ${count[0].c}`);
  
  const byType = await sql`
    SELECT source_type, count(*) as c 
    FROM knowledge_embeddings 
    GROUP BY source_type 
    ORDER BY c DESC
  `;
  console.log('  By type:');
  byType.forEach(r => console.log(`    ${r.source_type}: ${r.c}`));
  
  await sql.end();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
