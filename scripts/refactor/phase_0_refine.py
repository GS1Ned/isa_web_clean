#!/usr/bin/env python3
"""Phase 0 Refinement: Improve classification using enhanced rules"""

import json
import re
from pathlib import Path
from typing import Dict, List, Tuple

REPO_ROOT = Path(__file__).parent.parent.parent
INVENTORY_PATH = REPO_ROOT / "docs/planning/refactoring/FILE_INVENTORY.json"

CAPABILITIES = ["ASK_ISA", "NEWS_HUB", "KNOWLEDGE_BASE", "CATALOG", "ESRS_MAPPING", "ADVISORY"]

# Enhanced classification rules
ENHANCED_RULES = {
    'ASK_ISA': {
        'paths': ['ask-isa', 'ask_isa', 'rag', 'query', 'conversation'],
        'keywords': ['ask isa', 'rag', 'query', 'conversation', 'chat', 'q&a', 'question'],
        'files': ['ask-isa.ts', 'rag-', 'conversation-', 'query-']
    },
    'NEWS_HUB': {
        'paths': ['news', 'scraper', 'feed', 'article'],
        'keywords': ['news', 'scraper', 'article', 'feed', 'rss', 'pipeline'],
        'files': ['news-', 'scraper-', 'article-', 'feed-']
    },
    'KNOWLEDGE_BASE': {
        'paths': ['corpus', 'embedding', 'vector', 'search', 'index'],
        'keywords': ['corpus', 'embedding', 'vector', 'search', 'index', 'knowledge'],
        'files': ['corpus-', 'embedding-', 'vector-', 'search-']
    },
    'CATALOG': {
        'paths': ['catalog', 'regulation', 'standard', 'dataset'],
        'keywords': ['catalog', 'regulation', 'standard', 'dataset', 'registry'],
        'files': ['catalog-', 'regulation-', 'standard-', 'dataset-']
    },
    'ESRS_MAPPING': {
        'paths': ['esrs', 'mapping', 'gs1-esrs', 'datapoint'],
        'keywords': ['esrs', 'mapping', 'datapoint', 'gs1-esrs', 'efrag'],
        'files': ['esrs-', 'mapping-', 'datapoint-']
    },
    'ADVISORY': {
        'paths': ['advisory', 'report', 'analysis', 'recommendation'],
        'keywords': ['advisory', 'report', 'analysis', 'recommendation', 'insight'],
        'files': ['advisory-', 'report-', 'analysis-']
    }
}

# Code-specific patterns
CODE_PATTERNS = {
    'server/routers/': 'router_name',
    'server/services/': 'service_name',
    'client/src/pages/': 'page_name',
    'client/src/components/': 'component_name',
}

def classify_by_enhanced_rules(file_path: str) -> Tuple[str, float, List[str]]:
    """Classify using enhanced rules with confidence scoring"""
    
    path_lower = file_path.lower()
    scores = {}
    evidence = []
    
    for cap, rules in ENHANCED_RULES.items():
        score = 0
        
        # Path matching (highest weight)
        for pattern in rules['paths']:
            if pattern in path_lower:
                score += 100
                evidence.append(f"path:{pattern}")
        
        # Filename matching
        filename = Path(file_path).name.lower()
        for pattern in rules['files']:
            if pattern in filename:
                score += 80
                evidence.append(f"file:{pattern}")
        
        # Keyword matching (would need file content)
        # Skipped for performance
        
        if score > 0:
            scores[cap] = score
    
    # Special handling for code files
    for pattern, hint in CODE_PATTERNS.items():
        if pattern in file_path:
            # Extract router/service/page name
            name = Path(file_path).stem
            for cap in CAPABILITIES:
                if cap.lower().replace('_', '-') in name.lower():
                    scores[cap] = scores.get(cap, 0) + 90
                    evidence.append(f"code:{hint}")
    
    # Determine best match
    if not scores:
        return 'UNKNOWN', 0.0, []
    
    best_cap = max(scores, key=scores.get)
    best_score = scores[best_cap]
    confidence = min(best_score / 100, 1.0)
    
    return best_cap, confidence, evidence

def refine_classification():
    """Refine UNKNOWN classifications"""
    
    print("Phase 0 Refinement: Enhanced Classification")
    print("=" * 60)
    
    # Load inventory
    with open(INVENTORY_PATH) as f:
        inventory = json.load(f)
    
    total = len(inventory['files'])
    unknown_before = sum(1 for f in inventory['files'] if f.get('capability') == 'UNKNOWN')
    
    print(f"\nBefore: {unknown_before}/{total} UNKNOWN ({unknown_before/total*100:.1f}%)")
    
    # Reclassify UNKNOWN files
    print("\nReclassifying UNKNOWN files...")
    reclassified = 0
    
    for file_data in inventory['files']:
        if file_data.get('capability') == 'UNKNOWN':
            cap, conf, evidence = classify_by_enhanced_rules(file_data['path'])
            
            if cap != 'UNKNOWN' and conf >= 0.7:
                file_data['capability'] = cap
                file_data['confidence'] = conf
                file_data['evidence'] = evidence
                reclassified += 1
                print(f"  {file_data['path'][:60]:60} → {cap} ({conf:.2f})")
    
    unknown_after = sum(1 for f in inventory['files'] if f.get('capability') == 'UNKNOWN')
    
    print(f"\nAfter: {unknown_after}/{total} UNKNOWN ({unknown_after/total*100:.1f}%)")
    print(f"Reclassified: {reclassified} files")
    print(f"Reduction: {(unknown_before - unknown_after)/unknown_before*100:.1f}%")
    
    # Save updated inventory
    with open(INVENTORY_PATH, 'w') as f:
        json.dump(inventory, f, indent=2)
    
    print(f"\n✅ Updated: {INVENTORY_PATH.relative_to(REPO_ROOT)}")
    
    # Check if target achieved
    if unknown_after / total < 0.05:
        print("\n🎉 TARGET ACHIEVED: UNKNOWN < 5%")
    else:
        print(f"\n⚠️  Still need to classify {unknown_after - int(total * 0.05)} more files")

if __name__ == '__main__':
    refine_classification()
