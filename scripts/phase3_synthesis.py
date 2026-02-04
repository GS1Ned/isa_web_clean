#!/usr/bin/env python3
"""
Phase 3 Canonical Spec Synthesis Script

Creates ISA_MASTER_SPEC layer with traceable canonical specifications.

Usage:
    python scripts/phase3_synthesis.py --inputs <path> --out docs/spec
    python scripts/phase3_synthesis.py --config docs/spec/RUN_CONFIG.json

Environment Variables (optional overrides):
    ISA_REPO_ROOT       - Repository root directory
    ISA_PHASE3_INPUTS   - Path to Phase 1-2 artifacts
    ISA_PHASE3_OUT      - Output directory for specs

Required Inputs:
    - document_index.json
    - cluster_map.json
    - authority_candidates.json
"""

import argparse
import json
import os
import re
import csv
import sys
from pathlib import Path
from collections import defaultdict


def detect_repo_root():
    """Auto-detect repository root by looking for .git directory."""
    current = Path.cwd()
    for parent in [current] + list(current.parents):
        if (parent / '.git').exists():
            return parent
    return current


def validate_inputs(inputs_path: Path, required_files: list) -> list:
    """Validate that all required input files exist. Returns list of missing files."""
    missing = []
    for f in required_files:
        if not (inputs_path / f).exists():
            missing.append(str(inputs_path / f))
    return missing


def validate_output_path(out_path: Path, repo_root: Path, allow_external: bool = False) -> bool:
    """Validate output path is inside repo root unless explicitly allowed."""
    try:
        out_path.resolve().relative_to(repo_root.resolve())
        return True
    except ValueError:
        if allow_external:
            return True
        return False


def load_config(config_path: Path) -> dict:
    """Load configuration from RUN_CONFIG.json."""
    with open(config_path) as f:
        return json.load(f)


def load_artifacts(inputs_path: Path):
    """Load Phase 1-2 artifacts."""
    with open(inputs_path / 'cluster_map.json') as f:
        clusters = json.load(f)
    with open(inputs_path / 'document_index.json') as f:
        doc_index = json.load(f)
    with open(inputs_path / 'authority_candidates.json') as f:
        authority = json.load(f)
    return clusters, doc_index, authority


def read_document(repo_root: Path, path: str) -> str:
    """Read a document from the repository."""
    clean_path = path.lstrip('./')
    full_path = repo_root / clean_path
    try:
        with open(full_path, 'r', encoding='utf-8', errors='replace') as f:
            return f.read()
    except Exception:
        return None


def extract_claims(content: str, path: str) -> list:
    """Extract normative claims from document content."""
    claims = []
    lines = content.split('\n')
    current_heading = "Introduction"
    
    for line in lines:
        heading_match = re.match(r'^#+\s+(.+)$', line)
        if heading_match:
            current_heading = heading_match.group(1)
            continue
        
        patterns = [
            (r'\b(MUST|SHALL|REQUIRED)\b', 'explicit'),
            (r'\b(should|recommend|ensure|verify|validate)\b', 'implicit')
        ]
        
        for pattern, intent in patterns:
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


def select_core_sources(cluster: dict, doc_index: list, config: dict) -> list:
    """Select core sources for a cluster based on scoring weights."""
    core_docs = cluster.get('included_documents', [])
    secondary_docs = cluster.get('secondary_documents', [])
    all_docs = core_docs + secondary_docs
    
    doc_lookup = {d['path']: d for d in doc_index}
    
    weights = config.get('scoring_weights', {})
    primary_authority = config.get('primary_authority_spine', [])
    limits = config.get('configuration', {})
    
    max_sources = limits.get('max_core_sources_per_cluster', 15)
    min_sources = limits.get('min_core_sources_per_cluster', 5)
    
    scored = []
    for path in all_docs:
        doc = doc_lookup.get(path, {})
        score = 0
        
        if doc.get('document_status') == 'NORMATIVE_CANDIDATE':
            score += weights.get('NORMATIVE_CANDIDATE_status', 10)
        if doc.get('normative_intent') == 'explicit':
            score += weights.get('explicit_normative_intent', 5)
        elif doc.get('normative_intent') == 'implicit':
            score += weights.get('implicit_normative_intent', 2)
        if doc.get('authority_candidate'):
            score += weights.get('authority_candidate', 3)
        
        clean_path = path.lstrip('./')
        if clean_path in primary_authority:
            score += weights.get('primary_authority_spine', 15)
        if path in core_docs:
            score += weights.get('core_document_in_cluster', 2)
        
        scored.append((path, score, doc))
    
    scored.sort(key=lambda x: x[1], reverse=True)
    return [s[0] for s in scored[:min(max_sources, max(min_sources, len(scored)))]]


def to_kebab_case(name: str) -> str:
    """Convert cluster name to kebab-case filename."""
    return re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-') + '.md'


def generate_spec(cluster_name: str, core_sources: list, claims: list, 
                  filename: str, config: dict) -> tuple:
    """Generate a canonical specification document."""
    cluster_claims = [c for c in claims if c['source_path'] in core_sources]
    
    # Sort claims to prioritize authority spine documents
    primary_authority = set(config.get('primary_authority_spine', []))
    def claim_priority(c):
        clean_path = c['source_path'].lstrip('./')
        is_authority = 1 if clean_path in primary_authority else 0
        is_explicit = 1 if c['normative_intent'] == 'explicit' else 0
        return (is_authority, is_explicit)
    
    cluster_claims.sort(key=claim_priority, reverse=True)
    
    seen = set()
    unique = []
    for c in cluster_claims:
        key = c['statement'][:50].lower()
        if key not in seen:
            seen.add(key)
            unique.append(c)
    
    limits = config.get('configuration', {})
    max_invariants = limits.get('max_must_invariants_per_spec', 15)
    max_implicit = limits.get('max_implicit_claims_per_spec', 5)
    max_traceability = limits.get('max_claims_in_traceability_per_cluster', 20)
    
    spec = f"""# {cluster_name}

**Canonical Specification**
**Status:** CURRENT (as-built)

## 1. Identity

- **Name:** {cluster_name}
- **Scope:** CURRENT state of {cluster_name.lower()}
- **Marker:** CURRENT (as-built) — not ULTIMATE

## 2. Core Sources

"""
    for i, src in enumerate(core_sources[:10], 1):
        spec += f"{i}. `{src}`\n"
    
    spec += """
## 3. Definitions

*See ISA_MASTER_SPEC.md*

## 4. Invariants (MUST-level)

"""
    must = [c for c in unique if c['normative_intent'] == 'explicit']
    if must:
        for i, c in enumerate(must[:max_invariants], 1):
            spec += f"**INV-{i}:** {c['statement'][:200]}\n"
            spec += f"- Source: `{c['source_path']}` > {c['source_heading']}\n\n"
    else:
        spec += "*No explicit MUST-level invariants. See OPEN ISSUES.*\n\n"
    
    spec += """## 5. Interfaces / Pipelines

*See source documents.*

## 6. Governance & Change Control

1. Review source documents
2. Update TRACEABILITY_MATRIX.csv
3. Follow governance rules

## 7. Observability

"""
    if 'Observability' in cluster_name or 'Evaluation' in cluster_name:
        spec += "*See source documents.*\n\n"
    else:
        spec += "**OPEN ISSUE:** Define observability hooks.\n\n"
    
    spec += """## 8. Acceptance Criteria

"""
    implicit = [c for c in unique if c['normative_intent'] == 'implicit'][:max_implicit]
    for i, c in enumerate(implicit, 1):
        spec += f"- AC-{i}: {c['statement'][:150]}\n"
    
    spec += """
## 9. Traceability Annex

| Claim ID | Statement | Source |
|----------|-----------|--------|
"""
    prefix = cluster_name[:3].upper()
    for i, c in enumerate(unique[:max_traceability], 1):
        stmt = c['statement'][:60].replace('|', '/').replace('\n', ' ')
        spec += f"| {prefix}-{i:03d} | {stmt}... | `{c['source_path']}` |\n"
    
    return spec, unique[:max_traceability]


def generate_master_spec(clusters: list, cluster_sources: dict, filenames: dict) -> str:
    """Generate ISA_MASTER_SPEC.md."""
    spec = """# ISA Master Specification

**Status:** CURRENT (as-built)

## 1. Purpose

Authoritative index for canonical specifications.

## 2. Document Precedence

1. ISA_MASTER_SPEC.md
2. Canonical Spec Documents
3. Primary Authority Spine
4. Supporting Documents

## 3. Definitions

| Term | Definition |
|------|------------|
| CURRENT | As-built production state |
| ULTIMATE | Aspirational goals |
| IRON Gate | Quality checkpoint |
| Normative | MUST/SHALL/REQUIRED |

## 4. Canonical Specifications

| Cluster | Spec | Sources |
|---------|------|---------|
"""
    for c in clusters:
        name = c['cluster_name']
        fn = filenames.get(name, to_kebab_case(name))
        sources = cluster_sources.get(name, [])
        spec += f"| {name} | [{fn}]({fn}) | {len(sources)} |\n"
    
    spec += """
## 5. Core Sources

"""
    for c in clusters:
        name = c['cluster_name']
        sources = cluster_sources.get(name, [])
        spec += f"### {name}\n\n"
        for s in sources[:10]:
            spec += f"- `{s}`\n"
        spec += "\n"
    
    return spec


def generate_conflict_register(clusters: list, repo_root=None) -> str:
    """Generate CONFLICT_REGISTER.md with resolvable structure."""
    
    # Prioritize conflicts by topic importance
    priority_topics = {
        'gate_definitions': 'High',
        'normative_rules': 'High', 
        'embedding_model': 'Medium',
        'retrieval_strategy': 'Medium',
        'database_config': 'Low'
    }
    
    reg = """# Conflict Register

**Status:** Phase 3 Synthesis
**Last Updated:** 2026-02-04

## Overview

This register documents semantic conflicts identified during Phase 3 canonical spec synthesis. Each conflict represents competing or contradictory statements across source documents that require manual resolution.

## Conflict Summary

| Conflict ID | Cluster | Topic | Priority | Status | Owner |
|-------------|---------|-------|----------|--------|-------|
"""
    conflict_id = 1
    all_conflicts = []
    
    for c in clusters:
        for conf in c.get('conflict_sets', [])[:5]:
            topic = conf.get('topic', 'Unknown')[:40]
            priority = priority_topics.get(topic, 'Medium')
            all_conflicts.append({
                'id': conflict_id,
                'cluster': c['cluster_name'],
                'topic': topic,
                'priority': priority,
                'docs': conf.get('documents', [])[:3]
            })
            reg += f"| CONF-{conflict_id:03d} | {c['cluster_name'][:25]} | {topic} | {priority} | OPEN | TBD |\n"
            conflict_id += 1
    
    total_conflicts = conflict_id - 1
    high_priority = len([c for c in all_conflicts if c['priority'] == 'High'])
    medium_priority = len([c for c in all_conflicts if c['priority'] == 'Medium'])
    low_priority = len([c for c in all_conflicts if c['priority'] == 'Low'])
    
    reg += f"""
## Statistics

| Metric | Count |
|--------|-------|
| Total Conflicts | {total_conflicts} |
| High Priority | {high_priority} |
| Medium Priority | {medium_priority} |
| Low Priority | {low_priority} |
| Open | {total_conflicts} |
| Resolved | 0 |

## Top 10 High-Impact Conflicts

These conflicts should be resolved first as they affect core governance and normative rules.

"""
    # Show top 10 high priority conflicts
    high_conflicts = [c for c in all_conflicts if c['priority'] == 'High'][:10]
    for conf in high_conflicts:
        reg += f"### CONF-{conf['id']:03d}: {conf['topic']} ({conf['cluster']})\n\n"
        reg += "| Field | Value |\n"
        reg += "|-------|-------|\n"
        reg += f"| **Conflict ID** | CONF-{conf['id']:03d} |\n"
        reg += f"| **Cluster** | {conf['cluster']} |\n"
        reg += f"| **Topic** | {conf['topic']} |\n"
        reg += f"| **Priority** | {conf['priority']} |\n"
        reg += f"| **Status** | OPEN |\n"
        reg += f"| **Owner** | TBD |\n\n"
        
        reg += "**Competing Documents:**\n\n"
        for i, doc in enumerate(conf['docs'], 1):
            reg += f"- **Source {chr(64+i)}:** `{doc}`\n"
        
        reg += "\n**Proposed Resolution:** UNRESOLVED\n\n"
        reg += "**Next Action:** Review source documents and determine authoritative statement\n\n"
        reg += "---\n\n"
    
    reg += """## Resolution Guidelines

When resolving conflicts:

1. **Identify Authority:** Check if one source is in the authority spine (highest precedence)
2. **Check Timestamps:** More recent documents may supersede older ones
3. **Verify Intent:** Determine if the conflict is semantic (real disagreement) or syntactic (different wording, same meaning)
4. **Document Decision:** Update this register with resolution rationale
5. **Update Canonical Spec:** Ensure the canonical spec reflects the resolved statement

## All Conflicts by Cluster

"""
    # Group remaining conflicts by cluster
    current_cluster = None
    for conf in all_conflicts:
        if conf['cluster'] != current_cluster:
            current_cluster = conf['cluster']
            reg += f"### {current_cluster}\n\n"
        
        reg += f"- **CONF-{conf['id']:03d}:** {conf['topic']} ({conf['priority']}) - "
        reg += f"Sources: {', '.join(['`' + d.split('/')[-1] + '`' for d in conf['docs']])}\n"
    
    return reg


def generate_deprecation_map(clusters: list, cluster_sources: dict, 
                             doc_index: list, filenames: dict, config: dict) -> str:
    """Generate DEPRECATION_MAP.md with proper status model."""
    primary_authority = set(config.get('primary_authority_spine', []))
    exclusions = config.get('exclusions', {}).get('ULTIMATE_documents', [])
    
    # Build lookup for document status
    doc_status_lookup = {d['path']: d.get('document_status', 'ACTIVE') for d in doc_index}
    
    # Identify duplicates
    from collections import defaultdict
    by_filename = defaultdict(list)
    for d in doc_index:
        filename = d['path'].split('/')[-1]
        by_filename[filename].append(d['path'])
    
    duplicates = {}
    for fn, paths in by_filename.items():
        if len(paths) > 1:
            # First path is canonical, others are duplicates
            canonical = sorted(paths, key=len)[0]  # Shortest path is usually canonical
            for p in paths:
                if p != canonical:
                    duplicates[p] = canonical
    
    dep = """# Deprecation Map

**Status:** Phase 3 Synthesis

## Status Legend

| Status | Definition |
|--------|------------|
| `authority_spine` | Primary authority document, highest precedence |
| `active` | Core source for canonical spec |
| `supporting` | Non-normative context document |
| `deprecated` | Content superseded, pending removal |
| `superseded` | Content merged into canonical spec |
| `duplicate` | Redundant copy of another document |
| `archived` | Historical reference only |
| `excluded` | Explicitly excluded with rationale |

## Document Mapping

| Document | Canonical Spec | Status | Replaced By | Rationale |
|----------|---------------|--------|-------------|-----------|
"""
    source_to_cluster = {}
    all_sources = set()
    
    for c in clusters:
        name = c['cluster_name']
        fn = filenames.get(name, to_kebab_case(name))
        for s in cluster_sources.get(name, []):
            source_to_cluster[s] = fn
            all_sources.add(s)
    
    # Authority spine documents
    for auth in sorted(primary_authority):
        path = './' + auth if not auth.startswith('./') else auth
        canonical = source_to_cluster.get(path, 'N/A')
        dep += f"| `{path}` | {canonical} | authority_spine | — | Primary authority |\n"
    
    # Active sources (not in authority spine, not duplicates, not historical)
    for src in sorted(all_sources):
        clean = src.lstrip('./')
        if clean not in primary_authority:
            if src in duplicates:
                canonical_doc = duplicates[src]
                canonical_spec = source_to_cluster.get(src, 'N/A')
                dep += f"| `{src}` | {canonical_spec} | duplicate | `{canonical_doc}` | Redundant copy |\n"
            elif doc_status_lookup.get(src) == 'HISTORICAL':
                canonical = source_to_cluster.get(src, 'N/A')
                dep += f"| `{src}` | {canonical} | archived | — | Historical reference |\n"
            else:
                canonical = source_to_cluster.get(src, 'N/A')
                dep += f"| `{src}` | {canonical} | active | — | Core source |\n"
    
    # Excluded documents
    dep += "\n## Excluded Documents\n\n"
    dep += "| Document | Status | Rationale |\n"
    dep += "|----------|--------|----------|\n"
    for exc in exclusions:
        path = './' + exc if not exc.startswith('./') else exc
        dep += f"| `{path}` | excluded | ULTIMATE document, not CURRENT |\n"
    
    # Duplicate documents section
    dep += "\n## Duplicate Documents\n\n"
    dep += "| Duplicate | Canonical | Rationale |\n"
    dep += "|-----------|-----------|-----------|\n"
    for dup_path, canonical_path in sorted(duplicates.items()):
        dep += f"| `{dup_path}` | `{canonical_path}` | Same filename, shorter path is canonical |\n"
    if not duplicates:
        dep += "*No duplicates identified.*\n"
    
    # Historical documents section
    dep += "\n## Historical Documents\n\n"
    dep += "| Document | Canonical Spec | Rationale |\n"
    dep += "|----------|---------------|-----------|\n"
    historical_count = 0
    for doc in doc_index:
        if doc.get('document_status') == 'HISTORICAL':
            canonical = source_to_cluster.get(doc['path'], 'N/A')
            dep += f"| `{doc['path']}` | {canonical} | Historical reference only |\n"
            historical_count += 1
    if historical_count == 0:
        dep += "*No historical documents identified.*\n"
    
    # Summary statistics
    dep += f"\n## Summary\n\n"
    dep += f"- **Authority Spine:** {len(primary_authority)} documents\n"
    dep += f"- **Active Sources:** {len([s for s in all_sources if s.lstrip('./') not in primary_authority and s not in duplicates and doc_status_lookup.get(s) != 'HISTORICAL'])} documents\n"
    dep += f"- **Duplicates:** {len(duplicates)} documents\n"
    dep += f"- **Historical:** {historical_count} documents\n"
    dep += f"- **Excluded:** {len(exclusions)} documents\n"
    
    return dep


def main():
    parser = argparse.ArgumentParser(
        description='Phase 3 Canonical Spec Synthesis',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )
    parser.add_argument('--repo-root', type=str, 
                        help='Repository root directory (auto-detected if not specified)')
    parser.add_argument('--inputs', type=str,
                        help='Path to Phase 1-2 artifacts directory')
    parser.add_argument('--out', type=str,
                        help='Output directory for specs (relative to repo root)')
    parser.add_argument('--config', type=str,
                        help='Path to RUN_CONFIG.json (overrides other options)')
    parser.add_argument('--allow-external-output', action='store_true',
                        help='Allow output directory outside repo root')
    
    args = parser.parse_args()
    
    # Determine repo root
    # Note: Path('') evaluates to truthy PosixPath('.'), so we must check explicitly
    env_root = os.environ.get('ISA_REPO_ROOT', '').strip()
    if args.repo_root:
        repo_root = Path(args.repo_root)
    elif env_root:
        repo_root = Path(env_root)
    else:
        repo_root = detect_repo_root()
    repo_root = repo_root.resolve()
    
    print(f"Repository root: {repo_root}")
    
    # Load or create config
    # IMPORTANT: These are FALLBACK defaults only. For reproducible runs,
    # ALWAYS use --config docs/spec/RUN_CONFIG.json (single source of truth).
    # Default values here are intentionally conservative to encourage explicit config.
    FALLBACK_DEFAULTS = {
        'configuration': {
            'max_core_sources_per_cluster': 15,      # Fallback; RUN_CONFIG may override
            'min_core_sources_per_cluster': 5,       # Fallback; RUN_CONFIG may override
            'max_claims_in_traceability_per_cluster': 20,  # Fallback (low); RUN_CONFIG uses 100
            'max_must_invariants_per_spec': 15,      # Fallback; RUN_CONFIG may override
            'max_implicit_claims_per_spec': 5        # Fallback; RUN_CONFIG may override
        },
        'scoring_weights': {
            'NORMATIVE_CANDIDATE_status': 10,
            'explicit_normative_intent': 5,
            'implicit_normative_intent': 2,
            'authority_candidate': 3,
            'primary_authority_spine': 15,
            'core_document_in_cluster': 2
        },
        'primary_authority_spine': [],
        'exclusions': {'ULTIMATE_documents': []},
        'cluster_filenames': {}
    }
    config = FALLBACK_DEFAULTS.copy()
    
    config_loaded_from_file = False
    if args.config:
        config_path = Path(args.config)
        if not config_path.is_absolute():
            config_path = repo_root / config_path
        if config_path.exists():
            print(f"Loading config from: {config_path}")
            loaded = load_config(config_path)
            config.update(loaded)
            config_loaded_from_file = True
        else:
            print(f"WARNING: Config file not found: {config_path}")
    
    if not config_loaded_from_file:
        print("WARNING: Running with FALLBACK defaults (not reproducible).")
        print("         For audit-ready output, use: --config docs/spec/RUN_CONFIG.json")
    
    # Determine inputs path
    inputs_path = None
    if args.inputs:
        inputs_path = Path(args.inputs)
    elif os.environ.get('ISA_PHASE3_INPUTS'):
        inputs_path = Path(os.environ['ISA_PHASE3_INPUTS'])
    elif config.get('input_artifacts', {}).get('document_index'):
        inputs_path = Path(config['input_artifacts']['document_index']).parent
    
    if not inputs_path:
        print("ERROR: No inputs path specified. Use --inputs or ISA_PHASE3_INPUTS env var.")
        sys.exit(1)
    
    if not inputs_path.is_absolute():
        inputs_path = repo_root / inputs_path
    inputs_path = inputs_path.resolve()
    
    # Validate inputs
    required_files = ['document_index.json', 'cluster_map.json', 'authority_candidates.json']
    missing = validate_inputs(inputs_path, required_files)
    if missing:
        print("ERROR: Missing required input files:")
        for f in missing:
            print(f"  - {f}")
        sys.exit(1)
    
    print(f"Inputs path: {inputs_path}")
    
    # Determine output path
    out_path = None
    if args.out:
        out_path = Path(args.out)
    elif os.environ.get('ISA_PHASE3_OUT'):
        out_path = Path(os.environ['ISA_PHASE3_OUT'])
    else:
        out_path = Path('docs/spec')
    
    if not out_path.is_absolute():
        out_path = repo_root / out_path
    out_path = out_path.resolve()
    
    # Validate output path
    if not validate_output_path(out_path, repo_root, args.allow_external_output):
        print(f"ERROR: Output path {out_path} is outside repo root {repo_root}")
        print("Use --allow-external-output to override this check.")
        sys.exit(1)
    
    # Create output directory
    out_path.mkdir(parents=True, exist_ok=True)
    print(f"Output path: {out_path}")
    
    # Load artifacts
    print("\nLoading Phase 1-2 artifacts...")
    clusters, doc_index, authority = load_artifacts(inputs_path)
    print(f"Found {len(clusters)} clusters, {len(doc_index)} documents")
    
    # Get cluster filenames
    filenames = config.get('cluster_filenames', {})
    
    # Process clusters
    cluster_sources = {}
    traceability = []
    
    for cluster in clusters:
        name = cluster['cluster_name']
        print(f"\nProcessing: {name}")
        
        sources = select_core_sources(cluster, doc_index, config)
        cluster_sources[name] = sources
        print(f"  Selected {len(sources)} core sources")
        
        claims = []
        for src in sources:
            content = read_document(repo_root, src)
            if content:
                claims.extend(extract_claims(content, src))
        
        print(f"  Extracted {len(claims)} claims")
        
        filename = filenames.get(name, to_kebab_case(name))
        spec, unique = generate_spec(name, sources, claims, filename, config)
        
        with open(out_path / filename, 'w') as f:
            f.write(spec)
        print(f"  Created: {filename}")
        
        prefix = name[:3].upper()
        for i, c in enumerate(unique, 1):
            traceability.append({
                'canonical_spec': filename,
                'claim_id': f"{prefix}-{i:03d}",
                'statement': c['statement'][:200],
                'source_path': c['source_path'],
                'source_heading': c['source_heading'],
                'short_quote': c['short_quote'][:100],
                'status': 'traceable'
            })
    
    # Generate global artifacts
    print("\nGenerating global artifacts...")
    
    with open(out_path / 'ISA_MASTER_SPEC.md', 'w') as f:
        f.write(generate_master_spec(clusters, cluster_sources, filenames))
    print("  Created: ISA_MASTER_SPEC.md")
    
    # TRACEABILITY_MATRIX schema (canonical column names):
    # - canonical_spec: The spec file this claim belongs to
    # - claim_id: Unique identifier (e.g., ISA-001)
    # - statement: The normative statement text
    # - source_path: Path to source document
    # - source_heading: Section heading in source
    # - short_quote: Abbreviated quote for quick reference
    # - status: Traceability status ('traceable' or 'untraceable')
    #   NOTE: Column is named 'status' (not 'trace_status') for brevity.
    #         validate_specs.py accepts both names for backward compatibility.
    TRACEABILITY_COLUMNS = [
        'canonical_spec', 'claim_id', 'statement', 'source_path',
        'source_heading', 'short_quote', 'status'
    ]
    with open(out_path / 'TRACEABILITY_MATRIX.csv', 'w', newline='') as f:
        w = csv.DictWriter(f, fieldnames=TRACEABILITY_COLUMNS)
        w.writeheader()
        w.writerows(traceability)
    print(f"  Created: TRACEABILITY_MATRIX.csv ({len(traceability)} rows)")
    
    with open(out_path / 'CONFLICT_REGISTER.md', 'w') as f:
        f.write(generate_conflict_register(clusters))
    print("  Created: CONFLICT_REGISTER.md")
    
    with open(out_path / 'DEPRECATION_MAP.md', 'w') as f:
        f.write(generate_deprecation_map(clusters, cluster_sources, doc_index, filenames, config))
    print("  Created: DEPRECATION_MAP.md")
    
    # Summary
    print("\n" + "=" * 60)
    print("Phase 3 synthesis complete!")
    print(f"  Canonical specs: {len(clusters)}")
    print(f"  Traced claims: {len(traceability)}")
    print(f"  Output: {out_path}")
    print("=" * 60)


if __name__ == '__main__':
    main()
