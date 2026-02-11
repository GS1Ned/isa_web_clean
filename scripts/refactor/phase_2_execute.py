#!/usr/bin/env python3
"""Phase 2: Execute documentation relocation (APPROVED)"""
import json, shutil
from pathlib import Path
from datetime import datetime

REPO = Path(__file__).parent.parent.parent
PLAN = json.loads((REPO / "docs/planning/refactoring/MOVE_PLAN.json").read_text())

def execute_moves(batch_size=20):
    """Execute moves in batches"""
    moves = PLAN["moves"]
    total = len(moves)
    executed = []
    
    print(f"🚀 Executing {total} moves in batches of {batch_size}")
    
    for i in range(0, total, batch_size):
        batch = moves[i:i+batch_size]
        batch_num = i // batch_size + 1
        total_batches = (total + batch_size - 1) // batch_size
        
        print(f"\n📦 Batch {batch_num}/{total_batches} ({len(batch)} files)")
        
        for move in batch:
            src = REPO / move["from"]
            dst = REPO / move["to"]
            
            # Create target directory
            dst.parent.mkdir(parents=True, exist_ok=True)
            
            # Move file
            if src.exists():
                shutil.move(str(src), str(dst))
                executed.append({
                    **move,
                    "executed_at": datetime.now().isoformat(),
                    "batch": batch_num
                })
                print(f"   ✓ {move['from']} → {move['to']}")
            else:
                print(f"   ⚠ SKIP: {move['from']} (not found)")
    
    return executed

def main():
    print("=" * 60)
    print("Phase 2: Documentation Relocation")
    print("=" * 60)
    print(f"\n✅ APPROVED - Executing moves")
    print(f"   Total files: {PLAN['total_moves']}")
    print(f"   Batch size: 20")
    
    # Execute
    executed = execute_moves(batch_size=20)
    
    # Save execution log
    log = {
        "version": "1.0",
        "executed_at": datetime.now().isoformat(),
        "total_planned": PLAN["total_moves"],
        "total_executed": len(executed),
        "moves": executed
    }
    
    out = REPO / "docs/planning/refactoring/MOVE_EXECUTION_LOG.json"
    out.write_text(json.dumps(log, indent=2))
    
    print(f"\n✅ Relocation Complete")
    print(f"   Executed: {len(executed)}/{PLAN['total_moves']}")
    print(f"   Log: {out}")
    print(f"\n⚠️  Next: Commit changes to Git")

if __name__ == "__main__":
    main()
