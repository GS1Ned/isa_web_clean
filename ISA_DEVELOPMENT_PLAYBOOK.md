# ISA Development Playbook

> **Purpose:** Guide for efficient and effective ISA development based on lessons learned.
> **Last Updated:** 2026-01-27
> **Author:** Manus AI Agent

---

## 1. First Steps (Before Any Development)

### 1.1 Read Authoritative Documents (in order)

| Priority | Document | Purpose |
|----------|----------|---------|
| 1 | `EU_ESG_to_GS1_Mapping_v1.1/MANUS_HANDOFF.md` | Exact work to do, gates, outputs |
| 2 | `EU_ESG_to_GS1_Mapping_v1.1/backlog.json` | Executable work items with DoD |
| 3 | `ISA_GOVERNANCE.md` | Lane rules, red-line principles |
| 4 | `PRODUCTION_READINESS.md` | Current production status |
| 5 | `ARCHITECTURE.md` | System architecture overview |

### 1.2 Explore Production Site

Before assuming bugs or missing features:
1. Visit https://isa-standards-cozu6eot.manus.space/
2. Navigate all major sections (Hub, Ask ISA, Dashboard, Tools)
3. Note what's working vs what returns 404
4. Compare production data with local database

### 1.3 Verify Repository

- **Authoritative repo:** `GS1Ned/isa_web_clean` (NOT `isa_web_full`)
- Always `git pull` before starting work
- Check recent commits for context

---

## 2. Document Value Scorecard

| Document | Value | Why |
|----------|-------|-----|
| MANUS_HANDOFF.md | 5/5 | Defines exact work, gates, outputs |
| data/corpus.json | 5/5 | Authoritative baseline |
| data/obligations.json | 5/5 | Legal traceability anchor |
| schemas/*.schema.json | 5/5 | Enables automation, CI validation |
| VALIDATION_REPORT.md | 5/5 | Evidence of completeness |
| backlog.json | 4/5 | Executable work items with DoD |
| data/atomic_requirements.json | 4/5 | Computable requirements |
| data/data_requirements.json | 4/5 | Law → data objects |
| data/gs1_mapping.json | 4/5 | ISA-facing mapping layer |
| data/scoring.json | 3/5 | Prioritization (secondary) |

---

## 3. Priority Execution Order

### 3.1 Always Fix P0 First

P0 items are **blocking** - nothing else matters until they're resolved.

Example P0: BL-001 (placeholder article references)
- Definition of Done is explicit
- Evidence required is specified
- Must be fixed before artefacts are citation-grade

### 3.2 Quick Wins Second

If a task takes <30 minutes and provides immediate user value, do it:
- Route aliases (404 fixes)
- Typo corrections
- Missing imports

### 3.3 P1 Items Third

P1 items expand coverage or improve quality:
- BL-010: Expand corpus
- BL-020: Add source metadata

### 3.4 Infrastructure Last

Only after P0/P1 are done:
- Data ingestion
- Search optimization
- Performance improvements

---

## 4. Development Environment

### 4.1 Database Awareness

| Database | Purpose | Has Data? |
|----------|---------|-----------|
| Manus-managed (production) | Live site | Yes |
| TiDB `isa_db` | Original | No (empty) |
| TiDB `isa_db_fresh` | Clean slate | No (empty) |

**Key insight:** Production uses a separate Manus-managed database. Local development requires running ingestion scripts.

### 4.2 Running Ingestion

```bash
cd /home/ubuntu/isa_web_clean
NODE_ENV=development pnpm exec tsx run-cellar-sync.ts  # Regulations
NODE_ENV=development pnpm exec tsx run-ingestion.ts    # GS1 data
```

### 4.3 Testing BM25 Search

```bash
NODE_ENV=development pnpm exec tsx test-bm25-final.ts
```

---

## 5. Governance Rules (Lane C)

ISA operates under **Lane C (User-Decision Mode)**:

1. **ALL impactful decisions require explicit user approval**
2. **Silence is NOT consent** - must wait for explicit approval
3. **Red-line principles are inviolable:**
   - Never delete production data
   - Never commit secrets to repository
   - Never hide errors from user
   - Never bypass validation schemas

---

## 6. ISA is a PoC

**Critical understanding:** ISA is a Proof of Concept, NOT a production platform.

Development priorities:
1. **Innovation over completion** - Demonstrate AI capabilities
2. **Integration over isolation** - Features should work together
3. **Demonstration over reliability** - Show what's possible

---

## 7. Common Pitfalls to Avoid

| Pitfall | Solution |
|---------|----------|
| Assuming code bugs when data is missing | Check database state first |
| Working on wrong repository | Always use `isa_web_clean` |
| Skipping documentation review | Read MANUS_HANDOFF.md first |
| Over-engineering solutions | Follow existing patterns |
| Ignoring Definition of Done | Check backlog.json for DoD |

---

## 8. Commit Message Format

```
type(scope): description

Examples:
feat(BL-001): replace placeholder article references with exact citations
fix: add /hub/standards route alias
docs: update VALIDATION_REPORT with BL-001 completion
```

---

## 9. Checklist Before Starting Any Task

- [ ] Read MANUS_HANDOFF.md
- [ ] Check backlog.json for current priorities
- [ ] Verify working on `isa_web_clean` repository
- [ ] Pull latest changes from origin
- [ ] Check production site for current state
- [ ] Verify local database has required data
- [ ] Understand Definition of Done for the task

---

## 10. Key URLs

| Resource | URL |
|----------|-----|
| Production Site | https://isa-standards-cozu6eot.manus.space/ |
| Alternative Domain | https://gs1isa.com/ |
| GitHub Repository | https://github.com/GS1Ned/isa_web_clean |
| EUR-Lex (regulations) | https://eur-lex.europa.eu/ |
| GS1 Standards | https://www.gs1.org/standards |

---

*This playbook should be updated as new learnings emerge.*
