/**
 * Open Food Facts v2 API — Dutch Product Ingestion (Fast)
 * Uses the faster v2 API with category-based filtering for Netherlands
 * Fetches 200+ products across diverse food categories
 */
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL_POSTGRES);

const CATEGORIES = [
  { tag: 'cheeses', label: 'Kaas', count: 15 },
  { tag: 'milks', label: 'Melk', count: 12 },
  { tag: 'breads', label: 'Brood', count: 15 },
  { tag: 'beers', label: 'Bier', count: 10 },
  { tag: 'chocolates', label: 'Chocolade', count: 12 },
  { tag: 'chips-and-fries', label: 'Chips', count: 10 },
  { tag: 'yogurts', label: 'Yoghurt', count: 12 },
  { tag: 'coffees', label: 'Koffie', count: 10 },
  { tag: 'pastas', label: 'Pasta', count: 10 },
  { tag: 'cereals', label: 'Ontbijtgranen', count: 12 },
  { tag: 'soups', label: 'Soep', count: 10 },
  { tag: 'sauces', label: 'Saus', count: 10 },
  { tag: 'snacks', label: 'Snacks', count: 12 },
  { tag: 'frozen-foods', label: 'Diepvries', count: 10 },
  { tag: 'baby-foods', label: 'Babyvoeding', count: 8 },
  { tag: 'beverages', label: 'Dranken', count: 12 },
  { tag: 'meats', label: 'Vlees', count: 12 },
  { tag: 'fish', label: 'Vis', count: 10 },
  { tag: 'biscuits', label: 'Koekjes', count: 10 },
  { tag: 'butters', label: 'Boter', count: 8 },
  { tag: 'jams', label: 'Jam', count: 6 },
  { tag: 'honeys', label: 'Honing', count: 5 },
  { tag: 'ice-creams', label: 'IJs', count: 8 },
  { tag: 'fruit-juices', label: 'Vruchtensap', count: 8 },
  { tag: 'teas', label: 'Thee', count: 6 },
];

const FIELDS = 'code,product_name,brands,categories_tags,nutriscore_grade,ecoscore_grade,allergens,quantity,ingredients_text,packaging,image_front_url,nutriments,countries_tags';

function extractNutriments(nutriments) {
  if (!nutriments) return null;
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

async function fetchCategory(category) {
  const url = `https://world.openfoodfacts.net/api/v2/search?categories_tags_en=${category.tag}&countries_tags_en=netherlands&page_size=${category.count}&fields=${FIELDS}`;
  
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);
      const resp = await fetch(url, {
        headers: { 'User-Agent': 'ISA-GS1-Research/1.0 (contact@gs1isa.com)' },
        signal: controller.signal
      });
      clearTimeout(timeout);
      
      if (resp.ok) {
        const data = await resp.json();
        return data.products || [];
      }
      return [];
    } catch (err) {
      if (attempt < 2) {
        await new Promise(r => setTimeout(r, 3000 * (attempt + 1)));
      } else {
        console.log(`  [WARN] Failed to fetch ${category.tag}: ${err.message}`);
        return [];
      }
    }
  }
  return [];
}

async function insertProduct(p) {
  const gtin = p.code;
  if (!gtin || gtin.length < 8 || !p.product_name) return false;
  
  try {
    const existing = await sql`SELECT id FROM products WHERE gtin = ${gtin}`;
    if (existing.length > 0) return false;
    
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
        ${(p.nutriscore_grade && p.nutriscore_grade.length <= 20) ? p.nutriscore_grade : null},
        ${nutriments ? sql`${nutriments}::jsonb` : null},
        ${(p.allergens || '').substring(0, 500) || null},
        ${(p.ingredients_text || '').substring(0, 2000) || null},
        ${(p.packaging || '').substring(0, 500) || null},
        ${p.image_front_url || null},
        ${(p.ecoscore_grade && p.ecoscore_grade.length <= 20) ? p.ecoscore_grade : (p.ecoscore_grade === 'unknown' ? null : (p.ecoscore_grade || null))},
        'NL',
        'open_food_facts',
        ${'https://world.openfoodfacts.org/product/' + gtin},
        ${now},
        'T4',
        ${now},
        ${now}
      )
    `;
    return true;
  } catch (err) {
    if (!err.message?.includes('duplicate') && !err.message?.includes('unique')) {
      console.log(`  [WARN] Insert error for ${gtin}: ${err.message?.substring(0, 80)}`);
    }
    return false;
  }
}

async function main() {
  console.log('=== Open Food Facts v2 API — Dutch Product Ingestion ===\n');
  
  const before = await sql`SELECT COUNT(*) as cnt FROM products`;
  console.log(`Products before: ${before[0].cnt}\n`);
  
  const seenGtins = new Set();
  let totalInserted = 0;
  let totalFetched = 0;
  
  // Fetch all categories sequentially (v2 API is fast enough)
  for (const cat of CATEGORIES) {
    process.stdout.write(`  ${cat.label} (${cat.tag})... `);
    const products = await fetchCategory(cat);
    
    let inserted = 0;
    for (const p of products) {
      if (p.code && !seenGtins.has(p.code)) {
        seenGtins.add(p.code);
        totalFetched++;
        if (await insertProduct(p)) {
          inserted++;
          totalInserted++;
        }
      }
    }
    
    console.log(`${products.length} fetched, ${inserted} inserted (total: ${totalInserted})`);
    
    // Small delay to be polite
    await new Promise(r => setTimeout(r, 500));
  }
  
  // Phase 2: Get page 2 for larger categories if we need more
  if (totalInserted + parseInt(before[0].cnt) < 200) {
    console.log('\n--- Phase 2: Page 2 for large categories ---');
    const largeCats = CATEGORIES.filter(c => c.count >= 10);
    
    for (const cat of largeCats) {
      const url = `https://world.openfoodfacts.net/api/v2/search?categories_tags_en=${cat.tag}&countries_tags_en=netherlands&page_size=20&page=2&fields=${FIELDS}`;
      
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);
        const resp = await fetch(url, {
          headers: { 'User-Agent': 'ISA-GS1-Research/1.0 (contact@gs1isa.com)' },
          signal: controller.signal
        });
        clearTimeout(timeout);
        
        if (resp.ok) {
          const data = await resp.json();
          const products = data.products || [];
          let inserted = 0;
          for (const p of products) {
            if (p.code && !seenGtins.has(p.code)) {
              seenGtins.add(p.code);
              totalFetched++;
              if (await insertProduct(p)) {
                inserted++;
                totalInserted++;
              }
            }
          }
          if (inserted > 0) {
            console.log(`  ${cat.label} p2: +${inserted}`);
          }
        }
      } catch (err) {
        // skip
      }
      
      await new Promise(r => setTimeout(r, 500));
    }
  }
  
  const after = await sql`SELECT COUNT(*) as cnt FROM products`;
  console.log(`\n=== Results ===`);
  console.log(`Products before: ${before[0].cnt}`);
  console.log(`Unique fetched: ${totalFetched}`);
  console.log(`Inserted: ${totalInserted}`);
  console.log(`Products after: ${after[0].cnt}`);
  
  await sql.end();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
