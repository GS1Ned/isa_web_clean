/**
 * Open Food Facts — Dutch Product Ingestion Script
 * Fetches 200+ products from OFF API across GS1 NL-relevant categories
 * Inserts into products table, skipping duplicates by GTIN
 */

import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL_POSTGRES);

// Dutch product search terms covering GS1 NL sectors
const SEARCH_CATEGORIES = [
  // Dairy
  { term: 'melk', label: 'Dairy - Milk' },
  { term: 'kaas', label: 'Dairy - Cheese' },
  { term: 'yoghurt', label: 'Dairy - Yoghurt' },
  { term: 'boter', label: 'Dairy - Butter' },
  // Bread & bakery
  { term: 'brood', label: 'Bakery - Bread' },
  { term: 'koek', label: 'Bakery - Cookies' },
  { term: 'beschuit', label: 'Bakery - Rusks' },
  // Meat & fish
  { term: 'vlees', label: 'Meat' },
  { term: 'kip', label: 'Poultry' },
  { term: 'vis', label: 'Fish' },
  { term: 'rookworst', label: 'Smoked sausage' },
  // Beverages
  { term: 'sap', label: 'Juice' },
  { term: 'bier', label: 'Beer' },
  { term: 'koffie', label: 'Coffee' },
  { term: 'thee', label: 'Tea' },
  // Snacks & sweets
  { term: 'chips', label: 'Chips' },
  { term: 'hagelslag', label: 'Chocolate sprinkles' },
  { term: 'stroopwafel', label: 'Stroopwafels' },
  { term: 'drop', label: 'Licorice' },
  { term: 'chocolade', label: 'Chocolate' },
  // Pantry staples
  { term: 'pasta', label: 'Pasta' },
  { term: 'rijst', label: 'Rice' },
  { term: 'soep', label: 'Soup' },
  { term: 'saus', label: 'Sauce' },
  // Fresh produce & frozen
  { term: 'groente', label: 'Vegetables' },
  { term: 'fruit', label: 'Fruit' },
  { term: 'diepvries', label: 'Frozen foods' },
  // Baby & health
  { term: 'babyvoeding', label: 'Baby food' },
  // Household / personal care
  { term: 'zeep', label: 'Soap' },
  { term: 'shampoo', label: 'Shampoo' },
  // Brands (Dutch supermarket private labels)
  { term: 'albert heijn', label: 'AH brand' },
  { term: 'jumbo', label: 'Jumbo brand' },
];

const FIELDS = 'code,product_name,brands,categories_tags,nutriscore_grade,ecoscore_grade,allergens,quantity,ingredients_text,packaging,image_front_url,nutriments,countries_tags';
const PAGE_SIZE = 10; // OFF API can be slow, keep pages small
const DELAY_MS = 1500; // Be polite to OFF servers

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchCategory(term, pageSize = PAGE_SIZE) {
  const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(term)}&search_simple=1&action=process&json=1&page_size=${pageSize}&fields=${FIELDS}`;
  
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);
    
    const resp = await fetch(url, {
      headers: { 'User-Agent': 'ISA-GS1-Research/1.0 (contact@gs1isa.com)' },
      signal: controller.signal
    });
    clearTimeout(timeout);
    
    if (!resp.ok) {
      console.log(`  [WARN] HTTP ${resp.status} for "${term}"`);
      return [];
    }
    
    const data = await resp.json();
    const products = data.products || [];
    console.log(`  "${term}": ${products.length} products (${data.count || '?'} total available)`);
    return products;
  } catch (err) {
    console.log(`  [ERROR] "${term}": ${err.message}`);
    return [];
  }
}

function extractNutriments(nutriments) {
  if (!nutriments) return null;
  // Extract key nutritional values
  const keys = [
    'energy-kcal_100g', 'energy-kj_100g',
    'fat_100g', 'saturated-fat_100g',
    'carbohydrates_100g', 'sugars_100g',
    'fiber_100g', 'proteins_100g',
    'salt_100g', 'sodium_100g',
    'nova-group', 'nutrition-score-fr_100g'
  ];
  const result = {};
  for (const k of keys) {
    if (nutriments[k] !== undefined) result[k] = nutriments[k];
  }
  return Object.keys(result).length > 0 ? JSON.stringify(result) : null;
}

async function insertProducts(products) {
  let inserted = 0;
  let skipped = 0;
  
  for (const p of products) {
    const gtin = p.code;
    if (!gtin || gtin.length < 8 || !p.product_name) {
      skipped++;
      continue;
    }
    
    try {
      // Check if GTIN already exists
      const existing = await sql`SELECT id FROM products WHERE gtin = ${gtin}`;
      if (existing.length > 0) {
        skipped++;
        continue;
      }
      
      const categories = (p.categories_tags || []).join(', ');
      const nutriments = extractNutriments(p.nutriments);
      const now = new Date().toISOString();
      
      await sql`
        INSERT INTO products (
          gtin, product_name, brand, categories, 
          net_content, nutrition_grades, nutriments,
          allergens, ingredients_text, packaging, image_url,
          eco_score, target_market, source_system, source_url,
          retrieved_at, trust_level, created_at, updated_at
        ) VALUES (
          ${gtin},
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
          ${'https://world.openfoodfacts.org/product/' + gtin},
          ${now},
          'T4',
          ${now},
          ${now}
        )
      `;
      inserted++;
    } catch (err) {
      if (err.message?.includes('duplicate') || err.message?.includes('unique')) {
        skipped++;
      } else {
        console.log(`  [WARN] Insert error for ${gtin}: ${err.message?.substring(0, 80)}`);
        skipped++;
      }
    }
  }
  
  return { inserted, skipped };
}

async function main() {
  console.log('=== Open Food Facts Dutch Product Ingestion ===\n');
  
  // Check current count
  const before = await sql`SELECT COUNT(*) as cnt FROM products`;
  console.log(`Products before: ${before[0].cnt}\n`);
  
  let allProducts = [];
  const seenGtins = new Set();
  
  // Fetch from all categories
  for (const cat of SEARCH_CATEGORIES) {
    console.log(`Fetching: ${cat.label} (${cat.term})...`);
    const products = await fetchCategory(cat.term);
    
    // Deduplicate by GTIN
    for (const p of products) {
      if (p.code && !seenGtins.has(p.code)) {
        seenGtins.add(p.code);
        allProducts.push(p);
      }
    }
    
    await sleep(DELAY_MS);
  }
  
  console.log(`\nTotal unique products fetched: ${allProducts.length}`);
  
  // If we don't have enough, try page 2 for the most popular categories
  if (allProducts.length < 200) {
    console.log('\nFetching page 2 for popular categories...');
    const popularTerms = ['melk', 'kaas', 'brood', 'bier', 'koffie', 'chocolade', 'chips', 'sap', 'pasta', 'soep', 'saus', 'yoghurt', 'vlees', 'vis', 'thee', 'fruit', 'groente'];
    
    for (const term of popularTerms) {
      if (allProducts.length >= 250) break;
      
      console.log(`  Page 2: "${term}"...`);
      const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(term)}&search_simple=1&action=process&json=1&page_size=10&page=2&fields=${FIELDS}`;
      
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 25000);
        const resp = await fetch(url, {
          headers: { 'User-Agent': 'ISA-GS1-Research/1.0 (contact@gs1isa.com)' },
          signal: controller.signal
        });
        clearTimeout(timeout);
        
        if (resp.ok) {
          const data = await resp.json();
          const products = data.products || [];
          let added = 0;
          for (const p of products) {
            if (p.code && !seenGtins.has(p.code)) {
              seenGtins.add(p.code);
              allProducts.push(p);
              added++;
            }
          }
          console.log(`    +${added} new products`);
        }
      } catch (err) {
        console.log(`    [ERROR] ${err.message}`);
      }
      
      await sleep(DELAY_MS);
    }
    
    console.log(`\nTotal after page 2: ${allProducts.length}`);
  }
  
  // If still not enough, try page 3 for top categories
  if (allProducts.length < 200) {
    console.log('\nFetching page 3 for top categories...');
    const topTerms = ['melk', 'kaas', 'brood', 'bier', 'chocolade', 'chips', 'koffie', 'sap', 'pasta', 'yoghurt'];
    
    for (const term of topTerms) {
      if (allProducts.length >= 250) break;
      
      console.log(`  Page 3: "${term}"...`);
      const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(term)}&search_simple=1&action=process&json=1&page_size=10&page=3&fields=${FIELDS}`;
      
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 25000);
        const resp = await fetch(url, {
          headers: { 'User-Agent': 'ISA-GS1-Research/1.0 (contact@gs1isa.com)' },
          signal: controller.signal
        });
        clearTimeout(timeout);
        
        if (resp.ok) {
          const data = await resp.json();
          const products = data.products || [];
          let added = 0;
          for (const p of products) {
            if (p.code && !seenGtins.has(p.code)) {
              seenGtins.add(p.code);
              allProducts.push(p);
              added++;
            }
          }
          console.log(`    +${added} new products`);
        }
      } catch (err) {
        console.log(`    [ERROR] ${err.message}`);
      }
      
      await sleep(DELAY_MS);
    }
    
    console.log(`\nTotal after page 3: ${allProducts.length}`);
  }
  
  // Insert all products
  console.log(`\nInserting ${allProducts.length} products into database...`);
  const { inserted, skipped } = await insertProducts(allProducts);
  
  // Final count
  const after = await sql`SELECT COUNT(*) as cnt FROM products`;
  console.log(`\n=== Results ===`);
  console.log(`Products before: ${before[0].cnt}`);
  console.log(`Fetched: ${allProducts.length}`);
  console.log(`Inserted: ${inserted}`);
  console.log(`Skipped (duplicate/invalid): ${skipped}`);
  console.log(`Products after: ${after[0].cnt}`);
  
  await sql.end();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
