#!/usr/bin/env python3
"""
Validate that all scripts in the repository are registered in CLUSTER_REGISTRY.json.

This script is a CI gate to prevent drift by ensuring new scripts are properly
categorized before being merged.

Usage:
    python scripts/validate_cluster_registry.py [--repo-root PATH]

Exit codes:
    0 - All scripts are registered
    1 - Unregistered scripts found
"""

import json
import sys
from pathlib import Path


def detect_repo_root() -> Path:
    """Detect repository root by looking for .git directory."""
    current = Path(__file__).resolve().parent
    while current != current.parent:
        if (current / '.git').exists():
            return current
        current = current.parent
    return Path.cwd()


def get_all_scripts(repo_root: Path) -> set:
    """Get all script files in the scripts/ directory."""
    scripts_dir = repo_root / 'scripts'
    if not scripts_dir.exists():
        return set()
    
    extensions = {'.py', '.ts', '.sh', '.mjs', '.cjs'}
    scripts = set()
    
    for ext in extensions:
        for path in scripts_dir.rglob(f'*{ext}'):
            rel_path = str(path.relative_to(repo_root))
            scripts.add(rel_path)
    
    return scripts


def get_registered_scripts(repo_root: Path) -> set:
    """Get all scripts registered in CLUSTER_REGISTRY.json."""
    registry_path = repo_root / 'docs' / 'governance' / 'CLUSTER_REGISTRY.json'
    
    if not registry_path.exists():
        print(f"ERROR: CLUSTER_REGISTRY.json not found at {registry_path}")
        return set()
    
    with open(registry_path) as f:
        registry = json.load(f)
    
    registered = set()
    
    # Collect from clusters
    for cluster in registry.get('clusters', []):
        for script in cluster.get('canonical_scripts', []):
            registered.add(script)
        for script in cluster.get('deprecated_scripts', []):
            registered.add(script)
    
    # Collect from orphans
    for orphan in registry.get('orphan_scripts', []):
        registered.add(orphan.get('path', ''))
    
    return registered


def main():
    import argparse
    parser = argparse.ArgumentParser(description='Validate cluster registry compliance')
    parser.add_argument('--repo-root', type=str, help='Repository root directory')
    args = parser.parse_args()
    
    repo_root = Path(args.repo_root) if args.repo_root else detect_repo_root()
    repo_root = repo_root.resolve()
    
    print(f"Repository root: {repo_root}")
    
    all_scripts = get_all_scripts(repo_root)
    registered_scripts = get_registered_scripts(repo_root)
    
    # Exclude the validator itself
    all_scripts.discard('scripts/validate_cluster_registry.py')
    
    # Find unregistered scripts
    unregistered = all_scripts - registered_scripts
    
    # Find registered but missing scripts
    missing = registered_scripts - all_scripts
    
    print(f"\nTotal scripts found: {len(all_scripts)}")
    print(f"Registered scripts: {len(registered_scripts)}")
    
    errors = []
    
    if unregistered:
        print(f"\n❌ UNREGISTERED SCRIPTS ({len(unregistered)}):")
        for script in sorted(unregistered):
            print(f"  - {script}")
        errors.append(f"{len(unregistered)} unregistered scripts")
    
    if missing:
        print(f"\n⚠️ REGISTERED BUT MISSING ({len(missing)}):")
        for script in sorted(missing):
            print(f"  - {script}")
        # This is a warning, not an error (scripts may have been removed)
    
    if errors:
        print(f"\n❌ VALIDATION FAILED: {', '.join(errors)}")
        print("\nTo fix: Add unregistered scripts to docs/governance/CLUSTER_REGISTRY.json")
        print("        Either in a cluster's canonical_scripts/deprecated_scripts,")
        print("        or in orphan_scripts with a recommended_label.")
        return 1
    
    print("\n✅ VALIDATION PASSED: All scripts are registered")
    return 0


if __name__ == '__main__':
    sys.exit(main())
