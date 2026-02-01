#!/usr/bin/env python3
"""
Ingest GS1 Nederland sustainability guidance content into ISA database.
"""

import json
import os
import hashlib
import mysql.connector
from datetime import datetime
from typing import List, Dict, Any
from openai import OpenAI

DATABASE_URL = os.environ.get('DATABASE_URL', '')

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
        print(f"Error generating embedding: {e}")
        return None


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
        print(f"  Skipping duplicate: {item['title'][:50]}")
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
    
    values = (
        source_type,
        source_id,
        item['content'],
        hash_val,
        json.dumps(embedding) if embedding else '[]',
        'text-embedding-3-small',
        item['title'][:500],
        item.get('url', '')[:500],
        'gs1_nl_sustainability_guidance',
        item.get('version', '2025'),
        now,
        0,
        'guidance',
        'valid',
        'GS1 Nederland',
        'normative',
        'sustainability_guidance',
        0.95,
        now,
        now
    )
    
    cursor.execute(sql, values)
    return True


def main():
    content_path = 'data/gs1nl/sustainability_guidance_content.json'
    with open(content_path, 'r', encoding='utf-8') as f:
        content_items = json.load(f)
    
    print(f"Loaded {len(content_items)} sustainability guidance items")
    
    client = OpenAI()
    
    print("Connecting to database...")
    conn = get_db_connection()
    cursor = conn.cursor()
    
    source_id = get_next_source_id(cursor, 'gs1_nl_datamodel')
    print(f"Starting source ID: {source_id}")
    
    inserted = 0
    skipped = 0
    errors = 0
    
    for i, item in enumerate(content_items):
        try:
            print(f"Processing {i+1}/{len(content_items)}: {item['title'][:50]}...")
            
            embedding = generate_embedding(client, item['content'])
            
            if insert_knowledge_embedding(cursor, item, embedding, source_id):
                inserted += 1
                source_id += 1
            else:
                skipped += 1
                
        except Exception as e:
            print(f"  Error: {e}")
            errors += 1
            continue
    
    conn.commit()
    cursor.close()
    conn.close()
    
    print(f"\n=== Summary ===")
    print(f"Inserted: {inserted}")
    print(f"Skipped (duplicates): {skipped}")
    print(f"Errors: {errors}")


if __name__ == '__main__':
    main()
