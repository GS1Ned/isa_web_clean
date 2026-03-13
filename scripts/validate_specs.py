#!/usr/bin/env python3
"""
Spec Validation Script for CI

Validates canonical spec structure and content integrity.

Usage:
    python scripts/validate_specs.py docs/spec/
"""

import sys
import os
import json
import csv
import re
from pathlib import Path


def validate_spec_structure(spec_path: Path) -> list:
    """Validate a canonical spec file has required sections."""
    errors = []
    
    with open(spec_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Required sections for canonical specs
    required_sections = [
        'Core Sources',
        'Invariants'  # Changed from 'Normative Statements' to match actual format
    ]
    
    for section in required_sections:
        if section not in content:
            errors.append(f"{spec_path.name}: Missing required section '{section}'")
    
    # Check for at least one MUST/SHALL/INV statement
    if not re.search(r'\b(MUST|SHALL|INV-)\b', content):
        errors.append(f"{spec_path.name}: No MUST/SHALL/INV statements found")
    
    return errors


def validate_traceability_matrix(matrix_path: Path) -> list:
    """Validate TRACEABILITY_MATRIX.csv structure and content."""
    errors = []
    
    with open(matrix_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        rows = list(reader)
    
    if not rows:
        errors.append("TRACEABILITY_MATRIX.csv: Empty file")
        return errors
    
    # Check required columns
    required_columns = ['canonical_spec', 'claim_id', 'statement', 'source_path']
    for col in required_columns:
        if col not in rows[0]:
            errors.append(f"TRACEABILITY_MATRIX.csv: Missing required column '{col}'")
    
    # Check for untraceable claims - supports both 'status' and 'trace_status' column names
    status_col = 'status' if 'status' in rows[0] else ('trace_status' if 'trace_status' in rows[0] else None)
    if status_col:
        untraceable = [r for r in rows if r.get(status_col) == 'untraceable']
        if untraceable:
            errors.append(f"TRACEABILITY_MATRIX.csv: {len(untraceable)} untraceable claims")
    else:
        errors.append("TRACEABILITY_MATRIX.csv: Missing 'status' or 'trace_status' column for traceability verification")
    
    # Check for empty source paths
    empty_sources = [r for r in rows if not r.get('source_path')]
    if empty_sources:
        errors.append(f"TRACEABILITY_MATRIX.csv: {len(empty_sources)} claims without source_path")
    
    return errors


def validate_run_config(config_path: Path) -> list:
    """Validate RUN_CONFIG.json structure."""
    errors = []
    
    try:
        with open(config_path, 'r') as f:
            config = json.load(f)
    except json.JSONDecodeError as e:
        errors.append(f"RUN_CONFIG.json: Invalid JSON - {e}")
        return errors
    
    # Check required fields
    required_fields = ['version', 'configuration']
    for field in required_fields:
        if field not in config:
            errors.append(f"RUN_CONFIG.json: Missing required field '{field}'")
    
    # Check configuration limits
    if 'configuration' in config:
        cfg = config['configuration']
        if cfg.get('max_core_sources_per_cluster', 0) < 5:
            errors.append("RUN_CONFIG.json: max_core_sources_per_cluster should be >= 5")
    
    return errors


def main():
    if len(sys.argv) < 2:
        print("Usage: python validate_specs.py <spec_directory>")
        sys.exit(1)
    
    spec_dir = Path(sys.argv[1])
    if not spec_dir.exists():
        print(f"ERROR: Directory not found: {spec_dir}")
        sys.exit(1)
    
    all_errors = []
    
    # Validate canonical spec files
    spec_files = list(spec_dir.glob('*.md'))
    spec_files = [f for f in spec_files if f.name not in [
        'ISA_MASTER_SPEC.md', 'CONFLICT_REGISTER.md', 
        'DEPRECATION_MAP.md', 'DECISION_LOG_PHASE3.md', 'README.md'
    ]]
    
    print(f"Validating {len(spec_files)} canonical spec files...")
    for spec_file in spec_files:
        errors = validate_spec_structure(spec_file)
        all_errors.extend(errors)
    
    # Validate TRACEABILITY_MATRIX.csv
    matrix_path = spec_dir / 'TRACEABILITY_MATRIX.csv'
    if matrix_path.exists():
        print("Validating TRACEABILITY_MATRIX.csv...")
        errors = validate_traceability_matrix(matrix_path)
        all_errors.extend(errors)
    else:
        all_errors.append("TRACEABILITY_MATRIX.csv not found")
    
    # Validate RUN_CONFIG.json
    config_path = spec_dir / 'RUN_CONFIG.json'
    if config_path.exists():
        print("Validating RUN_CONFIG.json...")
        errors = validate_run_config(config_path)
        all_errors.extend(errors)
    else:
        all_errors.append("RUN_CONFIG.json not found")
    
    # Report results
    if all_errors:
        print(f"\n❌ VALIDATION FAILED: {len(all_errors)} errors found\n")
        for error in all_errors:
            print(f"  - {error}")
        sys.exit(1)
    else:
        print(f"\n✅ VALIDATION PASSED: All specs valid")
        sys.exit(0)


if __name__ == '__main__':
    main()
