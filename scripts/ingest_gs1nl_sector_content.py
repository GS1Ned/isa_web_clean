#!/usr/bin/env python3
"""
Ingest GS1 Nederland sector datamodel content (DIY, Healthcare) into ISA database.
Optimized for batch processing with rate limiting.
"""

import json
import os
import hashlib
import mysql.connector
from datetime import datetime
from typing import List, Dict, Any
from openai import OpenAI
import time

DATABASE_URL = os.environ.get('DATABASE_URL', '')
OPENAI_API_BASE = os.environ.get('OPENAI_API_BASE', None)

def parse_database_url(url: str) -> dict:
    from urllib.parse import urlparse
    try:
        parsed = urlparse(url)
        return {
            'user': parsed.username,
            'password': parsed.password,
            'host': parsed.hostname,
            'port': parsed.port or 4000,
            'database': parsed.path.lstrip('/').split('?')[0],
            'ssl_disabled': False
        }
    except:
        return None


def get_db_connection():
    config = parse_database_url(DATABASE_URL)
    if not config:
        raise ValueError("Invalid DATABASE_URL")
    
    return mysql.connector.connect(
        host=config['host'],
        port=config['port'],
        user=config['user'],
        password=config['password'],
        database=config['database'],
        ssl_disabled=config['ssl_disabled']
    )


def generate_embedding(client: OpenAI, text: str) -> List[float]:
    try:
        response = client.embeddings.create(
            model="text-embedding-3-small",
            input=text[:8000]
        )
        return response.data[0].embedding
    except Exception as e:
        print(f"Error generating embedding: {str(e)[:100]}")
        return []


def content_hash(content: str) -> str:
    return hashlib.sha256(content.encode('utf-8')).hexdigest()


def get_next_source_id(cursor, source_type: str) -> int:
    cursor.execute(
        "SELECT COALESCE(MAX(sourceId), 0) + 1 FROM knowledge_embeddings WHERE sourceType = %s",
        (source_type,)
    )
    result = cursor.fetchone()
    return result[0] if result else 1


def insert_knowledge_embedding(cursor, item: Dict, embedding: List[float], source_id: int) -> bool:
    hash_val = content_hash(item['content'])
    cursor.execute(
        "SELECT id FROM knowledge_embeddings WHERE contentHash = %s",
        (hash_val,)
    )
    if cursor.fetchone():
        return False
    
    source_type = item.get('source_type', 'gs1_nl_datamodel')
    
    sql = """
    INSERT INTO knowledge_embeddings (
        sourceType, sourceId, content, contentHash, embedding, embeddingModel,
        title, url, datasetId, datasetVersion, lastVerifiedDate, isDeprecated,
        authority_level, legal_status, source_authority, semantic_layer,
        document_type, confidence_score, createdAt, updatedAt
    ) VALUES (
        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
    )
    """
    
    now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    sector = item.get('sector', 'Unknown')
    
    values = (
        source_type,
        source_id,
        item['content'],
        hash_val,
        json.dumps(embedding) if embedding else '[]',
        'text-embedding-3-small',
        item['title'][:500],
        item.get('url', '')[:500],
        f'gs1_nl_{sector.lower()}_datamodel',
        item.get('version', '3.1'),
        now,
        0,
        'guidance',
        'valid',
        'GS1 Benelux',
        'normative',
        'datamodel_attribute',
        0.95,
        now,
        now
    )
    
    cursor.execute(sql, values)
    return True


def ingest_content_file(content_path: str, client: OpenAI, conn, batch_size: int = 50):
    """Ingest a single content file with batched commits."""
    
    with open(content_path, 'r', encoding='utf-8') as f:
        content_items = json.load(f)
    
    # Skip header rows (items with 'Attributename' in title)
    content_items = [item for item in content_items if 'Attributename' not in item.get('title', '')]
    
    print(f"Loaded {len(content_items)} items from {content_path}")
    
    cursor = conn.cursor()
    source_id = get_next_source_id(cursor, 'gs1_nl_datamodel')
    print(f"Starting source ID: {source_id}")
    
    inserted = 0
    skipped = 0
    errors = 0
    
    for i, item in enumerate(content_items):
        try:
            # Generate embedding
            embedding = generate_embedding(client, item['content'])
            
            if insert_knowledge_embedding(cursor, item, embedding, source_id):
                inserted += 1
                source_id += 1
            else:
                skipped += 1
            
            # Commit in batches
            if (i + 1) % batch_size == 0:
                conn.commit()
                print(f"  Progress: {i+1}/{len(content_items)} (inserted: {inserted}, skipped: {skipped})")
                
            # Rate limiting for OpenAI API
            if (i + 1) % 100 == 0:
                time.sleep(1)
                
        except Exception as e:
            print(f"  Error at item {i}: {e}")
            errors += 1
            continue
    
    # Final commit
    conn.commit()
    cursor.close()
    
    return inserted, skipped, errors


def main():
    content_files = [
        ('data/gs1nl/diy_datamodel_content.json', 'DIY'),
        ('data/gs1nl/healthcare_datamodel_content.json', 'Healthcare')
    ]
    
    # Initialize OpenAI client with optional base_url
    if OPENAI_API_BASE:
        client = OpenAI(base_url=OPENAI_API_BASE)
    else:
        client = OpenAI()
    
    print("Connecting to database...")
    conn = get_db_connection()
    
    total_inserted = 0
    total_skipped = 0
    total_errors = 0
    
    for content_path, sector in content_files:
        print(f"\n=== Processing {sector} sector ===")
        inserted, skipped, errors = ingest_content_file(content_path, client, conn)
        total_inserted += inserted
        total_skipped += skipped
        total_errors += errors
        print(f"{sector}: Inserted {inserted}, Skipped {skipped}, Errors {errors}")
    
    conn.close()
    
    print(f"\n=== Final Summary ===")
    print(f"Total Inserted: {total_inserted}")
    print(f"Total Skipped: {total_skipped}")
    print(f"Total Errors: {total_errors}")


if __name__ == '__main__':
    main()
