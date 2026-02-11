#!/usr/bin/env python3
"""Phase 0: Full Inventory - Fast parallel execution"""
import os, json, hashlib, subprocess
from pathlib import Path
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed

REPO = Path(__file__).parent.parent.parent
OUT = REPO / "docs/planning/refactoring"
OUT.mkdir(parents=True, exist_ok=True)

CAPABILITIES = ["ASK_ISA", "NEWS_HUB", "KNOWLEDGE_BASE", "CATALOG", "ESRS_MAPPING", "ADVISORY", "CROSS_CUTTING", "META", "UNKNOWN"]

def hash_file(p):
    return hashlib.md5(p.read_bytes()).hexdigest()

def classify_file(p):
    rel = str(p.relative_to(REPO)).lower()
    content = p.read_text(errors='ignore')[:1000].lower()
    
    # Path-based (weight 100)
    path_scores = {cap: 0 for cap in CAPABILITIES}
    if 'ask_isa' in rel or 'ask-isa' in rel: path_scores['ASK_ISA'] = 100
    elif 'news' in rel and ('hub' in rel or 'pipeline' in rel): path_scores['NEWS_HUB'] = 100
    elif 'knowledge' in rel: path_scores['KNOWLEDGE_BASE'] = 100
    elif 'catalog' in rel or 'standards' in rel or 'regulations' in rel: path_scores['CATALOG'] = 100
    elif 'esrs' in rel and 'mapping' in rel: path_scores['ESRS_MAPPING'] = 100
    elif 'advisory' in rel: path_scores['ADVISORY'] = 100
    elif 'governance' in rel or 'planning' in rel or 'evidence' in rel: path_scores['META'] = 100
    
    # Content-based (weight 20)
    if 'ask isa' in content: path_scores['ASK_ISA'] += 20
    if 'news hub' in content or 'news pipeline' in content: path_scores['NEWS_HUB'] += 20
    if 'knowledge base' in content: path_scores['KNOWLEDGE_BASE'] += 20
    if 'catalog' in content or 'catalogue' in content: path_scores['CATALOG'] += 20
    if 'esrs' in content and 'mapping' in content: path_scores['ESRS_MAPPING'] += 20
    if 'advisory' in content: path_scores['ADVISORY'] += 20
    
    max_score = max(path_scores.values())
    if max_score == 0:
        return 'UNKNOWN', 0.0
    
    candidates = [k for k, v in path_scores.items() if v == max_score]
    capability = sorted(candidates)[0]  # Alphabetical tie-break
    confidence = min(max_score / 100.0, 1.0)
    
    return capability, confidence

def process_file(p):
    try:
        stat = p.stat()
        cap, conf = classify_file(p)
        
        return {
            "path": str(p.relative_to(REPO)),
            "type": p.suffix[1:] if p.suffix else "none",
            "size": stat.st_size,
            "hash": hash_file(p),
            "capability": cap,
            "confidence": round(conf, 2),
            "modified": datetime.fromtimestamp(stat.st_mtime).isoformat()
        }
    except Exception as e:
        return {"path": str(p.relative_to(REPO)), "error": str(e)}

def main():
    print("🚀 Phase 0: Full Inventory (Parallel)")
    
    # Collect all files
    patterns = [
        (REPO / "docs").rglob("*.md"),
        (REPO / "server").rglob("*.ts"),
        (REPO / "client/src").rglob("*.tsx"),
        (REPO / "client/src").rglob("*.ts"),
        (REPO / "scripts").rglob("*.py"),
        (REPO / "scripts").rglob("*.sh"),
    ]
    
    files = []
    for pattern in patterns:
        files.extend(list(pattern))
    
    print(f"📋 Found {len(files)} files")
    
    # Parallel processing
    results = []
    with ThreadPoolExecutor(max_workers=8) as executor:
        futures = {executor.submit(process_file, f): f for f in files}
        for i, future in enumerate(as_completed(futures), 1):
            results.append(future.result())
            if i % 50 == 0:
                print(f"   Processed {i}/{len(files)}")
    
    # Generate outputs
    inventory = {
        "version": "1.0",
        "generated": datetime.now().isoformat(),
        "total_files": len(results),
        "files": sorted(results, key=lambda x: x.get("path", ""))
    }
    
    (OUT / "FILE_INVENTORY.json").write_text(json.dumps(inventory, indent=2))
    
    # Summary
    by_cap = {}
    by_conf = {"high": 0, "medium": 0, "low": 0}
    for r in results:
        cap = r.get("capability", "UNKNOWN")
        by_cap[cap] = by_cap.get(cap, 0) + 1
        conf = r.get("confidence", 0)
        if conf >= 0.8: by_conf["high"] += 1
        elif conf >= 0.5: by_conf["medium"] += 1
        else: by_conf["low"] += 1
    
    summary = {
        "by_capability": by_cap,
        "by_confidence": by_conf,
        "unknown_count": by_cap.get("UNKNOWN", 0),
        "unknown_percent": round(by_cap.get("UNKNOWN", 0) / len(results) * 100, 1)
    }
    
    (OUT / "PHASE_0_SUMMARY.json").write_text(json.dumps(summary, indent=2))
    
    print(f"\n✅ Phase 0 Complete")
    print(f"   Files: {len(results)}")
    print(f"   UNKNOWN: {summary['unknown_count']} ({summary['unknown_percent']}%)")
    print(f"   High confidence: {by_conf['high']}")
    print(f"\n📄 Outputs:")
    print(f"   {OUT / 'FILE_INVENTORY.json'}")
    print(f"   {OUT / 'PHASE_0_SUMMARY.json'}")

if __name__ == "__main__":
    main()
