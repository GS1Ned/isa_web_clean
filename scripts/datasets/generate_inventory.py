#!/usr/bin/env python3
"""
Generate comprehensive file inventory for ISA repository
Produces CSV with: path, bytes, ext, mtime_iso, sha256, top_level_dir, is_archive, is_dataset_candidate
"""

import os
import csv
import hashlib
from datetime import datetime
from pathlib import Path
import sys

def get_file_hash(filepath):
    """Calculate SHA256 hash of file"""
    try:
        sha256 = hashlib.sha256()
        with open(filepath, 'rb') as f:
            for chunk in iter(lambda: f.read(8192), b''):
                sha256.update(chunk)
        return sha256.hexdigest()
    except Exception as e:
        return f"ERROR:{str(e)}"

def is_archive_file(path_str):
    """Determine if file is an archive/compressed format"""
    archive_exts = {'.zip', '.gz', '.tar', '.tgz', '.bz2', '.7z', '.rar'}
    return Path(path_str).suffix.lower() in archive_exts

def is_dataset_candidate(path_str, size_bytes):
    """Heuristic: likely a dataset if it's a data file format and reasonably sized"""
    dataset_exts = {'.xlsx', '.xls', '.csv', '.json', '.xml', '.pdf', '.zip'}
    ext = Path(path_str).suffix.lower()
    # Dataset candidates: data formats, not tiny (>1KB), not huge (reasonable for manual review)
    return ext in dataset_exts and size_bytes > 1024

def generate_inventory(repo_root, output_csv):
    """Walk repository and generate inventory CSV"""
    
    repo_path = Path(repo_root).resolve()
    rows = []
    
    print(f"Scanning repository: {repo_path}")
    
    for root, dirs, files in os.walk(repo_path):
        # Skip .git directory
        if '.git' in dirs:
            dirs.remove('.git')
        
        # Skip node_modules
        if 'node_modules' in dirs:
            dirs.remove('node_modules')
            
        for filename in files:
            filepath = Path(root) / filename
            
            try:
                stat = filepath.stat()
                size_bytes = stat.st_size
                mtime = datetime.fromtimestamp(stat.st_mtime).isoformat()
                
                # Get relative path from repo root
                rel_path = filepath.relative_to(repo_path)
                
                # Get top-level directory
                parts = rel_path.parts
                top_level_dir = parts[0] if parts else ''
                
                # Calculate hash (skip for very large files >100MB)
                if size_bytes < 100 * 1024 * 1024:
                    file_hash = get_file_hash(filepath)
                else:
                    file_hash = "SKIPPED_LARGE_FILE"
                
                # Get extension
                ext = filepath.suffix.lower()
                
                rows.append({
                    'path': str(rel_path),
                    'bytes': size_bytes,
                    'ext': ext,
                    'mtime_iso': mtime,
                    'sha256': file_hash,
                    'top_level_dir': top_level_dir,
                    'is_archive': is_archive_file(str(rel_path)),
                    'is_dataset_candidate': is_dataset_candidate(str(rel_path), size_bytes)
                })
                
            except Exception as e:
                print(f"Error processing {filepath}: {e}", file=sys.stderr)
                continue
    
    # Write CSV
    print(f"Writing inventory to {output_csv}")
    with open(output_csv, 'w', newline='', encoding='utf-8') as f:
        fieldnames = ['path', 'bytes', 'ext', 'mtime_iso', 'sha256', 'top_level_dir', 'is_archive', 'is_dataset_candidate']
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    
    print(f"✅ Inventory complete: {len(rows)} files")
    return rows

if __name__ == '__main__':
    repo_root = sys.argv[1] if len(sys.argv) > 1 else Path(__file__).resolve().parent.parent.parent
    output_csv = sys.argv[2] if len(sys.argv) > 2 else str(repo_root / 'docs/INVENTORY.csv')
    
    generate_inventory(repo_root, output_csv)
