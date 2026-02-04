# Deprecation Map

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
| `./ARCHITECTURE.md` | data-knowledge-model.md | authority_spine | — | Primary authority |
| `./GOVERNANCE.md` | governance-iron-protocol.md | authority_spine | — | Primary authority |
| `./IRON_PROTOCOL.md` | governance-iron-protocol.md | authority_spine | — | Primary authority |
| `./ISA_GOVERNANCE.md` | agent-prompt-governance.md | authority_spine | — | Primary authority |
| `./docs/CODEX_DELEGATION_SPEC.md` | ingestion-update-lifecycle.md | authority_spine | — | Primary authority |
| `./docs/FILE_SYSTEM_MEMORY_ARCHITECTURE.md` | ingestion-update-lifecycle.md | authority_spine | — | Primary authority |
| `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` | repo-change-control-release.md | authority_spine | — | Primary authority |
| `./docs/GS1_Attribute_Mapper_Technical_Specification.md` | data-knowledge-model.md | authority_spine | — | Primary authority |
| `./docs/ISA_INFORMATION_ARCHITECTURE.md` | data-knowledge-model.md | authority_spine | — | Primary authority |
| `./docs/PIPELINE_OBSERVABILITY_SPEC.md` | evaluation-governance-reproducibility.md | authority_spine | — | Primary authority |
| `./docs/agent_collaboration/MANUS_CHATGPT_PROTOCOL.md` | agent-prompt-governance.md | authority_spine | — | Primary authority |
| `./docs/governance/ISA_MANUS_PROJECT_GOVERNANCE.md` | governance-iron-protocol.md | authority_spine | — | Primary authority |
| `./AUTONOMOUS_DEVELOPMENT_SUMMARY.md` | retrieval-embeddings-grounding.md | active | — | Core source |
| `./CHATGPT_DELEGATION_PHASE1.md` | agent-prompt-governance.md | active | — | Core source |
| `./CHATGPT_PROMPT_BATCH_INGEST_02_04_05_06.md` | agent-prompt-governance.md | active | — | Core source |
| `./CHATGPT_PROMPT_INGEST-03.md` | agent-prompt-governance.md | active | — | Core source |
| `./CHATGPT_UPDATE_PROMPT.md` | agent-prompt-governance.md | active | — | Core source |
| `./DATASET_INVENTORY.md` | catalogue-source-registry.md | active | — | Core source |
| `./DATA_MODEL.md` | governance-iron-protocol.md | active | — | Core source |
| `./DELEGATION_PACKAGE_INGEST-03.md` | agent-prompt-governance.md | active | — | Core source |
| `./EU_ESG_to_GS1_Mapping_v1.1/EU_ESG_to_GS1_Mapping.md` | governance-iron-protocol.md | active | — | Core source |
| `./EXTERNAL_REFERENCES.md` | evaluation-governance-reproducibility.md | archived | — | Historical reference |
| `./INGESTION_DELIVERABLES_INDEX.md` | isa-core-architecture.md | active | — | Core source |
| `./IRON_KNOWLEDGE_MAP.md` | repo-change-control-release.md | active | — | Core source |
| `./ISA_CAPABILITY_MAP.md` | retrieval-embeddings-grounding.md | active | — | Core source |
| `./ISA_DEVELOPMENT_PLAYBOOK.md` | repo-change-control-release.md | active | — | Core source |
| `./ISA_GS1_ARTIFACT_INVENTORY.md` | catalogue-source-registry.md | active | — | Core source |
| `./ISA_STATUS_REPORT_2025-01-11.md` | ux-user-journey.md | archived | — | Historical reference |
| `./PHASE_9_CLAIMS_SANITIZATION_REPORT.md` | governance-iron-protocol.md | archived | — | Historical reference |
| `./PHASE_9_DOCUMENTATION_INVENTORY.md` | roadmap-evolution.md | archived | — | Historical reference |
| `./POC_EXPLORATION_TODO.md` | roadmap-evolution.md | active | — | Core source |
| `./PRODUCTION_READINESS.md` | catalogue-source-registry.md | active | — | Core source |
| `./PROJECT_SIZE_CLEANUP.md` | repo-change-control-release.md | active | — | Core source |
| `./README.md` | evaluation-governance-reproducibility.md | active | — | Core source |
| `./REPO_MAP.md` | isa-core-architecture.md | archived | — | Historical reference |
| `./ROADMAP_GITHUB_INTEGRATION.md` | repo-change-control-release.md | active | — | Core source |
| `./SCOPE_DECISIONS.md` | catalogue-source-registry.md | archived | — | Historical reference |
| `./docs/ADVISORY_OUTPUTS.md` | data-knowledge-model.md | active | — | Core source |
| `./docs/ADVISORY_UI_NOTES.md` | ux-user-journey.md | active | — | Core source |
| `./docs/AGENT_COLLABORATION_SUMMARY.md` | agent-prompt-governance.md | archived | — | Historical reference |
| `./docs/ALERTING_SYSTEM_DESIGN.md` | ux-user-journey.md | active | — | Core source |
| `./docs/ALTERNATIVE_FUTURES_EXPLORATION.md` | ux-user-journey.md | active | — | Core source |
| `./docs/ASK_ISA_QUERY_LIBRARY.md` | ux-user-journey.md | active | — | Core source |
| `./docs/ASK_ISA_QUERY_LIBRARY_v1.md` | catalogue-source-registry.md | active | — | Core source |
| `./docs/CHANGELOG_FOR_CHATGPT.md` | agent-prompt-governance.md | archived | — | Historical reference |
| `./docs/CHATGPT_INTEGRATION_CONTRACT.md` | agent-prompt-governance.md | active | — | Core source |
| `./docs/CHATGPT_INTEGRATION_WORKFLOW.md` | ux-user-journey.md | active | — | Core source |
| `./docs/CHATGPT_OPTIMIZATION_EVALUATION.md` | agent-prompt-governance.md | active | — | Core source |
| `./docs/CHATGPT_WORK_PARCEL_02_ASK_ISA_EXPANSION.md` | agent-prompt-governance.md | active | — | Core source |
| `./docs/CLEANUP_REPORT.md` | catalogue-source-registry.md | active | — | Core source |
| `./docs/CRITICAL_EVENTS_TAXONOMY.md` | evaluation-governance-reproducibility.md | active | — | Core source |
| `./docs/DATASETS_CATALOG.md` | catalogue-source-registry.md | archived | — | Historical reference |
| `./docs/DEPLOYMENT.md` | evaluation-governance-reproducibility.md | archived | — | Historical reference |
| `./docs/DEVELOPMENT_PROGRESS_2026-02-01.md` | retrieval-embeddings-grounding.md | active | — | Core source |
| `./docs/DEVELOPMENT_SESSION_2026-02-01.md` | retrieval-embeddings-grounding.md | active | — | Core source |
| `./docs/EMBEDDING_PIPELINE_OPTIMIZATION.md` | observability-tracing-feedback.md | archived | — | Historical reference |
| `./docs/EMBEDDING_QUALITY_IMPROVEMENT_REPORT.md` | retrieval-embeddings-grounding.md | active | — | Core source |
| `./docs/ENHANCED_EMBEDDING_SCHEMA.md` | retrieval-embeddings-grounding.md | archived | — | Historical reference |
| `./docs/GITHUB_PROVISIONING_REPORT.md` | repo-change-control-release.md | active | — | Core source |
| `./docs/GOVERNANCE_FINAL_SUMMARY.md` | catalogue-source-registry.md | active | — | Core source |
| `./docs/GOVERNANCE_PHASE_2_3_REPORT.md` | repo-change-control-release.md | archived | — | Historical reference |
| `./docs/GS1_ARTEFACTS_ALIGNMENT_VALIDATION.md` | repo-change-control-release.md | active | — | Core source |
| `./docs/GS1_DOCUMENTS_DATASETS_ANALYSIS.md` | ingestion-update-lifecycle.md | archived | — | Historical reference |
| `./docs/GS1_EU_PCF_INTEGRATION_SUMMARY.md` | ingestion-update-lifecycle.md | archived | — | Historical reference |
| `./docs/ISA_AGENT_COLLABORATION.md` | agent-prompt-governance.md | archived | — | Historical reference |
| `./docs/ISA_AUTONOMOUS_ROADMAP_V1.md` | roadmap-evolution.md | active | — | Core source |
| `./docs/ISA_COMPARATIVE_REFACTOR_GATE_PLAN.md` | retrieval-embeddings-grounding.md | active | — | Core source |
| `./docs/ISA_FUTURE_DEVELOPMENT_PLAN.md` | roadmap-evolution.md | archived | — | Historical reference |
| `./docs/ISA_First_Advisory_Report_GS1NL.md` | repo-change-control-release.md | archived | — | Historical reference |
| `./docs/ISA_GS1_PRE_EXECUTION_PREPARATION.md` | evaluation-governance-reproducibility.md | active | — | Core source |
| `./docs/ISA_IMPLEMENTATION_EXECUTION_PLAN.md` | evaluation-governance-reproducibility.md | active | — | Core source |
| `./docs/ISA_NEWSHUB_EVOLUTION_SUMMARY.md` | ux-user-journey.md | active | — | Core source |
| `./docs/ISA_NEWS_HUB_SELF_CHECK_ASSESSMENT.md` | data-knowledge-model.md | active | — | Core source |
| `./docs/ISA_PRODUCT_DIMENSIONS_ANALYSIS.md` | ux-user-journey.md | archived | — | Historical reference |
| `./docs/ISA_STRATEGIC_CONTEXT_SYNTHESIS.md` | isa-core-architecture.md | active | — | Core source |
| `./docs/ISA_STRATEGIC_DISCOVERY_REPORT.md` | ux-user-journey.md | archived | — | Historical reference |
| `./docs/ISA_STRATEGIC_EVALUATION_QUALITY_MAPPING.md` | evaluation-governance-reproducibility.md | active | — | Core source |
| `./docs/ISA_Strategic_Insights_from_Reports.md` | repo-change-control-release.md | active | — | Core source |
| `./docs/ISA_Strategic_Roadmap.md` | ux-user-journey.md | archived | — | Historical reference |
| `./docs/ISA_UX_STRATEGY.md` | ux-user-journey.md | active | — | Core source |
| `./docs/ISA_V1_FORMALIZATION_TARGETS.md` | ux-user-journey.md | active | — | Core source |
| `./docs/ISA_VISUAL_BRANDING_DEVELOPMENT_PLAN.md` | ux-user-journey.md | active | — | Core source |
| `./docs/ISA_VISUAL_BRANDING_ROADMAP.md` | isa-core-architecture.md | active | — | Core source |
| `./docs/ISA_WORKFLOW_IMPROVEMENTS.md` | repo-change-control-release.md | active | — | Core source |
| `./docs/KNOWN_FAILURE_MODES.md` | evaluation-governance-reproducibility.md | duplicate | `./KNOWN_FAILURE_MODES.md` | Redundant copy |
| `./docs/MANUS_BEST_PRACTICES_FOR_ISA.md` | retrieval-embeddings-grounding.md | active | — | Core source |
| `./docs/MANUS_DAY1_EXECUTION_CHECKLIST.md` | repo-change-control-release.md | archived | — | Historical reference |
| `./docs/MANUS_OPTIMIZATION_IMPLEMENTATION_SUMMARY.md` | isa-core-architecture.md | active | — | Core source |
| `./docs/META_PHASE_STRATEGIC_EXPLORATION_PLAN.md` | ux-user-journey.md | active | — | Core source |
| `./docs/NEWS_HEALTH_MONITORING.md` | isa-core-architecture.md | active | — | Core source |
| `./docs/PHASE4_OPERATIONAL_READINESS_REPORT.md` | observability-tracing-feedback.md | active | — | Core source |
| `./docs/PHASE_8.3_INGESTION_WINDOW_COMPLETE.md` | observability-tracing-feedback.md | active | — | Core source |
| `./docs/PIPELINE_VALIDATION_REPORT.md` | data-knowledge-model.md | active | — | Core source |
| `./docs/PRODUCTION_DEPLOYMENT.md` | repo-change-control-release.md | active | — | Core source |
| `./docs/PRODUCTION_IMPROVEMENTS_JAN_2026.md` | observability-tracing-feedback.md | active | — | Core source |
| `./docs/README.md` | isa-core-architecture.md | duplicate | `./README.md` | Redundant copy |
| `./docs/STATUS.md` | roadmap-evolution.md | active | — | Core source |
| `./docs/STRATEGIC_EVALUATION_2026-02-01.md` | retrieval-embeddings-grounding.md | active | — | Core source |
| `./docs/architecture/ISA_ULTIMATE_ARCHITECTURE.md` | retrieval-embeddings-grounding.md | active | — | Core source |
| `./docs/autonomous-session-2025-12-17.md` | ux-user-journey.md | active | — | Core source |
| `./docs/datasets/EXTERNAL_GS1_AND_ESG_REPOS_ARCHIVE2.md` | ingestion-update-lifecycle.md | archived | — | Historical reference |
| `./docs/datasets/HOW_TO_QUERY_ARCHIVE2_INDEX.md` | ingestion-update-lifecycle.md | archived | — | Historical reference |
| `./docs/evidence/ENTRYPOINTS.md` | catalogue-source-registry.md | active | — | Core source |
| `./docs/evidence/EVIDENCE_INDEX.md` | catalogue-source-registry.md | active | — | Core source |
| `./docs/evidence/ISA_IRON_DOCSET_AND_CRITICAL_PATH_DECISION_DRAFT_v0.md` | evaluation-governance-reproducibility.md | active | — | Core source |
| `./docs/evidence/ISA_JOURNEY_TRACES_v0.md` | retrieval-embeddings-grounding.md | active | — | Core source |
| `./docs/evidence/ISA_SOURCES_REGISTRY_v0.md` | catalogue-source-registry.md | active | — | Core source |
| `./docs/evidence/_benchmarks/ISA_EXTERNAL_BENCHMARK_NOTES_v1.md` | retrieval-embeddings-grounding.md | active | — | Core source |
| `./docs/evidence/_benchmarks/ISA_EXTERNAL_BENCHMARK_NOTES_v2.md` | catalogue-source-registry.md | active | — | Core source |
| `./docs/evidence/_generated/CATALOGUE_ENTRYPOINTS_STATUS.md` | catalogue-source-registry.md | active | — | Core source |
| `./docs/evidence/_generated/GS1_EFRAG_CATALOGUE_INDEX.md` | catalogue-source-registry.md | active | — | Core source |
| `./docs/evidence/_generated/isa_catalogue_latest/index.md` | catalogue-source-registry.md | active | — | Core source |
| `./docs/evidence/_research/ISA_CURRENT_ARCHITECTURE_BRIEF_v0.md` | repo-change-control-release.md | active | — | Core source |
| `./docs/governance/DATE_INTEGRITY_AUDIT.md` | agent-prompt-governance.md | active | — | Core source |
| `./docs/governance/TEMPORAL_GUARDRAILS.md` | governance-iron-protocol.md | active | — | Core source |
| `./docs/gs1_research/feasibility_assessment.md` | evaluation-governance-reproducibility.md | active | — | Core source |
| `./docs/templates/RECOMMENDATION_TEMPLATE.md` | roadmap-evolution.md | active | — | Core source |
| `./docs/ultimate_architecture_docs/ISA_ULTIMATE_ARCHITECTURE.md` | retrieval-embeddings-grounding.md | duplicate | `./docs/architecture/ISA_ULTIMATE_ARCHITECTURE.md` | Redundant copy |
| `./research/ASK_ISA_ANALYSIS_REPORT.md` | retrieval-embeddings-grounding.md | archived | — | Historical reference |
| `./research/ASK_ISA_IMPLEMENTATION_PLAN.md` | retrieval-embeddings-grounding.md | active | — | Core source |
| `./tasks/CHATGPT_WORK_PLAN.md` | roadmap-evolution.md | active | — | Core source |
| `./tasks/for_chatgpt/CGPT-15_user_guide.md` | isa-core-architecture.md | active | — | Core source |
| `./tasks/for_chatgpt/INGEST-02_gdsn_current.md` | data-knowledge-model.md | active | — | Core source |
| `./tasks/for_chatgpt/_CHATGPT_INSTRUCTIONS.md` | agent-prompt-governance.md | active | — | Core source |
| `./timeline-test-results.md` | roadmap-evolution.md | active | — | Core source |
| `./todo.md` | roadmap-evolution.md | archived | — | Historical reference |

## Excluded Documents

| Document | Status | Rationale |
|----------|--------|----------|
| `./docs/architecture/ISA_ULTIMATE_ARCHITECTURE.md` | excluded | ULTIMATE document, not CURRENT |
| `./docs/ultimate_architecture_docs/ISA_ULTIMATE_ARCHITECTURE.md` | excluded | ULTIMATE document, not CURRENT |

## Duplicate Documents

| Duplicate | Canonical | Rationale |
|-----------|-----------|-----------|
| `./EU_ESG_to_GS1_Mapping_v1.1/CHANGELOG.md` | `./docs/CHANGELOG.md` | Same filename, shorter path is canonical |
| `./EU_ESG_to_GS1_Mapping_v1.1/README.md` | `./README.md` | Same filename, shorter path is canonical |
| `./cron-configs/README.md` | `./README.md` | Same filename, shorter path is canonical |
| `./data/gs1_ref_corpus/README.md` | `./README.md` | Same filename, shorter path is canonical |
| `./docs/KNOWN_FAILURE_MODES.md` | `./KNOWN_FAILURE_MODES.md` | Same filename, shorter path is canonical |
| `./docs/PRODUCTION_READINESS.md` | `./PRODUCTION_READINESS.md` | Same filename, shorter path is canonical |
| `./docs/README.md` | `./README.md` | Same filename, shorter path is canonical |
| `./docs/gs1_research/README.md` | `./README.md` | Same filename, shorter path is canonical |
| `./docs/legacy/STABILIZATION_REPORT_2026-01-04.md` | `./STABILIZATION_REPORT_2026-01-04.md` | Same filename, shorter path is canonical |
| `./docs/ultimate_architecture_docs/ASK_ISA_ULTIMATE_QUALITY_IMPROVEMENT_PLAN.md` | `./docs/ASK_ISA_ULTIMATE_QUALITY_IMPROVEMENT_PLAN.md` | Same filename, shorter path is canonical |
| `./docs/ultimate_architecture_docs/CHATGPT_OPTIMIZATION_EVALUATION.md` | `./docs/CHATGPT_OPTIMIZATION_EVALUATION.md` | Same filename, shorter path is canonical |
| `./docs/ultimate_architecture_docs/ISA_ULTIMATE_ARCHITECTURE.md` | `./docs/architecture/ISA_ULTIMATE_ARCHITECTURE.md` | Same filename, shorter path is canonical |
| `./docs/ultimate_architecture_docs/README.md` | `./README.md` | Same filename, shorter path is canonical |
| `./docs/ultimate_architecture_docs/TECHNIQUE_ANALYSIS_NOTES.md` | `./docs/architecture/TECHNIQUE_ANALYSIS_NOTES.md` | Same filename, shorter path is canonical |
| `./server/mappings/README.md` | `./README.md` | Same filename, shorter path is canonical |
| `./tasks/batch_01/README.md` | `./README.md` | Same filename, shorter path is canonical |

## Historical Documents

| Document | Canonical Spec | Rationale |
|----------|---------------|-----------|
| `./EURLEX_SCRAPER_FIX.md` | N/A | Historical reference only |
| `./EXTERNAL_REFERENCES.md` | evaluation-governance-reproducibility.md | Historical reference only |
| `./GS1_ARTEFACT_PROCESSING.md` | N/A | Historical reference only |
| `./INGESTION.md` | N/A | Historical reference only |
| `./ISA_STATUS_REPORT_2025-01-11.md` | ux-user-journey.md | Historical reference only |
| `./PHASE_9_CLAIMS_SANITIZATION_REPORT.md` | governance-iron-protocol.md | Historical reference only |
| `./PHASE_9_COMPLETION_REPORT.md` | N/A | Historical reference only |
| `./PHASE_9_DOCUMENTATION_INVENTORY.md` | roadmap-evolution.md | Historical reference only |
| `./REPO_MAP.md` | isa-core-architecture.md | Historical reference only |
| `./ROADMAP.md` | N/A | Historical reference only |
| `./SCOPE_DECISIONS.md` | catalogue-source-registry.md | Historical reference only |
| `./docs/ADVISORY_DIFF_METRICS.md` | N/A | Historical reference only |
| `./docs/AGENT_COLLABORATION_SUMMARY.md` | agent-prompt-governance.md | Historical reference only |
| `./docs/API_REFERENCE.md` | N/A | Historical reference only |
| `./docs/CHANGELOG.md` | N/A | Historical reference only |
| `./docs/CHANGELOG_FOR_CHATGPT.md` | agent-prompt-governance.md | Historical reference only |
| `./docs/CHANGELOG_SUMMARY.md` | N/A | Historical reference only |
| `./docs/DATASETS_CATALOG.md` | catalogue-source-registry.md | Historical reference only |
| `./docs/DAY1_COMPLETION_REPORT.md` | N/A | Historical reference only |
| `./docs/DEPLOYMENT.md` | evaluation-governance-reproducibility.md | Historical reference only |
| `./docs/EMBEDDING_PIPELINE_OPTIMIZATION.md` | observability-tracing-feedback.md | Historical reference only |
| `./docs/ENHANCED_EMBEDDING_SCHEMA.md` | retrieval-embeddings-grounding.md | Historical reference only |
| `./docs/GOVERNANCE_PHASE_2_3_REPORT.md` | repo-change-control-release.md | Historical reference only |
| `./docs/GS1_DOCUMENTS_DATASETS_ANALYSIS.md` | ingestion-update-lifecycle.md | Historical reference only |
| `./docs/GS1_EU_PCF_INTEGRATION_SUMMARY.md` | ingestion-update-lifecycle.md | Historical reference only |
| `./docs/GS1_STYLE_COMPLIANCE_FINAL_REPORT.md` | N/A | Historical reference only |
| `./docs/ISA_AGENT_COLLABORATION.md` | agent-prompt-governance.md | Historical reference only |
| `./docs/ISA_DOCUMENTATION_MAP.md` | N/A | Historical reference only |
| `./docs/ISA_FUTURE_DEVELOPMENT_PLAN.md` | roadmap-evolution.md | Historical reference only |
| `./docs/ISA_First_Advisory_Report_GS1NL.md` | repo-change-control-release.md | Historical reference only |
| `./docs/ISA_First_Advisory_Report_GS1NL_v1.1_UPDATE.md` | N/A | Historical reference only |
| `./docs/ISA_PRODUCT_DIMENSIONS_ANALYSIS.md` | ux-user-journey.md | Historical reference only |
| `./docs/ISA_STRATEGIC_DISCOVERY_REPORT.md` | ux-user-journey.md | Historical reference only |
| `./docs/ISA_STRATEGIC_PIVOT_REPORT.md` | N/A | Historical reference only |
| `./docs/ISA_Strategic_Roadmap.md` | ux-user-journey.md | Historical reference only |
| `./docs/ISA_V1_CONSISTENCY_FIXES.md` | N/A | Historical reference only |
| `./docs/ISA_V1_HARDENING_COMPLETE.md` | N/A | Historical reference only |
| `./docs/MANUS_DAY1_EXECUTION_CHECKLIST.md` | repo-change-control-release.md | Historical reference only |
| `./docs/PRIORITY_1_COMPLETION_REPORT.md` | N/A | Historical reference only |
| `./docs/PRIORITY_1_SCHEMA_DEBT.md` | N/A | Historical reference only |
| `./docs/PRIORITY_2_BLOCKED.md` | N/A | Historical reference only |
| `./docs/TESTING_GUIDE.md` | N/A | Historical reference only |
| `./docs/TRUST_RISK_ANALYSIS.md` | N/A | Historical reference only |
| `./docs/_CONSOLIDATION_VALIDATION.md` | N/A | Historical reference only |
| `./docs/datasets/EXTERNAL_GS1_AND_ESG_REPOS_ARCHIVE2.md` | ingestion-update-lifecycle.md | Historical reference only |
| `./docs/datasets/HOW_TO_QUERY_ARCHIVE2_INDEX.md` | ingestion-update-lifecycle.md | Historical reference only |
| `./docs/gs1_research/STRATEGIC_FOCUS_SELECTION.md` | N/A | Historical reference only |
| `./docs/gs1_research/executive_summary.md` | N/A | Historical reference only |
| `./docs/gs1_research/gs1_process_synthesis.md` | N/A | Historical reference only |
| `./docs/gs1_research/gsmp_manual_notes.md` | N/A | Historical reference only |
| `./docs/gs1_research/hardest_questions_decision_tensions.md` | N/A | Historical reference only |
| `./docs/typescript-cleanup-2026-01-02.md` | N/A | Historical reference only |
| `./research/ASK_ISA_ANALYSIS_REPORT.md` | retrieval-embeddings-grounding.md | Historical reference only |
| `./tasks/for_chatgpt/INGEST-06_cbv_vocabularies.md` | N/A | Historical reference only |
| `./todo.md` | roadmap-evolution.md | Historical reference only |

## Summary

- **Authority Spine:** 12 documents
- **Active Sources:** 85 documents
- **Duplicates:** 16 documents
- **Historical:** 55 documents
- **Excluded:** 2 documents
