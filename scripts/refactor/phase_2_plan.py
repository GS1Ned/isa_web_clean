#!/usr/bin/env python3
"""Phase 2: Generate documentation relocation plan"""
import json
from pathlib import Path

REPO = Path(__file__).parent.parent.parent
INV = json.loads((REPO / "docs/planning/refactoring/FILE_INVENTORY.json").read_text())

# Target structure
TARGETS = {
    "ASK_ISA": "docs/spec/ASK_ISA",
    "NEWS_HUB": "docs/spec/NEWS_HUB",
    "KNOWLEDGE_BASE": "docs/spec/KNOWLEDGE_BASE",
    "CATALOG": "docs/spec/CATALOG",
    "ESRS_MAPPING": "docs/spec/ESRS_MAPPING",
    "ADVISORY": "docs/spec/ADVISORY",
    "META": "docs/governance",
    "CROSS_CUTTING": "docs/spec/CROSS_CUTTING"
}

def should_move(f):
    """Determine if file should be moved"""
    path = f["path"]
    cap = f.get("capability", "UNKNOWN")
    
    # Skip if already in target location
    if cap in TARGETS and path.startswith(TARGETS[cap]):
        return False
    
    # Skip if UNKNOWN
    if cap == "UNKNOWN":
        return False
    
    # Only move docs for now
    if not path.startswith("docs/"):
        return False
    
    # Skip planning/refactoring
    if "planning/refactoring" in path:
        return False
    
    return True

def generate_target_path(f):
    """Generate target path for file"""
    path = Path(f["path"])
    cap = f["capability"]
    
    # Determine subdirectory based on content
    name = path.stem.lower()
    if "pipeline" in name or "source" in name:
        subdir = ""
    elif "architecture" in name or "design" in name:
        subdir = ""
    elif "guide" in name or "howto" in name:
        subdir = ""
    else:
        subdir = ""
    
    target_dir = TARGETS.get(cap, "docs/spec/UNKNOWN")
    return f"{target_dir}/{path.name}"

def main():
    print("🚀 Phase 2: Generate Relocation Plan")
    
    # Analyze files
    docs = [f for f in INV["files"] if f["type"] == "md"]
    movable = [f for f in docs if should_move(f)]
    
    print(f"📋 Total docs: {len(docs)}")
    print(f"   Movable: {len(movable)}")
    
    # Generate move plan
    moves = []
    for f in movable:
        target = generate_target_path(f)
        moves.append({
            "from": f["path"],
            "to": target,
            "capability": f["capability"],
            "confidence": f.get("confidence", 0),
            "reason": "capability-centric organization"
        })
    
    # Group by capability
    by_cap = {}
    for m in moves:
        cap = m["capability"]
        by_cap[cap] = by_cap.get(cap, 0) + 1
    
    plan = {
        "version": "1.0",
        "phase": "2",
        "total_moves": len(moves),
        "by_capability": by_cap,
        "moves": moves,
        "dry_run": True,
        "notes": [
            "This is a DRY RUN - no files will be moved",
            "Review plan before executing",
            "Links will be updated automatically after moves",
            "Redirects will be generated for all moves"
        ]
    }
    
    out = REPO / "docs/planning/refactoring/MOVE_PLAN.json"
    out.write_text(json.dumps(plan, indent=2))
    
    print(f"\n✅ Move Plan Generated")
    print(f"   Total moves: {len(moves)}")
    print(f"\n   By capability:")
    for cap, count in sorted(by_cap.items()):
        print(f"     {cap}: {count} files")
    print(f"\n📄 Output: {out}")
    print(f"\n⚠️  DRY RUN - Review plan before executing")

if __name__ == "__main__":
    main()
