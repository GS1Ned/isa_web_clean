/**
 * Expand Knowledge Embeddings to 500+
 * Adds embeddings for: GS1 Web Vocabulary, GPC Classification, ESRS-Standard Mappings,
 * Safety Alerts, Companies, Products, Hub News, Identifier Crosswalks
 */
import postgres from 'postgres';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const DATABASE_URL = process.env.DATABASE_URL_POSTGRES;

if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not set');
if (!DATABASE_URL) throw new Error('DATABASE_URL_POSTGRES not set');

const sql = postgres(DATABASE_URL, { ssl: { rejectUnauthorized: false } });

const BATCH_SIZE = 20; // OpenAI embedding batch size
const EMBED_MODEL = 'text-embedding-3-small';
const EMBED_DIM = 1536;

let totalGenerated = 0;
let totalSkipped = 0;

async function generateEmbeddings(texts) {
  const resp = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model: EMBED_MODEL, input: texts }),
  });
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`OpenAI API error ${resp.status}: ${err}`);
  }
  const data = await resp.json();
  return data.data.map(d => d.embedding);
}

async function insertEmbedding(record) {
  const vecStr = `[${record.embedding.join(',')}]`;
  // Generate content_hash from content
  const { createHash } = await import('crypto');
  const contentHash = createHash('sha256').update(record.content).digest('hex');
  await sql`
    INSERT INTO knowledge_embeddings (source_type, source_id, source_authority, title, content, content_hash, embedding, created_at)
    VALUES (${record.source_type}, ${record.source_id}, ${record.source_authority}, ${record.title}, ${record.content}, ${contentHash}, ${vecStr}::vector, NOW())
  `;
}

async function checkExisting(sourceType) {
  const result = await sql`SELECT count(*) as cnt FROM knowledge_embeddings WHERE source_type = ${sourceType}`;
  return parseInt(result[0].cnt);
}

async function processBatch(records, sourceType) {
  const existing = await checkExisting(sourceType);
  if (existing > 0) {
    console.log(`  ⏭ ${sourceType}: ${existing} already exist, skipping`);
    totalSkipped += existing;
    return;
  }

  console.log(`  📝 ${sourceType}: generating ${records.length} embeddings...`);
  
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    const texts = batch.map(r => r.content);
    
    try {
      const embeddings = await generateEmbeddings(texts);
      
      for (let j = 0; j < batch.length; j++) {
        batch[j].embedding = embeddings[j];
        await insertEmbedding(batch[j]);
      }
      
      totalGenerated += batch.length;
      console.log(`    ✅ Batch ${Math.floor(i/BATCH_SIZE)+1}/${Math.ceil(records.length/BATCH_SIZE)}: ${batch.length} embeddings stored (total: ${totalGenerated})`);
    } catch (err) {
      console.error(`    ❌ Batch error: ${err.message}`);
    }
    
    // Rate limit: small delay between batches
    if (i + BATCH_SIZE < records.length) {
      await new Promise(r => setTimeout(r, 500));
    }
  }
}

// === SOURCE 1: GS1 Web Vocabulary ===
async function embedGS1WebVocabulary() {
  console.log('\n🔤 GS1 Web Vocabulary');
  const rows = await sql`SELECT id, uri, label, domain, definition, term_type, range_type, comment FROM gs1_web_vocabulary`;
  
  const records = rows.map(r => ({
    source_type: 'gs1_vocabulary',
    source_id: String(r.id),
    source_authority: 'GS1 Global',
    title: `GS1 Web Vocabulary: ${r.label}`,
    content: [
      `GS1 Web Vocabulary Term: ${r.label}`,
      r.definition ? `Definition: ${r.definition}` : null,
      r.domain ? `Domain: ${r.domain}` : null,
      r.term_type ? `Term Type: ${r.term_type}` : null,
      r.range_type ? `Range Type: ${r.range_type}` : null,
      r.comment ? `Comment: ${r.comment}` : null,
      r.uri ? `URI: ${r.uri}` : null,
    ].filter(Boolean).join('. '),
  }));
  
  await processBatch(records, 'gs1_vocabulary');
}

// === SOURCE 2: GPC Classification ===
async function embedGPCClassification() {
  console.log('\n📦 GPC Classification');
  const rows = await sql`SELECT id, gpc_code, level, title_en, definition, parent_code, includes_text, excludes_text, gs1_sector FROM gpc_classification`;
  
  const records = rows.map(r => ({
    source_type: 'gpc_classification',
    source_id: String(r.id),
    source_authority: 'GS1 Global',
    title: `GPC ${r.level}: ${r.title_en} (${r.gpc_code})`,
    content: [
      `GS1 Global Product Classification (GPC) ${r.level}: ${r.title_en}`,
      `Code: ${r.gpc_code}`,
      r.definition ? `Definition: ${r.definition}` : null,
      r.parent_code ? `Parent Code: ${r.parent_code}` : null,
      r.includes_text ? `Includes: ${r.includes_text}` : null,
      r.excludes_text ? `Excludes: ${r.excludes_text}` : null,
      r.gs1_sector ? `GS1 Sector: ${r.gs1_sector}` : null,
    ].filter(Boolean).join('. '),
  }));
  
  await processBatch(records, 'gpc_classification');
}

// === SOURCE 3: ESRS-Standard Mappings ===
async function embedESRSStandardMappings() {
  console.log('\n🔗 ESRS-Standard Mappings');
  const rows = await sql`
    SELECT m.id, m.mapping_type, m.confidence, m.rationale, m.review_status,
           e.disclosure_requirement, e.code as dp_id, e.name as esrs_name,
           s.standard_code, s.standard_name as std_name
    FROM esrs_standard_mappings m
    LEFT JOIN esrs_datapoints e ON m.esrs_datapoint_id = e.id
    LEFT JOIN gs1_standards s ON m.standard_id = s.id
  `;
  
  const records = rows.map(r => ({
    source_type: 'esrs_standard_mapping',
    source_id: String(r.id),
    source_authority: 'ISA Platform',
    title: `ESRS-GS1 Mapping: ${r.esrs_name || r.dp_id || 'Unknown'} → ${r.std_name || r.standard_code || 'Unknown'}`,
    content: [
      `ESRS-GS1 Standard Mapping`,
      r.esrs_name ? `ESRS Datapoint: ${r.esrs_name}` : null,
      r.dp_id ? `Datapoint ID: ${r.dp_id}` : null,
      r.disclosure_requirement ? `Disclosure Requirement: ${r.disclosure_requirement}` : null,
      r.std_name ? `GS1 Standard: ${r.std_name}` : null,
      r.standard_code ? `Standard Code: ${r.standard_code}` : null,
      r.mapping_type ? `Mapping Type: ${r.mapping_type}` : null,
      r.confidence ? `Confidence: ${r.confidence}` : null,
      r.rationale ? `Rationale: ${r.rationale}` : null,
    ].filter(Boolean).join('. '),
  }));
  
  await processBatch(records, 'esrs_standard_mapping');
}

// === SOURCE 4: Safety Alerts ===
async function embedSafetyAlerts() {
  console.log('\n⚠️ Safety Alerts');
  const rows = await sql`SELECT id, alert_id, alert_type, product_category, product_description, brand, risk_type, risk_level, notifying_country, measures_taken, date_published FROM safety_alerts`;
  
  const records = rows.map(r => ({
    source_type: 'safety_alert',
    source_id: String(r.id),
    source_authority: 'EU Safety Gate',
    title: `Safety Alert ${r.alert_id}: ${r.product_description}`,
    content: [
      `EU Safety Gate Alert: ${r.alert_id}`,
      `Product: ${r.product_description}`,
      r.product_category ? `Category: ${r.product_category}` : null,
      r.brand ? `Brand: ${r.brand}` : null,
      r.risk_type ? `Risk Type: ${r.risk_type}` : null,
      r.risk_level ? `Risk Level: ${r.risk_level}` : null,
      r.alert_type ? `Alert Type: ${r.alert_type}` : null,
      r.notifying_country ? `Notifying Country: ${r.notifying_country}` : null,
      r.measures_taken ? `Measures: ${r.measures_taken}` : null,
      r.date_published ? `Published: ${new Date(r.date_published).toISOString().split('T')[0]}` : null,
    ].filter(Boolean).join('. '),
  }));
  
  await processBatch(records, 'safety_alert');
}

// === SOURCE 5: Companies ===
async function embedCompanies() {
  console.log('\n🏢 Companies');
  const rows = await sql`SELECT id, name, kvk_number, trade_name, trade_names, legal_form, sbi_code, sbi_description, address_city, address_country FROM companies`;
  
  const records = rows.map(r => ({
    source_type: 'company',
    source_id: String(r.id),
    source_authority: 'KVK Netherlands',
    title: `Company: ${r.trade_name || r.name}`,
    content: [
      `Dutch Company: ${r.trade_name || r.name}`,
      r.kvk_number ? `KVK Number: ${r.kvk_number}` : null,
      r.trade_name ? `Trade Names: ${r.trade_name}` : null,
      r.legal_form ? `Legal Form: ${r.legal_form}` : null,
      r.sbi_code ? `SBI Code: ${r.sbi_code}` : null,
      r.sbi_description ? `SBI Description: ${r.sbi_description}` : null,
      r.address_city ? `City: ${r.address_city}` : null,
      r.address_country ? `Country: ${r.address_country}` : null,
    ].filter(Boolean).join('. '),
  }));
  
  await processBatch(records, 'company');
}

// === SOURCE 6: Products ===
async function embedProducts() {
  console.log('\n🛒 Products');
  const rows = await sql`SELECT id, gtin, product_name, brand, categories, target_market, nutrition_grades, eco_score FROM products`;
  
  const records = rows.map(r => ({
    source_type: 'product',
    source_id: String(r.id),
    source_authority: 'Open Food Facts',
    title: `Product: ${r.product_name || r.gtin}`,
    content: [
      `Product: ${r.product_name || 'Unknown'}`,
      r.gtin ? `GTIN: ${r.gtin}` : null,
      r.brand ? `Brand: ${r.brand}` : null,
      r.categories ? `Categories: ${r.categories.substring(0, 200)}` : null,
      r.target_market ? `Target Market: ${r.target_market}` : null,
      r.nutrition_grades ? `Nutri-Score: ${r.nutrition_grades}` : null,
      r.eco_score ? `Eco-Score: ${r.eco_score}` : null,
    ].filter(Boolean).join('. '),
  }));
  
  await processBatch(records, 'product');
}

// === SOURCE 7: Hub News ===
async function embedHubNews() {
  console.log('\n📰 Hub News');
  const rows = await sql`SELECT id, title, summary, category FROM hub_news`;
  
  const records = rows.map(r => ({
    source_type: 'hub_news',
    source_id: String(r.id),
    source_authority: 'ISA Platform',
    title: `ESG News: ${r.title}`,
    content: [
      `ESG News Article: ${r.title}`,
      r.summary ? `Summary: ${r.summary}` : null,
      r.category ? `Category: ${r.category}` : null,
    ].filter(Boolean).join('. '),
  }));
  
  await processBatch(records, 'hub_news');
}

// === SOURCE 8: Identifier Crosswalks ===
async function embedCrosswalks() {
  console.log('\n🔀 Identifier Crosswalks');
  const rows = await sql`SELECT id, source_system, source_identifier, target_system, target_identifier, linkage_type, confidence, source_of_linkage FROM identifier_crosswalks`;
  
  const records = rows.map(r => ({
    source_type: 'crosswalk',
    source_id: String(r.id),
    source_authority: 'ISA Platform',
    title: `Crosswalk: ${r.source_system}:${r.source_identifier} → ${r.target_system}:${r.target_identifier}`,
    content: [
      `Identifier Crosswalk`,
      `Source: ${r.source_system} identifier ${r.source_identifier}`,
      `Target: ${r.target_system} identifier ${r.target_identifier}`,
      r.linkage_type ? `Linkage Type: ${r.linkage_type}` : null,
      r.confidence ? `Confidence: ${r.confidence}` : null,
      r.source_of_linkage ? `Source of Linkage: ${r.source_of_linkage}` : null,
    ].filter(Boolean).join('. '),
  }));
  
  await processBatch(records, 'crosswalk');
}

// === MAIN ===
async function main() {
  console.log('🚀 Knowledge Embedding Expansion');
  console.log('================================');
  
  const before = await sql`SELECT count(*) as cnt FROM knowledge_embeddings`;
  console.log(`Starting count: ${before[0].cnt} embeddings`);
  
  await embedGS1WebVocabulary();
  await embedGPCClassification();
  await embedESRSStandardMappings();
  await embedSafetyAlerts();
  await embedCompanies();
  await embedProducts();
  await embedHubNews();
  await embedCrosswalks();
  
  const after = await sql`SELECT count(*) as cnt FROM knowledge_embeddings`;
  console.log('\n================================');
  console.log(`✅ Expansion complete!`);
  console.log(`Before: ${before[0].cnt}`);
  console.log(`After: ${after[0].cnt}`);
  console.log(`Generated: ${totalGenerated}`);
  console.log(`Skipped: ${totalSkipped}`);
  
  // Show breakdown
  const byType = await sql`SELECT source_type, count(*) as cnt FROM knowledge_embeddings GROUP BY source_type ORDER BY cnt DESC`;
  console.log('\nBreakdown by source type:');
  for (const r of byType) {
    console.log(`  ${r.source_type}: ${r.cnt}`);
  }
  
  await sql.end();
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
