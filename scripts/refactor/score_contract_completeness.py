#!/usr/bin/env python3
"""Score runtime contract completeness"""

import json
from pathlib import Path
from typing import Dict

REPO_ROOT = Path(__file__).parent.parent.parent
CAPABILITIES = ["ASK_ISA", "NEWS_HUB", "KNOWLEDGE_BASE", "CATALOG", "ESRS_MAPPING", "ADVISORY"]

REQUIRED_SECTIONS = {
    "Entry Points": 15,
    "Inputs/Outputs": 15,
    "Invariants": 10,
    "Failure Modes": 10,
    "Data Dependencies": 15,
    "Security/Secrets": 10,
    "Verification Methods": 10,
    "Evidence": 15
}

def score_contract(contract_path: Path) -> Dict:
    """Score a single contract"""
    if not contract_path.exists():
        return {"score": 0, "sections": {}, "completeness": 0}
    
    content = contract_path.read_text()
    sections = {}
    total_score = 0
    
    for section, max_points in REQUIRED_SECTIONS.items():
        # Check if section exists
        if section in content:
            # Check if section has content (not just "To be documented")
            section_start = content.find(section)
            next_section = content.find("##", section_start + len(section))
            if next_section == -1:
                next_section = len(content)
            
            section_content = content[section_start:next_section]
            
            # Score based on content
            lines = section_content.strip().split('\n')
            content_lines = [l for l in lines if l.strip() and not l.strip().startswith('#')]
            
            if "To be documented" in section_content or "(To be documented)" in section_content:
                points = max_points * 0.3  # Skeleton only
            elif len(content_lines) >= 5:  # 5+ lines of content
                points = max_points  # Complete
            elif len(content_lines) >= 3:  # 3-4 lines
                points = max_points * 0.9  # Nearly complete
            else:
                points = max_points * 0.6  # Partial
            
            sections[section] = {"present": True, "complete": points == max_points, "points": points}
            total_score += points
        else:
            sections[section] = {"present": False, "complete": False, "points": 0}
    
    completeness = (total_score / sum(REQUIRED_SECTIONS.values())) * 100
    
    return {
        "score": round(total_score, 1),
        "max_score": sum(REQUIRED_SECTIONS.values()),
        "completeness": round(completeness, 1),
        "sections": sections
    }

def main():
    print("Contract Completeness Scoring")
    print("=" * 60)
    
    results = {}
    for cap in CAPABILITIES:
        contract_path = REPO_ROOT / f"docs/spec/{cap}/RUNTIME_CONTRACT.md"
        score_data = score_contract(contract_path)
        results[cap] = score_data
        print(f"{cap}: {score_data['completeness']}% ({score_data['score']}/{score_data['max_score']})")
    
    avg_completeness = sum(r['completeness'] for r in results.values()) / len(results)
    print(f"\nOverall: {avg_completeness:.1f}%")
    
    # Save results
    output_path = REPO_ROOT / "docs/planning/refactoring/CONTRACT_COMPLETENESS.json"
    with open(output_path, 'w') as f:
        json.dump({
            "version": "1.0",
            "generated": "2026-02-12",
            "overall_completeness": round(avg_completeness, 1),
            "capabilities": results
        }, f, indent=2)
    print(f"\nSaved: {output_path.relative_to(REPO_ROOT)}")

if __name__ == '__main__':
    main()
