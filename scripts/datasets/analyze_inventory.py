#!/usr/bin/env python3
"""
Analyze inventory CSV and generate repository map with statistics
"""

import csv
import sys
from collections import defaultdict
from pathlib import Path

def analyze_inventory(inventory_csv):
    """Analyze inventory and return statistics"""
    
    rows = []
    with open(inventory_csv, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        rows = list(reader)
    
    total_files = len(rows)
    total_bytes = sum(int(r['bytes']) for r in rows)
    
    # Top 20 largest files
    largest_files = sorted(rows, key=lambda r: int(r['bytes']), reverse=True)[:20]
    
    # Directory sizes
    dir_sizes = defaultdict(int)
    for row in rows:
        top_dir = row['top_level_dir']
        dir_sizes[top_dir] += int(row['bytes'])
    
    largest_dirs = sorted(dir_sizes.items(), key=lambda x: x[1], reverse=True)[:20]
    
    # Duplicate hashes
    hash_counts = defaultdict(list)
    for row in rows:
        h = row['sha256']
        if h and not h.startswith('ERROR') and h != 'SKIPPED_LARGE_FILE':
            hash_counts[h].append(row['path'])
    
    duplicates = {h: paths for h, paths in hash_counts.items() if len(paths) > 1}
    
    # Dataset candidates
    dataset_candidates = [r for r in rows if r['is_dataset_candidate'] == 'True']
    
    return {
        'total_files': total_files,
        'total_bytes': total_bytes,
        'largest_files': largest_files,
        'largest_dirs': largest_dirs,
        'duplicates': duplicates,
        'dataset_candidates': dataset_candidates,
    }

def format_bytes(bytes_val):
    """Format bytes as human-readable"""
    for unit in ['B', 'KB', 'MB', 'GB']:
        if bytes_val < 1024:
            return f"{bytes_val:.1f} {unit}"
        bytes_val /= 1024
    return f"{bytes_val:.1f} TB"

def generate_repo_map(stats, output_file, phase='BEFORE'):
    """Generate repository map markdown"""
    
    lines = [
        f"# ISA Repository Map - {phase}",
        "",
        f"**Generated:** {output_file}",
        f"**Total Files:** {stats['total_files']:,}",
        f"**Total Size:** {format_bytes(stats['total_bytes'])}",
        "",
        "---",
        "",
        "## Top 20 Largest Files",
        "",
        "| Path | Size | Extension |",
        "|------|------|-----------|",
    ]
    
    for f in stats['largest_files']:
        lines.append(f"| {f['path']} | {format_bytes(int(f['bytes']))} | {f['ext']} |")
    
    lines.extend([
        "",
        "---",
        "",
        "## Top 20 Largest Directories",
        "",
        "| Directory | Total Size | Files |",
        "|-----------|------------|-------|",
    ])
    
    for dir_name, size in stats['largest_dirs']:
        file_count = sum(1 for r in stats['largest_files'] if r['top_level_dir'] == dir_name)
        lines.append(f"| {dir_name}/ | {format_bytes(size)} | {file_count} |")
    
    lines.extend([
        "",
        "---",
        "",
        "## Duplicate Files",
        "",
        f"**Total Duplicate Groups:** {len(stats['duplicates'])}",
        "",
    ])
    
    if stats['duplicates']:
        lines.append("| Hash (first 16 chars) | Paths |")
        lines.append("|----------------------|-------|")
        for h, paths in list(stats['duplicates'].items())[:10]:
            paths_str = '<br>'.join(paths[:3])
            if len(paths) > 3:
                paths_str += f"<br>...and {len(paths) - 3} more"
            lines.append(f"| {h[:16]}... | {paths_str} |")
    else:
        lines.append("*No duplicates found*")
    
    lines.extend([
        "",
        "---",
        "",
        "## Dataset Candidates",
        "",
        f"**Total Dataset Candidates:** {len(stats['dataset_candidates'])}",
        "",
        "*Files with data formats (.xlsx, .csv, .json, .pdf, .zip) and reasonable size*",
        "",
    ])
    
    # Write to file
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))
    
    print(f"✅ Repository map generated: {output_file}")

if __name__ == '__main__':
    inventory_csv = sys.argv[1] if len(sys.argv) > 1 else '/home/ubuntu/isa_web/docs/INVENTORY_BEFORE.csv'
    output_file = sys.argv[2] if len(sys.argv) > 2 else '/home/ubuntu/isa_web/docs/REPO_MAP_BEFORE.md'
    phase = sys.argv[3] if len(sys.argv) > 3 else 'BEFORE'
    
    stats = analyze_inventory(inventory_csv)
    generate_repo_map(stats, output_file, phase)
    
    # Print summary
    print(f"\n=== Repository Statistics ({phase}) ===")
    print(f"Total files: {stats['total_files']:,}")
    print(f"Total size: {format_bytes(stats['total_bytes'])}")
    print(f"Dataset candidates: {len(stats['dataset_candidates'])}")
    print(f"Duplicate groups: {len(stats['duplicates'])}")
