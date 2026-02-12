#!/usr/bin/env python3
"""Semantic validation for runtime contracts and evidence markers"""

import json
import re
from pathlib import Path
from typing import Dict, List, Tuple

REPO_ROOT = Path(__file__).parent.parent.parent
CAPABILITIES = ["ASK_ISA", "NEWS_HUB", "KNOWLEDGE_BASE", "CATALOG", "ESRS_MAPPING", "ADVISORY"]

def validate_contract_entrypoints(contract_path: Path) -> Tuple[int, int, List[str]]:
    """Validate that contract entrypoints exist in filesystem"""
    if not contract_path.exists():
        return 0, 0, ["Contract file not found"]
    
    content = contract_path.read_text()
    errors = []
    
    # Extract file paths from contract
    path_pattern = r'`([^`]+\.(ts|tsx|js|jsx|py|sh|md))`'
    paths = re.findall(path_pattern, content)
    
    total = len(paths)
    valid = 0
    
    for path_match in paths:
        path_str = path_match[0]
        # Skip URLs and generic patterns
        if path_str.startswith('http') or '*' in path_str or '...' in path_str:
            total -= 1
            continue
            
        file_path = REPO_ROOT / path_str
        if file_path.exists():
            valid += 1
        else:
            errors.append(f"Missing: {path_str}")
    
    return valid, total, errors

def validate_evidence_pointers(evidence_file: Path) -> Tuple[int, int, List[str]]:
    """Validate that evidence markers point to existing files"""
    if not evidence_file.exists():
        return 0, 0, ["Evidence file not found"]
    
    with open(evidence_file) as f:
        data = json.load(f)
    
    markers = data.get('markers', [])
    total = len(markers)
    valid = 0
    errors = []
    
    for marker in markers:
        ref = marker.get('reference', '').strip()
        # Skip non-file references
        if not ref or ref.startswith('http') or '/' not in ref:
            total -= 1
            continue
        
        file_path = REPO_ROOT / ref
        if file_path.exists():
            valid += 1
        else:
            errors.append(f"Missing: {ref}")
    
    return valid, total, errors

def validate_schema_references() -> Tuple[int, int, List[str]]:
    """Validate database schema references in contracts"""
    errors = []
    total = 0
    valid = 0
    
    # Check if schema files exist
    schema_files = [
        "drizzle/schema.ts",
        "drizzle/schema_advisory_reports.ts",
        "drizzle/schema_news_hub.ts"
    ]
    
    for schema_file in schema_files:
        total += 1
        path = REPO_ROOT / schema_file
        if path.exists():
            valid += 1
        else:
            errors.append(f"Missing schema: {schema_file}")
    
    return valid, total, errors

def main():
    print("Semantic Validation")
    print("=" * 60)
    
    all_errors = []
    
    # 1. Validate contract entrypoints
    print("\n1. Contract Entrypoint Validation")
    total_entrypoints = 0
    valid_entrypoints = 0
    
    for cap in CAPABILITIES:
        contract_path = REPO_ROOT / f"docs/spec/{cap}/RUNTIME_CONTRACT.md"
        valid, total, errors = validate_contract_entrypoints(contract_path)
        total_entrypoints += total
        valid_entrypoints += valid
        
        status = "✅" if len(errors) == 0 else "⚠️"
        print(f"   {status} {cap}: {valid}/{total} entrypoints valid")
        
        if errors:
            all_errors.extend([f"[{cap}] {e}" for e in errors[:3]])  # First 3 errors
    
    entrypoint_pct = (valid_entrypoints / total_entrypoints * 100) if total_entrypoints > 0 else 0
    print(f"   Overall: {valid_entrypoints}/{total_entrypoints} ({entrypoint_pct:.1f}%)")
    
    # 2. Validate evidence pointers
    print("\n2. Evidence Pointer Validation")
    evidence_file = REPO_ROOT / "docs/planning/refactoring/EVIDENCE_MARKERS.json"
    valid_evidence, total_evidence, evidence_errors = validate_evidence_pointers(evidence_file)
    
    evidence_pct = (valid_evidence / total_evidence * 100) if total_evidence > 0 else 0
    status = "✅" if len(evidence_errors) == 0 else "⚠️"
    print(f"   {status} Evidence: {valid_evidence}/{total_evidence} ({evidence_pct:.1f}%)")
    
    if evidence_errors:
        all_errors.extend([f"[Evidence] {e}" for e in evidence_errors[:5]])
    
    # 3. Validate schema references
    print("\n3. Schema Reference Validation")
    valid_schemas, total_schemas, schema_errors = validate_schema_references()
    
    schema_pct = (valid_schemas / total_schemas * 100) if total_schemas > 0 else 0
    status = "✅" if len(schema_errors) == 0 else "⚠️"
    print(f"   {status} Schemas: {valid_schemas}/{total_schemas} ({schema_pct:.1f}%)")
    
    if schema_errors:
        all_errors.extend([f"[Schema] {e}" for e in schema_errors])
    
    # Overall result
    print("\n" + "=" * 60)
    
    overall_valid = valid_entrypoints + valid_evidence + valid_schemas
    overall_total = total_entrypoints + total_evidence + total_schemas
    overall_pct = (overall_valid / overall_total * 100) if overall_total > 0 else 0
    
    if overall_pct >= 80:
        print(f"✅ PASS: {overall_pct:.1f}% semantic validity (threshold: 80%)")
        exit_code = 0
    else:
        print(f"❌ FAIL: {overall_pct:.1f}% semantic validity (threshold: 80%)")
        exit_code = 1
    
    # Save results
    output = {
        "version": "1.0",
        "generated": "2026-02-12",
        "overall_validity": round(overall_pct, 1),
        "entrypoints": {
            "valid": valid_entrypoints,
            "total": total_entrypoints,
            "percent": round(entrypoint_pct, 1)
        },
        "evidence": {
            "valid": valid_evidence,
            "total": total_evidence,
            "percent": round(evidence_pct, 1)
        },
        "schemas": {
            "valid": valid_schemas,
            "total": total_schemas,
            "percent": round(schema_pct, 1)
        },
        "errors": all_errors[:20]  # First 20 errors
    }
    
    output_path = REPO_ROOT / "docs/planning/refactoring/SEMANTIC_VALIDATION.json"
    with open(output_path, 'w') as f:
        json.dump(output, f, indent=2)
    
    print(f"\nSaved: {output_path.relative_to(REPO_ROOT)}")
    
    if all_errors:
        print(f"\nShowing first {min(10, len(all_errors))} errors:")
        for error in all_errors[:10]:
            print(f"  - {error}")
    
    return exit_code

if __name__ == '__main__':
    exit(main())
