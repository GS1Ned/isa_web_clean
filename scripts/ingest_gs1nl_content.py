#!/usr/bin/env python3
"""
Ingest GS1 Nederland datamodel content into ISA database.
Creates knowledge_embeddings entries for Ask ISA.
"""

import json
import os
import hashlib
import mysql.connector
from datetime import datetime
from typing import List, Dict, Any
from openai import OpenAI

# Database configuration from environment
DATABASE_URL = os.environ.get('DATABASE_URL', '')

def parse_database_url(url: str) -> dict:
    """Parse MySQL connection URL."""
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
    """Get database connection."""
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
    """Generate embedding using OpenAI API."""
    try:
        response = client.embeddings.create(
            model="text-embedding-3-small",
            input=text[:8000]  # Limit input length
        )
        return response.data[0].embedding
    except Exception as e:
        print(f"Error generating embedding: {e}")
        return None


def content_hash(content: str) -> str:
    """Generate hash for content deduplication."""
    return hashlib.sha256(content.encode('utf-8')).hexdigest()


def get_next_source_id(cursor, source_type: str) -> int:
    """Get the next available sourceId for a given sourceType."""
    cursor.execute(
        "SELECT COALESCE(MAX(sourceId), 0) + 1 FROM knowledge_embeddings WHERE sourceType = %s",
        (source_type,)
    )
    result = cursor.fetchone()
    return result[0] if result else 1


def insert_knowledge_embedding(cursor, item: Dict, embedding: List[float], source_id: int) -> bool:
    """Insert a knowledge embedding into the database."""
    
    # Check if content already exists by hash
    hash_val = content_hash(item['content'])
    cursor.execute(
        "SELECT id FROM knowledge_embeddings WHERE contentHash = %s",
        (hash_val,)
    )
    if cursor.fetchone():
        print(f"  Skipping duplicate: {item['title'][:50]}")
        return False
    
    source_type = item.get('source_type', 'gs1_nl_datamodel')
    
    # Insert new entry
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
        item['title'][:500],  # Ensure title fits
        item.get('url', '')[:500],
        'gs1_nl_benelux_datamodel',
        item.get('version', '3.1.34.2'),
        now,
        0,
        'guidance',
        'valid',
        'GS1 Nederland',
        'normative',
        'datamodel_attribute' if source_type == 'gs1_nl_datamodel' else 'codelist',
        0.95,
        now,
        now
    )
    
    cursor.execute(sql, values)
    return True


def main():
    """Main function to ingest content."""
    
    # Load parsed content
    content_path = 'data/gs1nl/fmcg_datamodel_content.json'
    with open(content_path, 'r', encoding='utf-8') as f:
        content_items = json.load(f)
    
    print(f"Loaded {len(content_items)} content items")
    
    # Initialize OpenAI client
    client = OpenAI()
    
    # Connect to database
    print("Connecting to database...")
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get starting source IDs for each type
    source_ids = {
        'gs1_nl_datamodel': get_next_source_id(cursor, 'gs1_nl_datamodel'),
        'gs1_nl_codelist': get_next_source_id(cursor, 'gs1_nl_codelist'),
    }
    print(f"Starting source IDs: {source_ids}")
    
    # Process content items
    inserted = 0
    skipped = 0
    errors = 0
    
    for i, item in enumerate(content_items):
        try:
            source_type = item.get('source_type', 'gs1_nl_datamodel')
            source_id = source_ids.get(source_type, 1)
            
            print(f"Processing {i+1}/{len(content_items)}: {item['title'][:50]}...")
            
            # Generate embedding
            embedding = generate_embedding(client, item['content'])
            
            # Insert into database
            if insert_knowledge_embedding(cursor, item, embedding, source_id):
                inserted += 1
                source_ids[source_type] = source_id + 1
            else:
                skipped += 1
            
            # Commit every 50 items
            if (i + 1) % 50 == 0:
                conn.commit()
                print(f"  Committed {inserted} items so far...")
                
        except Exception as e:
            print(f"  Error: {e}")
            errors += 1
            continue
    
    # Final commit
    conn.commit()
    cursor.close()
    conn.close()
    
    print(f"\n=== Summary ===")
    print(f"Inserted: {inserted}")
    print(f"Skipped (duplicates): {skipped}")
    print(f"Errors: {errors}")


if __name__ == '__main__':
    main()
