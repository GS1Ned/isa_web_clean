# ISA Architecture Expert Panel

## Purpose

This directory contains artifacts for the ISA Architecture Expert Panel review using the Repo-Tight v5 framework.

## Framework

**Version:** Repo-Tight v5  
**Target:** ≥9/10 across 12 dimensions  
**Requirement:** All claims backed by schema-valid proof artifacts

## Artifacts

### Kickoff Package
- [KICKOFF_PACKAGE.md](./KICKOFF_PACKAGE.md) - Expert panel instructions and requirements

### ATAM Outputs (Mandatory)
- [ATAM_UTILITY_TREE.md](./ATAM_UTILITY_TREE.md) - Quality attribute scenarios with priorities
- [ATAM_SCENARIOS.md](./ATAM_SCENARIOS.md) - Detailed scenario specifications (TBD)
- [ATAM_RISKS_SENSITIVITIES_TRADEOFFS.md](./ATAM_RISKS_SENSITIVITIES_TRADEOFFS.md) - Risk analysis (TBD)

### Completeness Check
- [ISO25010_MAPPING.md](./ISO25010_MAPPING.md) - Mapping to ISO/IEC 25010 quality model

### Generated Artifacts
- [_generated/ARCHITECTURE_SCORECARD.json](./_generated/ARCHITECTURE_SCORECARD.json) - Current baseline scores

## Expert Reports

Expert reports should be placed in this directory with naming convention:
- `EXPERT_REPORT_<DIMENSION>_<OWNER_ROLE>.md`

Example:
- `EXPERT_REPORT_D10_RAG_ARCHITECT.md`

## Workflow

1. ✅ Proof infrastructure created (schemas + directories)
2. ⏳ Baseline assessment (scorecard generated)
3. ⏳ ATAM session scheduled
4. ⏳ Dimension owners assigned
5. ⏳ Expert reports collected
6. ⏳ Tradeoffs resolved
7. ⏳ Final scorecard produced

## Status

**Created:** 2026-02-12  
**Current Phase:** Proof infrastructure setup  
**Next Step:** Assign dimension owners and schedule ATAM session
