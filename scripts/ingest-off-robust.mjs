/**
 * Open Food Facts — Robust Dutch Product Ingestion
 * Fetches products one category at a time, saves to JSON, then bulk inserts.
 * Handles OFF API instability with retries and longer timeouts.
 */

import postgres from 'postgres';
import { writeFileSync, readFileSync, existsSync } from 'fs';

const sql = postgres(process.env.DATABASE_URL_POSTGRES);
const CACHE_FILE = '/tmp/off_products_cache.json';

const SEARCH_TERMS = [
  'melk', 'kaas', 'yoghurt', 'boter', 'kwark',
  'brood', 'koek', 'beschuit', 'ontbijtkoek',
  'vlees', 'kip', 'vis', 'rookworst', 'gehakt',
  'sap', 'bier', 'koffie', 'thee', 'water', 'wijn',
  'chips', 'hagelslag', 'stroopwafel', 'drop', 'chocolade', 'koekjes',
  'pasta', 'rijst', 'soep', 'saus', 'mayonaise', 'mosterd', 'pindakaas',
  'groente', 'fruit', 'salade', 'tomaat', 'aardappel',
  'diepvries', 'pizza', 'ijs',
  'babyvoeding', 'zeep', 'shampoo', 'tandpasta',
  'albert heijn', 'jumbo', 'lidl', 'plus'
];

const FIELDS = 'code,product_name,brands,categories_tags,nutriscore_grade,ecoscore_grade,allergens,quantity,ingredients_text,packaging,image_front_url,nutriments,countries_tags';

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function fetchWithRetry(term, page = 1, retries = 2) {
  const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(term)}&search_simple=1&action=process&json=1&page_size=10&page=${page}&fields=${FIELDS}`;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 40000); // 40s timeout
      
      const resp = await fetch(url, {
        headers: { 'User-Agent': 'ISA-GS1-Research/1.0 (contact@gs1isa.com)' },
        signal: controller.signal
      });
      clearTimeout(timeout);
      
      if (!resp.ok) return [];
      const data = await resp.json();
      return data.products || [];
    } catch (err) {
      if (attempt < retries) {
        console.log(`    Retry ${attempt + 1} for "${term}" p${page}...`);
        await sleep(3000 + attempt * 2000);
      }
    }
  }
  return [];
}

async function fetchAllProducts() {
  // Check cache first
  if (existsSync(CACHE_FILE)) {
    const cached = JSON.parse(readFileSync(CACHE_FILE, 'utf8'));
    if (cached.length >= 150) {
      console.log(`Using cached ${cached.length} products from ${CACHE_FILE}`);
      return cached;
    }
  }
  
  const seenGtins = new Set();
  const allProducts = [];
  
  // Phase 1: Page 1 for all terms
  console.log('--- Phase 1: Page 1 for all search terms ---');
  for (const term of SEARCH_TERMS) {
    process.stdout.write(`  "${term}" p1... `);
    const products = await fetchWithRetry(term, 1);
    let added = 0;
    for (const p of products) {
      if (p.code && p.product_name && !seenGtins.has(p.code)) {
        seenGtins.add(p.code);
        allProducts.push(p);
        added++;
      }
    }
    console.log(`${products.length} fetched, ${added} new (total: ${allProducts.length})`);
    await sleep(2000);
    
    // Save progress
    if (allProducts.length % 50 < 10) {
      writeFileSync(CACHE_FILE, JSON.stringify(allProducts));
    }
  }
  
  console.log(`\nAfter page 1: ${allProducts.length} unique products`);
  
  // Phase 2: Page 2 for successful terms if needed
  if (allProducts.length < 220) {
    console.log('\n--- Phase 2: Page 2 for more products ---');
    for (const term of SEARCH_TERMS) {
      if (allProducts.length >= 280) break;
      process.stdout.write(`  "${term}" p2... `);
      const products = await fetchWithRetry(term, 2);
      let added = 0;
      for (const p of products) {
        if (p.code && p.product_name && !seenGtins.has(p.code)) {
          seenGtins.add(p.code);
          allProducts.push(p);
          added++;
        }
      }
      console.log(`${products.length} fetched, ${added} new (total: ${allProducts.length})`);
      await sleep(2000);
    }
    console.log(`\nAfter page 2: ${allProducts.length} unique products`);
  }
  
  // Phase 3: Page 3 if still needed
  if (allProducts.length < 220) {
    console.log('\n--- Phase 3: Page 3 for more products ---');
    for (const term of SEARCH_TERMS.slice(0, 20)) {
      if (allProducts.length >= 280) break;
      process.stdout.write(`  "${term}" p3... `);
      const products = await fetchWithRetry(term, 3);
      let added = 0;
      for (const p of products) {
        if (p.code && p.product_name && !seenGtins.has(p.code)) {
          seenGtins.add(p.code);
          allProducts.push(p);
          added++;
        }
      }
      console.log(`${products.length} fetched, ${added} new (total: ${allProducts.length})`);
      await sleep(2000);
    }
    console.log(`\nAfter page 3: ${allProducts.length} unique products`);
  }
  
  // Save final cache
  writeFileSync(CACHE_FILE, JSON.stringify(allProducts));
  return allProducts;
}

function extractNutriments(nutriments) {
  if (!nutriments) return null;
  const keys = [
    'energy-kcal_100g', 'energy-kj_100g', 'fat_100g', 'saturated-fat_100g',
    'carbohydrates_100g', 'sugars_100g', 'fiber_100g', 'proteins_100g',
    'salt_100g', 'sodium_100g', 'nova-group', 'nutrition-score-fr_100g'
  ];
  const result = {};
  for (const k of keys) {
    if (nutriments[k] !== undefined) result[k] = nutriments[k];
  }
  return Object.keys(result).length > 0 ? JSON.stringify(result) : null;
}

async function insertProducts(products) {
  // Get existing GTINs
  const existing = await sql`SELECT gtin FROM products`;
  const existingGtins = new Set(existing.map(r => r.gtin));
  
  let inserted = 0, skipped = 0;
  const now = new Date().toISOString();
  
  for (const p of products) {
    if (!p.code || p.code.length < 8 || !p.product_name || existingGtins.has(p.code)) {
      skipped++;
      continue;
    }
    
    try {
      const categories = (p.categories_tags || []).join(', ');
      const nutriments = extractNutriments(p.nutriments);
      
      await sql`
        INSERT INTO products (
          gtin, product_name, brand, categories,
          net_content, nutrition_grades, nutriments,
          allergens, ingredients_text, packaging, image_url,
          eco_score, target_market, source_system, source_url,
          retrieved_at, trust_level, created_at, updated_at
        ) VALUES (
          ${p.code},
          ${p.product_name.substring(0, 500)},
          ${(p.brands || '').substring(0, 200) || null},
          ${categories.substring(0, 1000) || null},
          ${p.quantity || null},
          ${p.nutriscore_grade || null},
          ${nutriments ? sql`${nutriments}::jsonb` : null},
          ${(p.allergens || '').substring(0, 500) || null},
          ${(p.ingredients_text || '').substring(0, 2000) || null},
          ${(p.packaging || '').substring(0, 500) || null},
          ${p.image_front_url || null},
          ${p.ecoscore_grade || null},
          'NL',
          'open_food_facts',
          ${'https://world.openfoodfacts.org/product/' + p.code},
          ${now},
          'T4',
          ${now},
          ${now}
        )
      `;
      inserted++;
      existingGtins.add(p.code);
      
      if (inserted % 25 === 0) console.log(`  ... ${inserted} inserted`);
    } catch (err) {
      skipped++;
    }
  }
  
  return { inserted, skipped };
}

async function main() {
  console.log('=== Open Food Facts Dutch Product Ingestion (Robust) ===\n');
  
  const before = await sql`SELECT COUNT(*) as cnt FROM products`;
  console.log(`Products before: ${before[0].cnt}\n`);
  
  // Fetch all products (with caching)
  const allProducts = await fetchAllProducts();
  console.log(`\nTotal unique products to process: ${allProducts.length}`);
  
  // Insert into DB
  console.log('\nInserting into database...');
  const { inserted, skipped } = await insertProducts(allProducts);
  
  const after = await sql`SELECT COUNT(*) as cnt FROM products`;
  console.log(`\n=== RESULTS ===`);
  console.log(`Products before: ${before[0].cnt}`);
  console.log(`Fetched from OFF: ${allProducts.length}`);
  console.log(`Inserted: ${inserted}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Products after: ${after[0].cnt}`);
  
  // Show category breakdown
  const brands = await sql`SELECT brand, COUNT(*) as cnt FROM products WHERE brand IS NOT NULL GROUP BY brand ORDER BY cnt DESC LIMIT 15`;
  console.log('\nTop brands:');
  brands.forEach(b => console.log(`  ${b.brand}: ${b.cnt}`));
  
  await sql.end();
}

main().catch(err => {
  console.error('Fatal:', err);
  sql.end();
  process.exit(1);
});
