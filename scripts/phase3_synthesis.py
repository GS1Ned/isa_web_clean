#!/usr/bin/env python3
"""
Phase 3 Canonical Spec Synthesis Script
Creates ISA_MASTER_SPEC layer with traceable canonical specifications
"""

import json
import os
import re
import csv
from collections import defaultdict
from pathlib import Path

REPO_PATH = '/home/ubuntu/isa_repo'
OUTPUT_PATH = '/home/ubuntu/isa_repo/docs/spec'
ARTIFACTS_PATH = '/home/ubuntu/outputs'

# Primary Authority Spine (NORMATIVE_CANDIDATE docs)
PRIMARY_AUTHORITY = [
    'ARCHITECTURE.md',
    'GOVERNANCE.md',
    'IRON_PROTOCOL.md',
    'ISA_GOVERNANCE.md',
    'docs/CODEX_DELEGATION_SPEC.md',
    'docs/FILE_SYSTEM_MEMORY_ARCHITECTURE.md',
    'docs/GOVERNANCE_SELF_CHECK_2025-12-17.md',
    'docs/GS1_Attribute_Mapper_Technical_Specification.md',
    'docs/ISA_INFORMATION_ARCHITECTURE.md',
    'docs/PIPELINE_OBSERVABILITY_SPEC.md',
    'docs/agent_collaboration/MANUS_CHATGPT_PROTOCOL.md',
    'docs/governance/ISA_MANUS_PROJECT_GOVERNANCE.md'
]

# Normalized cluster names to kebab-case filenames
CLUSTER_FILENAMES = {
    'ISA Core Architecture': 'isa-core-architecture.md',
    'Data & Knowledge Model': 'data-knowledge-model.md',
    'Governance & IRON Protocol': 'governance-iron-protocol.md',
    'Ingestion & Update Lifecycle': 'ingestion-update-lifecycle.md',
    'Catalogue Obligation & Source Registry': 'catalogue-source-registry.md',
    'Retrieval / Embeddings / Grounding': 'retrieval-embeddings-grounding.md',
    'Evaluation Governance & Reproducibility': 'evaluation-governance-reproducibility.md',
    'Observability / Tracing / Production Feedback': 'observability-tracing-feedback.md',
    'Repo Structure / Change Control / Release Discipline': 'repo-change-control-release.md',
    'Agent & Prompt Governance': 'agent-prompt-governance.md',
    'UX & User Journey': 'ux-user-journey.md',
    'Roadmap / Evolution': 'roadmap-evolution.md'
}

def load_artifacts():
    with open(f'{ARTIFACTS_PATH}/cluster_map.json') as f:
        clusters = json.load(f)
    with open(f'{ARTIFACTS_PATH}/document_index.json') as f:
        doc_index = json.load(f)
    with open(f'{ARTIFACTS_PATH}/authority_candidates.json') as f:
        authority = json.load(f)
    return clusters, doc_index, authority

def read_document(path):
    full_path = os.path.join(REPO_PATH, path.lstrip('./'))
    try:
        with open(full_path, 'r', encoding='utf-8', errors='replace') as f:
            return f.read()
    except:
        return None

def extract_claims(content, path):
    claims = []
    lines = content.split('\n')
    current_heading = "Introduction"
    
    for line in lines:
        heading_match = re.match(r'^#+\s+(.+)$', line)
        if heading_match:
            current_heading = heading_match.group(1)
            continue
        
        normative_patterns = [
            (r'\b(MUST|SHALL|REQUIRED)\b', 'explicit'),
            (r'\b(should|recommend|ensure|verify|validate)\b', 'implicit')
        ]
        
        for pattern, intent in normative_patterns:
            if re.search(pattern, line, re.IGNORECASE):
                words = line.split()[:25]
                quote = ' '.join(words)
                if len(quote) > 10:
                    claims.append({
                        'statement': line.strip(),
                        'source_path': path,
                        'source_heading': current_heading,
                        'short_quote': quote[:100],
                        'normative_intent': intent
                    })
                break
    
    return claims

def select_core_sources(cluster, doc_index):
    core_docs = cluster['included_documents']
    secondary_docs = cluster['secondary_documents']
    all_docs = core_docs + secondary_docs
    
    doc_lookup = {d['path']: d for d in doc_index}
    
    scored = []
    for path in all_docs:
        doc = doc_lookup.get(path, {})
        score = 0
        
        if doc.get('document_status') == 'NORMATIVE_CANDIDATE':
            score += 10
        if doc.get('normative_intent') == 'explicit':
            score += 5
        elif doc.get('normative_intent') == 'implicit':
            score += 2
        if doc.get('authority_candidate'):
            score += 3
        
        clean_path = path.lstrip('./')
        if clean_path in PRIMARY_AUTHORITY:
            score += 15
        if path in core_docs:
            score += 2
        
        scored.append((path, score, doc))
    
    scored.sort(key=lambda x: x[1], reverse=True)
    selected = scored[:min(15, max(5, len(scored)))]
    
    return [s[0] for s in selected]

def generate_canonical_spec(cluster_name, core_sources, all_claims):
    filename = CLUSTER_FILENAMES.get(cluster_name, cluster_name.lower().replace(' ', '-') + '.md')
    
    cluster_claims = [c for c in all_claims if c['source_path'] in core_sources]
    
    seen_statements = set()
    unique_claims = []
    for claim in cluster_claims:
        stmt_key = claim['statement'][:50].lower()
        if stmt_key not in seen_statements:
            seen_statements.add(stmt_key)
            unique_claims.append(claim)
    
    spec = f"""# {cluster_name}

**Canonical Specification**
**Status:** CURRENT (as-built)
**Generated:** 2026-02-03

## 1. Identity

- **Name:** {cluster_name}
- **Scope:** This specification defines the CURRENT state of {cluster_name.lower()} within ISA.
- **Marker:** CURRENT (as-built) — not ULTIMATE (ambition/research)

## 2. Core Sources

The following documents form the authoritative basis for this specification:

"""
    for i, src in enumerate(core_sources[:10], 1):
        spec += f"{i}. `{src}`\n"
    
    spec += f"""
## 3. Definitions

*Terms used in this specification are defined in ISA_MASTER_SPEC.md*

## 4. Invariants (MUST-level)

"""
    must_claims = [c for c in unique_claims if c['normative_intent'] == 'explicit']
    if must_claims:
        for i, claim in enumerate(must_claims[:15], 1):
            spec += f"**INV-{i}:** {claim['statement'][:200]}\n"
            spec += f"- Source: `{claim['source_path']}` > {claim['source_heading']}\n\n"
    else:
        spec += "*No explicit MUST-level invariants extracted. See OPEN ISSUES.*\n\n"
    
    spec += """## 5. Interfaces / Pipelines / Entry Points

*CURRENT implementation details extracted from source documents.*

## 6. Governance & Change Control

Changes to this specification require:
1. Review of source documents
2. Update to TRACEABILITY_MATRIX.csv
3. Approval per ISA governance rules

## 7. Observability & Evaluation Hooks

"""
    if 'Observability' in cluster_name or 'Evaluation' in cluster_name:
        spec += "*See source documents for detailed observability requirements.*\n\n"
    else:
        spec += "**OPEN ISSUE:** Observability hooks not fully defined for this cluster.\n\n"
    
    spec += """## 8. Acceptance Criteria / IRON Gates

"""
    implicit_claims = [c for c in unique_claims if c['normative_intent'] == 'implicit'][:5]
    if implicit_claims:
        for i, claim in enumerate(implicit_claims, 1):
            spec += f"- AC-{i}: {claim['statement'][:150]}\n"
    else:
        spec += "*Acceptance criteria to be derived from IRON protocol.*\n"
    
    spec += f"""
## 9. Traceability Annex

| Claim ID | Statement (truncated) | Source |
|----------|----------------------|--------|
"""
    for i, claim in enumerate(unique_claims[:20], 1):
        stmt = claim['statement'][:60].replace('|', '/').replace('\n', ' ')
        spec += f"| {cluster_name[:3].upper()}-{i:03d} | {stmt}... | `{claim['source_path']}` |\n"
    
    return filename, spec, unique_claims

def generate_master_spec(clusters, cluster_sources):
    spec = """# ISA Master Specification

**Version:** 1.0
**Status:** CURRENT (as-built)
**Generated:** 2026-02-03

## 1. Purpose

This document serves as the authoritative index for the ISA (Intelligent Standards Assistant) canonical specification layer.

## 2. Scope

This specification covers the CURRENT (as-built) state of ISA. ULTIMATE (ambition/research) items are explicitly marked.

## 3. Document Precedence Rules

1. **ISA_MASTER_SPEC.md** — This document; defines structure and precedence
2. **Canonical Spec Documents** — One per cluster; authoritative for their domain
3. **Primary Authority Spine** — Source documents with NORMATIVE_CANDIDATE status
4. **Supporting Documents** — Informative; do not override canonical specs

## 4. Definitions

| Term | Definition |
|------|------------|
| CURRENT | The as-built, production state of ISA |
| ULTIMATE | Aspirational/research goals not yet implemented |
| IRON Gate | Quality checkpoint that must pass before release |
| Normative | Statements using MUST/SHALL/REQUIRED language |
| Informative | Supporting context without binding requirements |

## 5. Canonical Specifications

| Cluster | Canonical Spec | Core Sources |
|---------|---------------|--------------|
"""
    for cluster in clusters:
        name = cluster['cluster_name']
        filename = CLUSTER_FILENAMES.get(name, name.lower().replace(' ', '-') + '.md')
        sources = cluster_sources.get(name, [])
        spec += f"| {name} | [{filename}]({filename}) | {len(sources)} |\n"
    
    spec += """
## 6. Core Sources per Cluster

"""
    for cluster in clusters:
        name = cluster['cluster_name']
        sources = cluster_sources.get(name, [])
        spec += f"### {name}\n\n"
        for src in sources[:10]:
            spec += f"- `{src}`\n"
        spec += "\n"
    
    spec += """## 7. Change Control

Updates to canonical specifications require:
1. Identification of source document changes
2. Update to relevant canonical spec
3. Update to TRACEABILITY_MATRIX.csv
4. Review per ISA governance rules

## 8. References

- TRACEABILITY_MATRIX.csv — Full claim traceability
- CONFLICT_REGISTER.md — Documented conflicts and resolutions
- DEPRECATION_MAP.md — Document status mapping
"""
    return spec

def generate_conflict_register(clusters):
    register = """# ISA Conflict Register

**Generated:** 2026-02-03

This document records conflicts identified during canonical spec synthesis.

## Conflict Summary

| Cluster | Conflict Topic | Status |
|---------|---------------|--------|
"""
    for cluster in clusters:
        name = cluster['cluster_name']
        conflicts = cluster.get('conflict_sets', [])
        for conflict in conflicts[:3]:
            topic = conflict.get('topic', 'Unknown')
            register += f"| {name} | {topic} | OPEN ISSUE |\n"
    
    register += """
## Detailed Conflicts

"""
    for cluster in clusters:
        name = cluster['cluster_name']
        conflicts = cluster.get('conflict_sets', [])
        if conflicts:
            register += f"### {name}\n\n"
            for conflict in conflicts:
                topic = conflict.get('topic', 'Unknown')
                docs = conflict.get('documents', [])[:3]
                register += f"**Topic:** {topic}\n"
                register += f"**Competing Sources:**\n"
                for doc in docs:
                    register += f"- `{doc}`\n"
                register += f"**Resolution:** OPEN ISSUE — requires manual review\n\n"
    
    return register

def generate_deprecation_map(clusters, cluster_sources, doc_index):
    dep_map = """# ISA Deprecation Map

**Generated:** 2026-02-03

This document maps source documents to their canonical specification status.

## Status Legend

- **active** — Document is a core source for a canonical spec
- **superseded** — Document content merged into canonical spec
- **historical** — Document retained for reference only
- **supporting** — Document provides context but is not normative

## Document Mapping

| Source Document | Canonical Spec | Status |
|-----------------|---------------|--------|
"""
    all_sources = set()
    source_to_cluster = {}
    
    for cluster in clusters:
        name = cluster['cluster_name']
        filename = CLUSTER_FILENAMES.get(name, name.lower().replace(' ', '-') + '.md')
        sources = cluster_sources.get(name, [])
        
        for src in sources:
            all_sources.add(src)
            source_to_cluster[src] = filename
    
    for auth in PRIMARY_AUTHORITY:
        path = './' + auth if not auth.startswith('./') else auth
        if path not in all_sources:
            all_sources.add(path)
    
    for src in sorted(all_sources):
        canonical = source_to_cluster.get(src, 'N/A')
        status = 'active' if src in source_to_cluster else 'supporting'
        dep_map += f"| `{src}` | {canonical} | {status} |\n"
    
    dep_map += """
## Historical Documents

The following documents are marked as HISTORICAL and retained for reference:

"""
    for doc in doc_index:
        if doc.get('document_status') == 'HISTORICAL':
            dep_map += f"- `{doc['path']}` — {doc.get('title', 'Untitled')}\n"
    
    return dep_map

def main():
    print("Loading Phase 1-2 artifacts...")
    clusters, doc_index, authority = load_artifacts()
    
    print(f"Found {len(clusters)} clusters")
    
    os.makedirs(OUTPUT_PATH, exist_ok=True)
    
    all_claims = []
    cluster_sources = {}
    traceability_rows = []
    
    for cluster in clusters:
        cluster_name = cluster['cluster_name']
        print(f"\nProcessing: {cluster_name}")
        
        core_sources = select_core_sources(cluster, doc_index)
        cluster_sources[cluster_name] = core_sources
        print(f"  Selected {len(core_sources)} core sources")
        
        cluster_claims = []
        for src in core_sources:
            content = read_document(src)
            if content:
                claims = extract_claims(content, src)
                cluster_claims.extend(claims)
        
        print(f"  Extracted {len(cluster_claims)} claims")
        all_claims.extend(cluster_claims)
        
        filename, spec_content, unique_claims = generate_canonical_spec(
            cluster_name, core_sources, cluster_claims
        )
        
        spec_path = os.path.join(OUTPUT_PATH, filename)
        with open(spec_path, 'w') as f:
            f.write(spec_content)
        print(f"  Created: {filename}")
        
        for i, claim in enumerate(unique_claims[:20], 1):
            claim_id = f"{cluster_name[:3].upper()}-{i:03d}"
            traceability_rows.append({
                'canonical_spec': filename,
                'claim_id': claim_id,
                'statement': claim['statement'][:200],
                'source_path': claim['source_path'],
                'source_heading': claim['source_heading'],
                'short_quote': claim['short_quote'][:100],
                'status': 'traceable'
            })
    
    print("\nGenerating ISA_MASTER_SPEC.md...")
    master_spec = generate_master_spec(clusters, cluster_sources)
    with open(os.path.join(OUTPUT_PATH, 'ISA_MASTER_SPEC.md'), 'w') as f:
        f.write(master_spec)
    
    print("Generating TRACEABILITY_MATRIX.csv...")
    with open(os.path.join(OUTPUT_PATH, 'TRACEABILITY_MATRIX.csv'), 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=[
            'canonical_spec', 'claim_id', 'statement', 'source_path',
            'source_heading', 'short_quote', 'status'
        ])
        writer.writeheader()
        writer.writerows(traceability_rows)
    
    print("Generating CONFLICT_REGISTER.md...")
    conflict_register = generate_conflict_register(clusters)
    with open(os.path.join(OUTPUT_PATH, 'CONFLICT_REGISTER.md'), 'w') as f:
        f.write(conflict_register)
    
    print("Generating DEPRECATION_MAP.md...")
    deprecation_map = generate_deprecation_map(clusters, cluster_sources, doc_index)
    with open(os.path.join(OUTPUT_PATH, 'DEPRECATION_MAP.md'), 'w') as f:
        f.write(deprecation_map)
    
    print("\n" + "="*60)
    print("Phase 3 synthesis complete!")
    print(f"  Created {len(clusters)} canonical specs")
    print(f"  Total traceable claims: {len(traceability_rows)}")
    print("="*60)

if __name__ == '__main__':
    main()
