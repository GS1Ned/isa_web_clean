#!/usr/bin/env python3
"""
Open Food Facts — Parallel Dutch Product Ingestion
Uses asyncio + aiohttp for concurrent fetching to overcome OFF API latency.
"""

import asyncio
import aiohttp
import json
import os
import sys
import time

SEARCH_TERMS = [
    'melk', 'kaas', 'yoghurt', 'boter', 'kwark', 'vla',
    'brood', 'koek', 'beschuit', 'ontbijtkoek', 'crackers',
    'vlees', 'kip', 'vis', 'rookworst', 'gehakt', 'ham', 'worst',
    'sap', 'bier', 'koffie', 'thee', 'water', 'wijn', 'frisdrank', 'limonade',
    'chips', 'hagelslag', 'stroopwafel', 'drop', 'chocolade', 'koekjes', 'noten', 'snoep',
    'pasta', 'rijst', 'soep', 'saus', 'mayonaise', 'mosterd', 'pindakaas', 'jam', 'honing',
    'groente', 'fruit', 'salade', 'tomaat', 'aardappel', 'ui', 'wortel',
    'diepvries', 'pizza', 'ijs', 'friet',
    'babyvoeding', 'zeep', 'shampoo', 'tandpasta', 'wasmiddel',
    'albert heijn', 'jumbo', 'lidl', 'plus', 'aldi',
    'muesli', 'cornflakes', 'havermout', 'granola',
    'hummus', 'tofu', 'tempeh', 'falafel',
    'olijfolie', 'zonnebloemolie', 'azijn',
    'tonijn', 'zalm', 'garnalen', 'haring',
    'appelmoes', 'pindas', 'rozijnen', 'cranberry',
]

FIELDS = 'code,product_name,brands,categories_tags,nutriscore_grade,ecoscore_grade,allergens,quantity,ingredients_text,packaging,image_front_url,nutriments,countries_tags'
CACHE_FILE = '/tmp/off_products_all.json'

async def fetch_page(session, term, page, semaphore):
    """Fetch one page of results for a search term."""
    url = f"https://world.openfoodfacts.org/cgi/search.pl"
    params = {
        'search_terms': term,
        'search_simple': 1,
        'action': 'process',
        'json': 1,
        'page_size': 10,
        'page': page,
        'fields': FIELDS
    }
    
    async with semaphore:
        for attempt in range(3):
            try:
                async with session.get(url, params=params, timeout=aiohttp.ClientTimeout(total=45)) as resp:
                    if resp.status == 200:
                        data = await resp.json(content_type=None)
                        products = data.get('products', [])
                        return [(term, page, products)]
                    return []
            except Exception as e:
                if attempt < 2:
                    await asyncio.sleep(2 + attempt * 3)
                else:
                    return []
    return []

async def fetch_all_products():
    """Fetch products from OFF API using concurrent requests."""
    if os.path.exists(CACHE_FILE):
        with open(CACHE_FILE) as f:
            cached = json.load(f)
        if len(cached) >= 200:
            print(f"Using cached {len(cached)} products")
            return cached
    
    # Limit concurrency to be polite to OFF servers
    semaphore = asyncio.Semaphore(3)
    headers = {'User-Agent': 'ISA-GS1-Research/1.0 (contact@gs1isa.com)'}
    
    seen_gtins = set()
    all_products = []
    
    async with aiohttp.ClientSession(headers=headers) as session:
        # Phase 1: Page 1 for all terms (concurrent in batches of 3)
        print("--- Phase 1: Page 1 for all terms ---")
        tasks = [fetch_page(session, term, 1, semaphore) for term in SEARCH_TERMS]
        results = await asyncio.gather(*tasks)
        
        for result_list in results:
            for term, page, products in result_list:
                added = 0
                for p in products:
                    code = p.get('code', '')
                    if code and len(code) >= 8 and p.get('product_name') and code not in seen_gtins:
                        seen_gtins.add(code)
                        all_products.append(p)
                        added += 1
                if products:
                    print(f"  '{term}' p{page}: {len(products)} fetched, {added} new")
        
        print(f"\nAfter phase 1: {len(all_products)} unique products")
        
        # Phase 2: Page 2 for all terms if needed
        if len(all_products) < 250:
            print("\n--- Phase 2: Page 2 for all terms ---")
            tasks = [fetch_page(session, term, 2, semaphore) for term in SEARCH_TERMS]
            results = await asyncio.gather(*tasks)
            
            for result_list in results:
                for term, page, products in result_list:
                    added = 0
                    for p in products:
                        code = p.get('code', '')
                        if code and len(code) >= 8 and p.get('product_name') and code not in seen_gtins:
                            seen_gtins.add(code)
                            all_products.append(p)
                            added += 1
                    if products and added > 0:
                        print(f"  '{term}' p{page}: +{added} new")
            
            print(f"\nAfter phase 2: {len(all_products)} unique products")
        
        # Phase 3: Page 3 if still needed
        if len(all_products) < 220:
            print("\n--- Phase 3: Page 3 for top terms ---")
            tasks = [fetch_page(session, term, 3, semaphore) for term in SEARCH_TERMS[:40]]
            results = await asyncio.gather(*tasks)
            
            for result_list in results:
                for term, page, products in result_list:
                    for p in products:
                        code = p.get('code', '')
                        if code and len(code) >= 8 and p.get('product_name') and code not in seen_gtins:
                            seen_gtins.add(code)
                            all_products.append(p)
            
            print(f"\nAfter phase 3: {len(all_products)} unique products")
    
    # Save cache
    with open(CACHE_FILE, 'w') as f:
        json.dump(all_products, f)
    
    return all_products

def main():
    products = asyncio.run(fetch_all_products())
    print(f"\n=== Total unique products: {len(products)} ===")
    
    # Show category breakdown
    brands = {}
    for p in products:
        b = p.get('brands', 'unknown') or 'unknown'
        brands[b] = brands.get(b, 0) + 1
    
    print("\nTop 15 brands:")
    for brand, count in sorted(brands.items(), key=lambda x: -x[1])[:15]:
        print(f"  {brand}: {count}")
    
    print(f"\nProducts saved to {CACHE_FILE}")

if __name__ == '__main__':
    main()
