#!/usr/bin/env python3
"""
Ingest Fashion/Textiles DPP Guidance Content into ISA Knowledge Base

This script reads the Fashion DPP guidance JSON and inserts it into the
knowledge_embeddings table with OpenAI embeddings.
"""

import json
import os
import hashlib
import mysql.connector
from openai import OpenAI

# Database configuration from environment
DATABASE_URL = os.environ.get('DATABASE_URL', '')

# Parse DATABASE_URL
def parse_database_url(url):
    """Parse mysql:// URL into connection parameters"""
    # Format: mysql://user:pass@host:port/database?ssl=...
    url = url.replace('mysql://', '')
    
    # Split user:pass from rest
    auth, rest = url.split('@')
    user, password = auth.split(':')
    
    # Split host:port from database
    host_port, db_params = rest.split('/')
    host, port = host_port.split(':')
    
    # Get database name (before any query params)
    database = db_params.split('?')[0]
    
    return {
        'host': host,
        'port': int(port),
        'user': user,
        'password': password,
        'database': database,
        'ssl_disabled': False
    }

def get_embedding(client, text):
    """Get embedding from OpenAI API"""
    response = client.embeddings.create(
        model="text-embedding-3-small",
        input=text,
        dimensions=1536
    )
    return response.data[0].embedding

def main():
    # Initialize OpenAI client
    api_key = os.environ.get('OPENAI_API_KEY')
    base_url = os.environ.get('OPENAI_API_BASE')
    
    # Only set base_url if it's a valid URL
    if base_url and base_url.startswith('http'):
        client = OpenAI(api_key=api_key, base_url=base_url)
    else:
        client = OpenAI(api_key=api_key)
    
    # Parse database URL
    db_config = parse_database_url(DATABASE_URL)
    
    # Connect to database
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()
    
    # Load Fashion DPP guidance content
    with open('data/gs1nl/fashion_dpp_guidance_content.json', 'r') as f:
        content = json.load(f)
    
    print(f"Loaded {len(content)} Fashion DPP guidance items")
    
    # Get max sourceId for gs1_nl_datamodel type (global, not per dataset)
    cursor.execute("""
        SELECT COALESCE(MAX(sourceId), 0) FROM knowledge_embeddings 
        WHERE sourceType = 'gs1_nl_datamodel'
    """)
    max_source_id = cursor.fetchone()[0]
    print(f"Starting from sourceId: {max_source_id + 1}")
    
    # Insert each item
    inserted = 0
    skipped = 0
    
    for i, item in enumerate(content):
        source_id = max_source_id + i + 1
        
        # Create embedding text
        embedding_text = f"{item['title']}\n\n{item['description']}\n\n{item['content']}"
        
        # Check if already exists
        cursor.execute("""
            SELECT id FROM knowledge_embeddings 
            WHERE sourceType = 'gs1_nl_datamodel' 
            AND datasetId = %s 
            AND title = %s
        """, (item['datasetId'], item['title']))
        
        if cursor.fetchone():
            print(f"Skipping existing: {item['title'][:50]}...")
            skipped += 1
            continue
        
        # Get embedding
        print(f"Processing ({i+1}/{len(content)}): {item['title'][:50]}...")
        embedding = get_embedding(client, embedding_text)
        embedding_str = json.dumps(embedding)
        
        # Insert into database
        cursor.execute("""
            INSERT INTO knowledge_embeddings 
            (sourceType, sourceId, datasetId, title, content, contentHash, embedding, createdAt, updatedAt)
            VALUES (%s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
        """, (
            'gs1_nl_datamodel',
            source_id,
            item['datasetId'],
            item['title'],
            item['content'][:5000],  # Truncate if too long
            hashlib.sha256(item['content'].encode()).hexdigest(),
            embedding_str
        ))
        
        conn.commit()
        inserted += 1
        print(f"  ✓ Inserted")
    
    print(f"\nCompleted: {inserted} inserted, {skipped} skipped")
    
    cursor.close()
    conn.close()

if __name__ == '__main__':
    main()
