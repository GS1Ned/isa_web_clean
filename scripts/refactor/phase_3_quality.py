#!/usr/bin/env python3
"""Phase 3: Quality & Evidence - Extract evidence markers and generate scorecards"""

import json
import re
from pathlib import Path
from collections import defaultdict
from typing import Dict, List, Set

REPO_ROOT = Path(__file__).parent.parent.parent
INVENTORY_PATH = REPO_ROOT / "docs/planning/refactoring/FILE_INVENTORY.json"
OUTPUT_DIR = REPO_ROOT / "docs/planning/refactoring"

CAPABILITIES = ["ASK_ISA", "NEWS_HUB", "KNOWLEDGE_BASE", "CATALOG", "ESRS_MAPPING", "ADVISORY"]

def extract_evidence_markers(file_path: Path) -> List[Dict]:
    """Extract evidence markers from markdown files"""
    if not file_path.exists():
        return []
    
    # Only scan text files
    if file_path.suffix not in ['.md', '.ts', '.tsx', '.js', '.jsx', '.py', '.sh', '.json', '.yaml', '.yml']:
        return []
    
    markers = []
    try:
        content = file_path.read_text(encoding='utf-8')
        
        # Evidence patterns
        patterns = [
            (r'<!-- EVIDENCE:([^:]+):([^>]+)-->', 'inline'),
            (r'\[EVIDENCE:([^:]+):([^\]]+)\]', 'bracket'),
            (r'@evidence\s+(\w+)\s+(.+)', 'annotation'),
            (r'//\s*EVIDENCE:([^:]+):([^\n]+)', 'comment'),
            (r'#\s*EVIDENCE:([^:]+):([^\n]+)', 'comment'),
        ]
        
        for pattern, marker_type in patterns:
            for match in re.finditer(pattern, content, re.IGNORECASE):
                markers.append({
                    'type': marker_type,
                    'category': match.group(1).strip(),
                    'reference': match.group(2).strip(),
                    'file': str(file_path.relative_to(REPO_ROOT))
                })
    except Exception as e:
        # Skip binary files silently
        pass
    
    return markers

def calculate_quality_score(capability: str, files: List[Dict]) -> Dict:
    """Calculate quality score for a capability"""
    
    total_files = len(files)
    if total_files == 0:
        return {'score': 0, 'grade': 'F', 'metrics': {}}
    
    # Metrics
    has_contract = any(f['path'].endswith('RUNTIME_CONTRACT.md') for f in files)
    has_tests = any('test' in f['path'].lower() for f in files)
    has_docs = any(f['path'].startswith('docs/') for f in files)
    
    doc_files = [f for f in files if f['path'].endswith('.md')]
    code_files = [f for f in files if f['path'].endswith(('.ts', '.tsx'))]
    
    doc_ratio = len(doc_files) / total_files if total_files > 0 else 0
    
    # Scoring
    score = 0
    if has_contract: score += 30
    if has_tests: score += 20
    if has_docs: score += 20
    if doc_ratio >= 0.2: score += 15
    if total_files >= 5: score += 15
    
    # Grade
    if score >= 90: grade = 'A'
    elif score >= 80: grade = 'B'
    elif score >= 70: grade = 'C'
    elif score >= 60: grade = 'D'
    else: grade = 'F'
    
    return {
        'score': score,
        'grade': grade,
        'metrics': {
            'total_files': total_files,
            'has_contract': has_contract,
            'has_tests': has_tests,
            'has_docs': has_docs,
            'doc_files': len(doc_files),
            'code_files': len(code_files),
            'doc_ratio': round(doc_ratio, 2)
        }
    }

def generate_scorecards():
    """Generate quality scorecards for all capabilities"""
    
    print("Phase 3: Quality & Evidence")
    print("=" * 60)
    
    # Load inventory
    with open(INVENTORY_PATH) as f:
        inventory = json.load(f)
    
    # Group by capability
    by_capability = defaultdict(list)
    for file_data in inventory['files']:
        cap = file_data.get('capability', 'UNKNOWN')
        by_capability[cap].append(file_data)
    
    # Extract evidence markers
    print("\n1. Extracting evidence markers...")
    all_evidence = []
    
    # Scan inventory files
    for file_data in inventory['files']:
        file_path = REPO_ROOT / file_data['path']
        markers = extract_evidence_markers(file_path)
        all_evidence.extend(markers)
    
    # Also scan runtime contracts directly (may not be in inventory)
    for cap in CAPABILITIES:
        contract_path = REPO_ROOT / f"docs/spec/{cap}/RUNTIME_CONTRACT.md"
        if contract_path.exists():
            markers = extract_evidence_markers(contract_path)
            all_evidence.extend(markers)
    
    print(f"   Found {len(all_evidence)} evidence markers")
    
    # Generate scorecards
    print("\n2. Generating quality scorecards...")
    scorecards = {}
    for cap in CAPABILITIES:
        files = by_capability.get(cap, [])
        scorecards[cap] = calculate_quality_score(cap, files)
        print(f"   {cap}: {scorecards[cap]['grade']} ({scorecards[cap]['score']}/100)")
    
    # Calculate overall score
    avg_score = sum(s['score'] for s in scorecards.values()) / len(scorecards)
    print(f"\n   Overall Average: {avg_score:.1f}/100")
    
    # Save outputs
    print("\n3. Saving outputs...")
    
    evidence_output = OUTPUT_DIR / "EVIDENCE_MARKERS.json"
    with open(evidence_output, 'w') as f:
        json.dump({
            'version': '1.0',
            'generated': '2026-02-12',
            'total_markers': len(all_evidence),
            'markers': all_evidence
        }, f, indent=2)
    print(f"   Saved: {evidence_output.relative_to(REPO_ROOT)}")
    
    scorecard_output = OUTPUT_DIR / "QUALITY_SCORECARDS.json"
    with open(scorecard_output, 'w') as f:
        json.dump({
            'version': '1.0',
            'generated': '2026-02-12',
            'overall_score': round(avg_score, 1),
            'capabilities': scorecards
        }, f, indent=2)
    print(f"   Saved: {scorecard_output.relative_to(REPO_ROOT)}")
    
    # Generate summary report
    summary_output = OUTPUT_DIR / "PHASE_3_SUMMARY.md"
    with open(summary_output, 'w') as f:
        f.write("# Phase 3: Quality & Evidence Summary\n\n")
        f.write(f"**Generated:** 2026-02-12\n\n")
        f.write(f"## Overall Score: {avg_score:.1f}/100\n\n")
        f.write("## Capability Scorecards\n\n")
        f.write("| Capability | Grade | Score | Files | Contract | Tests | Docs |\n")
        f.write("|------------|-------|-------|-------|----------|-------|------|\n")
        for cap in CAPABILITIES:
            sc = scorecards[cap]
            m = sc['metrics']
            f.write(f"| {cap} | {sc['grade']} | {sc['score']}/100 | {m['total_files']} | "
                   f"{'✅' if m['has_contract'] else '❌'} | "
                   f"{'✅' if m['has_tests'] else '❌'} | "
                   f"{'✅' if m['has_docs'] else '❌'} |\n")
        f.write(f"\n## Evidence Markers: {len(all_evidence)}\n\n")
        f.write("Evidence markers provide traceability from implementation to requirements.\n")
    
    print(f"   Saved: {summary_output.relative_to(REPO_ROOT)}")
    
    print("\n✅ Phase 3 Complete")
    print(f"   - Evidence markers: {len(all_evidence)}")
    print(f"   - Overall score: {avg_score:.1f}/100")
    print(f"   - Outputs: 3 files generated")

if __name__ == '__main__':
    generate_scorecards()
