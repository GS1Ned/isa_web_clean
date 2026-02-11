#!/usr/bin/env python3
"""Phase 0 Final Pass: Classify remaining UNKNOWN files using META/CROSS_CUTTING"""

import json
from pathlib import Path

REPO_ROOT = Path(__file__).parent.parent.parent
INVENTORY_PATH = REPO_ROOT / "docs/planning/refactoring/FILE_INVENTORY.json"

# META patterns (infrastructure, tooling, governance)
META_PATTERNS = [
    '.github/', 'scripts/', 'config/', 'drizzle/', 'shared/',
    'package.json', 'tsconfig', 'vite.config', 'vitest', '.env',
    'README', 'LICENSE', 'CHANGELOG', '.gitignore', '.prettierrc',
    'eslint', 'docker', 'Dockerfile', '.dockerignore',
    'planning/', 'governance/', 'reference/', 'decisions/',
    'REPO_', 'AGENT_', 'INDEX.md', 'HOWTO', 'POLICY', 'RUBRIC'
]

# CROSS_CUTTING patterns (shared utilities, types, schemas)
CROSS_CUTTING_PATTERNS = [
    '_core/', 'utils/', 'lib/', 'types/', 'schemas/', 'shared/',
    'constants', 'helpers', 'common', 'base',
    'schema.ts', 'types.ts', 'const.ts', 'utils.ts',
    'logger', 'auth', 'middleware', 'context'
]

def classify_remaining(file_path: str) -> str:
    """Classify remaining UNKNOWN files"""
    
    path_lower = file_path.lower()
    
    # Check META patterns
    for pattern in META_PATTERNS:
        if pattern.lower() in path_lower:
            return 'META'
    
    # Check CROSS_CUTTING patterns
    for pattern in CROSS_CUTTING_PATTERNS:
        if pattern.lower() in path_lower:
            return 'CROSS_CUTTING'
    
    # Default: keep as UNKNOWN (will be manually reviewed)
    return 'UNKNOWN'

def final_pass():
    """Final classification pass"""
    
    print("Phase 0 Final Pass: META/CROSS_CUTTING Classification")
    print("=" * 60)
    
    # Load inventory
    with open(INVENTORY_PATH) as f:
        inventory = json.load(f)
    
    total = len(inventory['files'])
    unknown_before = sum(1 for f in inventory['files'] if f.get('capability') == 'UNKNOWN')
    
    print(f"\nBefore: {unknown_before}/{total} UNKNOWN ({unknown_before/total*100:.1f}%)")
    
    # Classify remaining UNKNOWN
    print("\nClassifying remaining UNKNOWN files...")
    reclassified = {'META': 0, 'CROSS_CUTTING': 0}
    
    for file_data in inventory['files']:
        if file_data.get('capability') == 'UNKNOWN':
            new_cap = classify_remaining(file_data['path'])
            
            if new_cap != 'UNKNOWN':
                file_data['capability'] = new_cap
                file_data['confidence'] = 0.8
                file_data['evidence'] = ['pattern_match']
                reclassified[new_cap] += 1
                
                if reclassified['META'] + reclassified['CROSS_CUTTING'] <= 20:
                    print(f"  {file_data['path'][:60]:60} → {new_cap}")
    
    unknown_after = sum(1 for f in inventory['files'] if f.get('capability') == 'UNKNOWN')
    
    print(f"\n... ({reclassified['META'] + reclassified['CROSS_CUTTING']} total)")
    print(f"\nAfter: {unknown_after}/{total} UNKNOWN ({unknown_after/total*100:.1f}%)")
    print(f"Reclassified to META: {reclassified['META']}")
    print(f"Reclassified to CROSS_CUTTING: {reclassified['CROSS_CUTTING']}")
    print(f"Total reclassified: {sum(reclassified.values())}")
    
    # Save updated inventory
    with open(INVENTORY_PATH, 'w') as f:
        json.dump(inventory, f, indent=2)
    
    print(f"\n✅ Updated: {INVENTORY_PATH.relative_to(REPO_ROOT)}")
    
    # Check target
    unknown_pct = unknown_after / total * 100
    if unknown_pct < 5:
        print(f"\n🎉 TARGET ACHIEVED: UNKNOWN {unknown_pct:.1f}% < 5%")
    else:
        print(f"\n⚠️  Progress: {unknown_before} → {unknown_after} ({(unknown_before-unknown_after)/unknown_before*100:.1f}% reduction)")
        print(f"   Need {unknown_after - int(total * 0.05)} more to reach <5% target")

if __name__ == '__main__':
    final_pass()
