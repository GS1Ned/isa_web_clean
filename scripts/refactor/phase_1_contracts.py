#!/usr/bin/env python3
"""Phase 1: Generate Runtime Contracts for all capabilities"""
import json
from pathlib import Path
from datetime import datetime

REPO = Path(__file__).parent.parent.parent
INV = json.loads((REPO / "docs/planning/refactoring/FILE_INVENTORY.json").read_text())

CAPABILITIES = {
    "ASK_ISA": {"component": "retrieval", "desc": "Answer user questions via RAG"},
    "NEWS_HUB": {"component": "aggregation", "desc": "Aggregate and enrich ESG news"},
    "KNOWLEDGE_BASE": {"component": "embeddings", "desc": "Manage knowledge embeddings"},
    "CATALOG": {"component": "registry", "desc": "Catalog regulations and standards"},
    "ESRS_MAPPING": {"component": "mapping", "desc": "Map GS1 standards to ESRS"},
    "ADVISORY": {"component": "generation", "desc": "Generate advisory reports"}
}

def find_entrypoints(cap):
    """Find code entrypoints for capability"""
    files = [f for f in INV["files"] if f.get("capability") == cap and f["type"] in ["ts", "tsx"]]
    
    routers = [f["path"] for f in files if "router" in f["path"]]
    services = [f["path"] for f in files if "service" in f["path"] or f["path"].startswith("server/")]
    ui = [f["path"] for f in files if f["path"].startswith("client/")]
    
    return {"routers": routers[:3], "services": services[:3], "ui": ui[:3]}

def generate_contract(cap, meta):
    eps = find_entrypoints(cap)
    
    return f"""---
DOC_TYPE: SPEC
CAPABILITY: {cap}
COMPONENT: {meta['component']}
FUNCTION_LABEL: "{meta['desc']}"
OWNER: gs1ned-isa
STATUS: active
LAST_VERIFIED: {datetime.now().date().isoformat()}
VERIFICATION_METHOD: manual
---

# {cap} Runtime Contract

## Purpose
{meta['desc']}

## Entry Points

### API Endpoints (tRPC)
{chr(10).join(f"- `{r}`" for r in eps['routers']) if eps['routers'] else "- (To be documented)"}

### Services
{chr(10).join(f"- `{s}`" for s in eps['services']) if eps['services'] else "- (To be documented)"}

### UI Components
{chr(10).join(f"- `{u}`" for u in eps['ui']) if eps['ui'] else "- (To be documented)"}

## Inputs/Outputs

### Inputs
- (To be documented based on code analysis)

### Outputs
- (To be documented based on code analysis)

## Invariants

1. (To be documented)
2. (To be documented)

## Failure Modes

### Observable Signals
- (To be documented)

### Recovery Procedures
- (To be documented)

## Data Dependencies

### Database Tables
- (To be documented)

### External APIs
- (To be documented)

## Security/Secrets

### Required Secrets
- (To be documented - names only, no values)

### Authentication
- (To be documented)

## Verification Methods

### Smoke Test
- Location: `scripts/probe/{cap.lower()}_smoke.py`
- Status: {"✅ Exists" if cap == "ASK_ISA" else "⏳ To be created"}

### Integration Tests
- (To be documented)

## Evidence

- Phase 0 Inventory: {sum(1 for f in INV['files'] if f.get('capability') == cap)} files classified as {cap}
- Code entrypoints: {len(eps['routers']) + len(eps['services']) + len(eps['ui'])} identified

---

**Contract Status:** DRAFT  
**Completeness:** ~30% (skeleton only, needs detailed analysis)  
**Next Steps:** Analyze code to populate all sections
"""

def main():
    print("🚀 Phase 1: Generate Runtime Contracts")
    
    for cap, meta in CAPABILITIES.items():
        # Create capability directory
        cap_dir = REPO / "docs/spec" / cap
        cap_dir.mkdir(parents=True, exist_ok=True)
        
        # Generate contract
        contract = generate_contract(cap, meta)
        contract_path = cap_dir / "RUNTIME_CONTRACT.md"
        contract_path.write_text(contract)
        
        print(f"✅ {cap}: {contract_path}")
    
    # Generate summary
    summary = {
        "generated": datetime.now().isoformat(),
        "contracts_created": len(CAPABILITIES),
        "status": "DRAFT",
        "completeness": {cap: 0.3 for cap in CAPABILITIES},
        "next_steps": [
            "Analyze code to populate entrypoints",
            "Document inputs/outputs",
            "Define invariants",
            "Create smoke tests for remaining 5 capabilities"
        ]
    }
    
    out = REPO / "docs/planning/refactoring/PHASE_1_SUMMARY.json"
    out.write_text(json.dumps(summary, indent=2))
    
    print(f"\n✅ Phase 1 Contracts Generated")
    print(f"   Contracts: {len(CAPABILITIES)}")
    print(f"   Completeness: ~30% (skeletons)")
    print(f"   Output: {out}")

if __name__ == "__main__":
    main()
