# ISA Repo Cleanup — SAFE Move Plan (generated)
- generated_utc: 2026-02-06T19:12:53Z
- git_head: `8192fac8bccf0901b127f20bbd0bdfc94cf0cfb2`
- repo_scan_json: `isa-archive/next-step-scan/repo_scan.json`

## SAFE scope
- allow_ext: `.csv, .json, .md, .txt, .yaml, .yml`
- deny_prefix_count: `18`

## Bucket counts (doclike tracked files only)
| bucket | count |
|---|---:|
| `already_archived` | 38 |
| `docs_misc` | 174 |
| `governance_docs` | 22 |
| `other_docs` | 95 |
| `phase_reports` | 36 |
| `planning_docs` | 25 |
| `reports_and_outputs` | 28 |
| `spec_docs` | 32 |

## Roadmap candidates (ranked)
| score | path |
|---:|---|
| 4 | `./docs/ISA_NEXT_PHASE_DEVELOPMENT_PLAN.md` |
| 2 | `./docs/ISA_COMPARATIVE_REFACTOR_GATE_PLAN.md` |
| 2 | `./docs/META_PHASE_STRATEGIC_EXPLORATION_PLAN.md` |
| 2 | `./docs/PRIORITY_2_BLOCKED.md` |
| 2 | `./docs/spec/DECISION_LOG_PHASE3.md` |
| 2 | `./isa-archive/reports/test-results__phase-8-roadmap-generator-test.md` |
| 2 | `./todo_phase44_update.txt` |
| 1 | `./CHATGPT_DELEGATION_PHASE1.md` |
| 1 | `./EU_ESG_to_GS1_Mapping_v1.1/backlog.json` |
| 1 | `./IRON_VALIDATION_PLAN.md` |
| 1 | `./ISA_STATUS_REPORT_2025-01-11.md` |
| 1 | `./ISA_TODO_MANUAL_COMPLETION.md` |
| 1 | `./NEWS_HUB_PHASE4-6_SUMMARY.md` |
| 1 | `./PHASE_9_CLAIMS_SANITIZATION_REPORT.md` |
| 1 | `./PHASE_9_COMPLETION_REPORT.md` |
| 1 | `./PHASE_9_DOCUMENTATION_INVENTORY.md` |
| 1 | `./POC_EXPLORATION_TODO.md` |
| 1 | `./ROADMAP.md` |
| 1 | `./ROADMAP_GITHUB_INTEGRATION.md` |
| 1 | `./docs/Autonomous_Development_Plan.md` |
| 1 | `./docs/DATASET_PRIORITY_ANALYSIS.md` |
| 1 | `./docs/Data_Quality_Updates_Plan.md` |
| 1 | `./docs/ESG_Hub_MVP_Polish_Plan.md` |
| 1 | `./docs/GOVERNANCE_PHASE_2_3_REPORT.md` |
| 1 | `./docs/ISA_AUTONOMOUS_ROADMAP_V1.md` |
| 1 | `./docs/ISA_DEPLOYMENT_AND_ROADMAP.md` |
| 1 | `./docs/ISA_DEVELOPMENT_ROADMAP_TO_FINAL_PRODUCT.md` |
| 1 | `./docs/ISA_DEVELOPMENT_STATUS.md` |
| 1 | `./docs/ISA_Development_Roadmap_2026.md` |
| 1 | `./docs/ISA_FUTURE_DEVELOPMENT_PLAN.md` |

## Move candidates (preview, SAFE)
| from | to | bucket |
|---|---|---|
| `.eslintrc.server.json` | `docs/misc/eslintrc.server.json` | `other_docs` |
| `.github/PULL_REQUEST_TEMPLATE.md` | `docs/misc/PULL_REQUEST_TEMPLATE.md` | `other_docs` |
| `.github/workflows/catalogue-checks.yml` | `docs/misc/catalogue-checks.yml` | `other_docs` |
| `.github/workflows/console-check.yml` | `docs/misc/console-check.yml` | `other_docs` |
| `.github/workflows/generate-embeddings-optimized.yml` | `docs/misc/generate-embeddings-optimized.yml` | `other_docs` |
| `.github/workflows/generate-embeddings.yml` | `docs/misc/generate-embeddings.yml` | `other_docs` |
| `.github/workflows/iron-gate.yml` | `isa-archive/phase-reports/iron-gate.yml` | `phase_reports` |
| `.github/workflows/update-gs1-efrag-catalogue.yml` | `docs/misc/update-gs1-efrag-catalogue.yml` | `other_docs` |
| `.markdownlint.json` | `docs/misc/markdownlint.json` | `other_docs` |
| `ARCHITECTURE.md` | `docs/misc/ARCHITECTURE.md` | `other_docs` |
| `AUDIT_FINDINGS.md` | `isa-archive/reports/AUDIT_FINDINGS.md` | `reports_and_outputs` |
| `AUTONOMOUS_DEVELOPMENT_SUMMARY.md` | `docs/misc/AUTONOMOUS_DEVELOPMENT_SUMMARY.md` | `other_docs` |
| `CHATGPT_DELEGATION_PHASE1.md` | `isa-archive/phase-reports/CHATGPT_DELEGATION_PHASE1.md` | `phase_reports` |
| `CHATGPT_PROMPT_BATCH_INGEST_02_04_05_06.md` | `docs/misc/CHATGPT_PROMPT_BATCH_INGEST_02_04_05_06.md` | `other_docs` |
| `CHATGPT_PROMPT_INGEST-03.md` | `docs/misc/CHATGPT_PROMPT_INGEST-03.md` | `other_docs` |
| `CHATGPT_UPDATE_PROMPT.md` | `docs/misc/CHATGPT_UPDATE_PROMPT.md` | `other_docs` |
| `CHROMIUM_INSTALLATION_GUIDE.md` | `docs/misc/CHROMIUM_INSTALLATION_GUIDE.md` | `other_docs` |
| `CRON_DEPLOYMENT.md` | `docs/misc/CRON_DEPLOYMENT.md` | `other_docs` |
| `CURRENCY_DISCLOSURE.md` | `isa-archive/phase-reports/CURRENCY_DISCLOSURE.md` | `phase_reports` |
| `DATASET_INVENTORY.md` | `isa-archive/phase-reports/DATASET_INVENTORY.md` | `phase_reports` |
| `DATA_FILE_VERIFICATION_REPORT.md` | `isa-archive/reports/DATA_FILE_VERIFICATION_REPORT.md` | `reports_and_outputs` |
| `DATA_MODEL.md` | `docs/misc/DATA_MODEL.md` | `other_docs` |
| `DELEGATION_PACKAGE_INGEST-03.md` | `docs/misc/DELEGATION_PACKAGE_INGEST-03.md` | `other_docs` |
| `DIAGNOSTIC_REPORT.md` | `isa-archive/reports/DIAGNOSTIC_REPORT.md` | `reports_and_outputs` |
| `DOCUMENTATION_INVENTORY.md` | `isa-archive/phase-reports/DOCUMENTATION_INVENTORY.md` | `phase_reports` |
| `EPCIS_CBV_INTEGRATION_SUMMARY.md` | `docs/misc/EPCIS_CBV_INTEGRATION_SUMMARY.md` | `other_docs` |
| `EURLEX_SCRAPER_FIX.md` | `docs/misc/EURLEX_SCRAPER_FIX.md` | `other_docs` |
| `EU_ESG_to_GS1_Mapping_v1.1/CHANGELOG.md` | `docs/misc/CHANGELOG.md` | `other_docs` |
| `EU_ESG_to_GS1_Mapping_v1.1/DOCUMENT_VALUE_SCORECARD.md` | `docs/misc/DOCUMENT_VALUE_SCORECARD.md` | `other_docs` |
| `EU_ESG_to_GS1_Mapping_v1.1/EU_ESG_to_GS1_Mapping.md` | `docs/misc/EU_ESG_to_GS1_Mapping.md` | `other_docs` |
| `EU_ESG_to_GS1_Mapping_v1.1/INTEGRATION_POSITIONING.md` | `docs/misc/INTEGRATION_POSITIONING.md` | `other_docs` |
| `EU_ESG_to_GS1_Mapping_v1.1/MANIFEST.json` | `docs/misc/MANIFEST.json` | `other_docs` |
| `EU_ESG_to_GS1_Mapping_v1.1/MANUS_HANDOFF.md` | `docs/misc/MANUS_HANDOFF.md` | `other_docs` |
| `EU_ESG_to_GS1_Mapping_v1.1/README.md` | `docs/misc/README.md` | `other_docs` |
| `EU_ESG_to_GS1_Mapping_v1.1/VALIDATION_REPORT.md` | `isa-archive/reports/VALIDATION_REPORT.md` | `reports_and_outputs` |
| `EU_ESG_to_GS1_Mapping_v1.1/backlog.json` | `docs/planning/backlog.json` | `planning_docs` |
| `EU_ESG_to_GS1_Mapping_v1.1/checksums/SHA256SUMS.txt` | `docs/misc/SHA256SUMS.txt` | `other_docs` |
| `EU_ESG_to_GS1_Mapping_v1.1/data/atomic_requirements.json` | `docs/spec/atomic_requirements.json` | `spec_docs` |
| `EU_ESG_to_GS1_Mapping_v1.1/data/corpus.json` | `docs/misc/corpus.json` | `other_docs` |
| `EU_ESG_to_GS1_Mapping_v1.1/data/data_requirements.json` | `docs/spec/data_requirements.json` | `spec_docs` |
| `EU_ESG_to_GS1_Mapping_v1.1/data/gs1_mapping.json` | `docs/misc/gs1_mapping.json` | `other_docs` |
| `EU_ESG_to_GS1_Mapping_v1.1/data/gs1_sources.json` | `docs/misc/gs1_sources.json` | `other_docs` |
| `EU_ESG_to_GS1_Mapping_v1.1/data/obligations.json` | `docs/misc/obligations.json` | `other_docs` |
| `EU_ESG_to_GS1_Mapping_v1.1/data/scoring.json` | `docs/misc/scoring.json` | `other_docs` |
| `EU_ESG_to_GS1_Mapping_v1.1/schemas/atomic_requirements.schema.json` | `docs/spec/atomic_requirements.schema.json` | `spec_docs` |
| `EU_ESG_to_GS1_Mapping_v1.1/schemas/corpus.schema.json` | `docs/spec/corpus.schema.json` | `spec_docs` |
| `EU_ESG_to_GS1_Mapping_v1.1/schemas/data_requirements.schema.json` | `docs/spec/data_requirements.schema.json` | `spec_docs` |
| `EU_ESG_to_GS1_Mapping_v1.1/schemas/gs1_mapping.schema.json` | `docs/spec/gs1_mapping.schema.json` | `spec_docs` |
| `EU_ESG_to_GS1_Mapping_v1.1/schemas/obligations.schema.json` | `docs/spec/obligations.schema.json` | `spec_docs` |
| `EU_ESG_to_GS1_Mapping_v1.1/schemas/scoring.schema.json` | `docs/spec/scoring.schema.json` | `spec_docs` |
| `EU_ESG_to_GS1_Mapping_v1.1/validation/completeness_matrix.csv` | `docs/misc/completeness_matrix.csv` | `other_docs` |
| `EU_ESG_to_GS1_Mapping_v1.1/validation/consistency_report.txt` | `isa-archive/reports/consistency_report.txt` | `reports_and_outputs` |
| `EU_ESG_to_GS1_Mapping_v1.1/validation/placeholder_scan.txt` | `docs/misc/placeholder_scan.txt` | `other_docs` |
| `EXTERNAL_REFERENCES.md` | `docs/misc/EXTERNAL_REFERENCES.md` | `other_docs` |
| `GOVERNANCE.md` | `docs/governance/GOVERNANCE.md` | `governance_docs` |
| `GS1_ARTEFACT_PROCESSING.md` | `docs/misc/GS1_ARTEFACT_PROCESSING.md` | `other_docs` |
| `HEALTH_MONITORING_ENHANCEMENTS.md` | `docs/misc/HEALTH_MONITORING_ENHANCEMENTS.md` | `other_docs` |
| `INGESTION.md` | `docs/misc/INGESTION.md` | `other_docs` |
| `INGESTION_DELIVERABLES_INDEX.md` | `docs/misc/INGESTION_DELIVERABLES_INDEX.md` | `other_docs` |
| `INGESTION_SUMMARY_REPORT.md` | `isa-archive/reports/INGESTION_SUMMARY_REPORT.md` | `reports_and_outputs` |
| `IRON_KNOWLEDGE_MAP.md` | `docs/misc/IRON_KNOWLEDGE_MAP.md` | `other_docs` |
| `IRON_PROTOCOL.md` | `docs/misc/IRON_PROTOCOL.md` | `other_docs` |
| `IRON_VALIDATION_PLAN.md` | `docs/misc/IRON_VALIDATION_PLAN.md` | `other_docs` |
| `ISA_CAPABILITY_MAP.md` | `docs/misc/ISA_CAPABILITY_MAP.md` | `other_docs` |
| `ISA_DEVELOPMENT_PLAYBOOK.md` | `docs/misc/ISA_DEVELOPMENT_PLAYBOOK.md` | `other_docs` |
| `ISA_GATING_QUESTIONS.md` | `docs/misc/ISA_GATING_QUESTIONS.md` | `other_docs` |
| `ISA_GOVERNANCE.md` | `docs/governance/ISA_GOVERNANCE.md` | `governance_docs` |
| `ISA_GS1_ARTIFACT_INVENTORY.md` | `isa-archive/phase-reports/ISA_GS1_ARTIFACT_INVENTORY.md` | `phase_reports` |
| `ISA_NEWSHUB_AUDIT_UPDATED.md` | `isa-archive/reports/ISA_NEWSHUB_AUDIT_UPDATED.md` | `reports_and_outputs` |
| `ISA_NEWSHUB_TARGET_DESIGN.md` | `docs/misc/ISA_NEWSHUB_TARGET_DESIGN.md` | `other_docs` |
| `ISA_NEWS_OVERVIEW.md` | `docs/misc/ISA_NEWS_OVERVIEW.md` | `other_docs` |
| `ISA_STATUS_REPORT_2025-01-11.md` | `docs/planning/ISA_STATUS_REPORT_2025-01-11.md` | `planning_docs` |
| `ISA_TODO_MANUAL_COMPLETION.md` | `isa-archive/phase-reports/ISA_TODO_MANUAL_COMPLETION.md` | `phase_reports` |
| `ISA_V1_FROZEN.md` | `docs/misc/ISA_V1_FROZEN.md` | `other_docs` |
| `KNOWN_FAILURE_MODES.md` | `docs/misc/KNOWN_FAILURE_MODES.md` | `other_docs` |
| `MONITORING_TESTS.md` | `docs/misc/MONITORING_TESTS.md` | `other_docs` |
| `MULTI_REGULATION_COMPARISON_SUMMARY.md` | `docs/misc/MULTI_REGULATION_COMPARISON_SUMMARY.md` | `other_docs` |
| `NEEDS_USER_UPLOAD.md` | `docs/misc/NEEDS_USER_UPLOAD.md` | `other_docs` |
| `NEWS_HUB_PHASE4-6_SUMMARY.md` | `isa-archive/phase-reports/NEWS_HUB_PHASE4-6_SUMMARY.md` | `phase_reports` |
| `OPEN_QUESTIONS.md` | `docs/misc/OPEN_QUESTIONS.md` | `other_docs` |
| `ORCHESTRATION_PROMPT.md` | `docs/misc/ORCHESTRATION_PROMPT.md` | `other_docs` |
| `PHASE_9_CLAIMS_SANITIZATION_REPORT.md` | `isa-archive/phase-reports/PHASE_9_CLAIMS_SANITIZATION_REPORT.md` | `phase_reports` |
| `PHASE_9_COMPLETION_REPORT.md` | `isa-archive/phase-reports/PHASE_9_COMPLETION_REPORT.md` | `phase_reports` |
| `PHASE_9_DOCUMENTATION_INVENTORY.md` | `isa-archive/phase-reports/PHASE_9_DOCUMENTATION_INVENTORY.md` | `phase_reports` |
| `POC_EXPLORATION_TODO.md` | `docs/misc/POC_EXPLORATION_TODO.md` | `other_docs` |
| `PRODUCTION_READINESS.md` | `docs/misc/PRODUCTION_READINESS.md` | `other_docs` |
| `PROJECT_INVENTORY.md` | `isa-archive/phase-reports/PROJECT_INVENTORY.md` | `phase_reports` |
| `PROJECT_SIZE_CLEANUP.md` | `docs/misc/PROJECT_SIZE_CLEANUP.md` | `other_docs` |
| `QUICK_START_INGESTION.md` | `docs/misc/QUICK_START_INGESTION.md` | `other_docs` |
| `README.md` | `docs/misc/README.md` | `other_docs` |
| `REPO_MAP.md` | `docs/misc/REPO_MAP.md` | `other_docs` |
| `RESEARCH_FINDINGS_NEWS_SOURCES.md` | `docs/misc/RESEARCH_FINDINGS_NEWS_SOURCES.md` | `other_docs` |
| `ROADMAP.md` | `docs/planning/ROADMAP.md` | `planning_docs` |
| `ROADMAP_GITHUB_INTEGRATION.md` | `docs/planning/ROADMAP_GITHUB_INTEGRATION.md` | `planning_docs` |
| `ROOT_CAUSE_DIAGNOSTIC_REPORT.md` | `isa-archive/reports/ROOT_CAUSE_DIAGNOSTIC_REPORT.md` | `reports_and_outputs` |
| `SCOPE_DECISIONS.md` | `docs/misc/SCOPE_DECISIONS.md` | `other_docs` |
| `STABILIZATION_REPORT_2026-01-04.md` | `isa-archive/reports/STABILIZATION_REPORT_2026-01-04.md` | `reports_and_outputs` |
| `TIMELINE_VISUALIZATION_SUMMARY.md` | `docs/misc/TIMELINE_VISUALIZATION_SUMMARY.md` | `other_docs` |
| `TYPESCRIPT_FIX_SUMMARY.md` | `docs/misc/TYPESCRIPT_FIX_SUMMARY.md` | `other_docs` |
| `TYPESCRIPT_NOTES.md` | `docs/misc/TYPESCRIPT_NOTES.md` | `other_docs` |
| `UX_IA_REDESIGN_COMPLETE.md` | `docs/misc/UX_IA_REDESIGN_COMPLETE.md` | `other_docs` |
| `WEBHOOK_INTEGRATION.md` | `docs/misc/WEBHOOK_INTEGRATION.md` | `other_docs` |
| `WORK_PRIORITIZATION.md` | `docs/misc/WORK_PRIORITIZATION.md` | `other_docs` |
| `components.json` | `docs/misc/components.json` | `other_docs` |
| `config/catalogue_sources.json` | `docs/misc/catalogue_sources.json` | `other_docs` |
| `configs/isa-catalogue/policy.json` | `docs/misc/policy.json` | `other_docs` |
| `cron-configs/.github/workflows/isa-news-cron.yml` | `docs/misc/isa-news-cron.yml` | `other_docs` |
| `cron-configs/00-START-HERE.md` | `docs/misc/00-START-HERE.md` | `other_docs` |
| `cron-configs/README.md` | `docs/misc/README.md` | `other_docs` |
| `cron-configs/cron-job.org-instructions.md` | `docs/misc/cron-job.org-instructions.md` | `other_docs` |
| `cron-configs/curl-test-config.txt` | `docs/misc/curl-test-config.txt` | `other_docs` |
| `cron-configs/curl-test-instructions.md` | `docs/misc/curl-test-instructions.md` | `other_docs` |
| `cron-configs/easycron-instructions.md` | `docs/misc/easycron-instructions.md` | `other_docs` |
| `cron-configs/github-actions-instructions.md` | `docs/misc/github-actions-instructions.md` | `other_docs` |
| `cspell-gs1-terms.txt` | `docs/misc/cspell-gs1-terms.txt` | `other_docs` |
| `cspell-isa-terms.txt` | `docs/misc/cspell-isa-terms.txt` | `other_docs` |
| `cspell.json` | `docs/misc/cspell.json` | `other_docs` |
| `docs/ADVISORY_DIFF_METRICS.md` | `docs/misc/ADVISORY_DIFF_METRICS.md` | `docs_misc` |
| `docs/ADVISORY_METHOD.md` | `docs/misc/ADVISORY_METHOD.md` | `docs_misc` |
| `docs/ADVISORY_OUTPUTS.md` | `docs/misc/ADVISORY_OUTPUTS.md` | `docs_misc` |
| `docs/ADVISORY_UI_NOTES.md` | `docs/misc/ADVISORY_UI_NOTES.md` | `docs_misc` |
| `docs/AGENT_COLLABORATION_SUMMARY.md` | `docs/misc/AGENT_COLLABORATION_SUMMARY.md` | `docs_misc` |
| `docs/ALERTING_SYSTEM_DESIGN.md` | `docs/misc/ALERTING_SYSTEM_DESIGN.md` | `docs_misc` |
| `docs/ALIGNMENT_CHECK_2026_01_03.md` | `docs/misc/ALIGNMENT_CHECK_2026_01_03.md` | `docs_misc` |
| `docs/ALTERNATIVE_FUTURES_EXPLORATION.md` | `docs/misc/ALTERNATIVE_FUTURES_EXPLORATION.md` | `docs_misc` |
| `docs/API_REFERENCE.md` | `docs/spec/API_REFERENCE.md` | `spec_docs` |
| `docs/ASK_ISA_GUARDRAILS.md` | `docs/misc/ASK_ISA_GUARDRAILS.md` | `docs_misc` |
| `docs/ASK_ISA_QUERY_LIBRARY.md` | `docs/misc/ASK_ISA_QUERY_LIBRARY.md` | `docs_misc` |
| `docs/ASK_ISA_QUERY_LIBRARY_v1.md` | `docs/misc/ASK_ISA_QUERY_LIBRARY_v1.md` | `docs_misc` |
| `docs/ASK_ISA_TEST_RESULTS.md` | `docs/misc/ASK_ISA_TEST_RESULTS.md` | `docs_misc` |
| `docs/Autonomous_Development_Plan.md` | `docs/planning/Autonomous_Development_Plan.md` | `planning_docs` |
| `docs/BASELINE_V2_DECISION_GRADE.md` | `docs/misc/BASELINE_V2_DECISION_GRADE.md` | `docs_misc` |
| `docs/CELLAR_INGESTION_DEPLOYMENT.md` | `docs/misc/CELLAR_INGESTION_DEPLOYMENT.md` | `docs_misc` |
| `docs/CGPT-01_INTEGRATION_REPORT.md` | `isa-archive/reports/CGPT-01_INTEGRATION_REPORT.md` | `reports_and_outputs` |
| `docs/CHANGELOG.md` | `docs/misc/CHANGELOG.md` | `docs_misc` |
| `docs/CHANGELOG_FOR_CHATGPT.md` | `docs/misc/CHANGELOG_FOR_CHATGPT.md` | `docs_misc` |
| `docs/CHANGELOG_SUMMARY.md` | `docs/misc/CHANGELOG_SUMMARY.md` | `docs_misc` |
| `docs/CHATGPT_COLLABORATION_ANALYSIS.md` | `docs/misc/CHATGPT_COLLABORATION_ANALYSIS.md` | `docs_misc` |
| `docs/CHATGPT_INTEGRATION_CONTRACT.md` | `docs/misc/CHATGPT_INTEGRATION_CONTRACT.md` | `docs_misc` |
| `docs/CHATGPT_INTEGRATION_WORKFLOW.md` | `docs/misc/CHATGPT_INTEGRATION_WORKFLOW.md` | `docs_misc` |
| `docs/CHATGPT_WORK_PARCEL_02_ASK_ISA_EXPANSION.md` | `docs/misc/CHATGPT_WORK_PARCEL_02_ASK_ISA_EXPANSION.md` | `docs_misc` |
| `docs/CHATGPT_WORK_PARCEL_SUMMARY.md` | `docs/misc/CHATGPT_WORK_PARCEL_SUMMARY.md` | `docs_misc` |
| `docs/CI_TESTING.md` | `docs/misc/CI_TESTING.md` | `docs_misc` |
| `docs/CLEANUP_REPORT.md` | `isa-archive/reports/CLEANUP_REPORT.md` | `reports_and_outputs` |
| `docs/CODEX_DELEGATION_SPEC.md` | `docs/spec/CODEX_DELEGATION_SPEC.md` | `spec_docs` |
| `docs/COMPLETION_SUMMARY.md` | `isa-archive/phase-reports/COMPLETION_SUMMARY.md` | `phase_reports` |
| `docs/COORDINATION_WORKFLOW.md` | `docs/misc/COORDINATION_WORKFLOW.md` | `docs_misc` |
| `docs/CRITICAL_EVENTS_TAXONOMY.md` | `docs/misc/CRITICAL_EVENTS_TAXONOMY.md` | `docs_misc` |
| `docs/CRON_QUICK_START.md` | `docs/misc/CRON_QUICK_START.md` | `docs_misc` |
| `docs/CRON_SETUP_GUIDE.md` | `docs/misc/CRON_SETUP_GUIDE.md` | `docs_misc` |
| `docs/DATASETS_CATALOG.json` | `docs/misc/DATASETS_CATALOG.json` | `docs_misc` |
| `docs/DATASETS_CATALOG.md` | `docs/misc/DATASETS_CATALOG.md` | `docs_misc` |
| `docs/DATASET_CANDIDATES_DETAILED.md` | `docs/misc/DATASET_CANDIDATES_DETAILED.md` | `docs_misc` |
| `docs/DATASET_PRIORITY_ANALYSIS.md` | `docs/planning/DATASET_PRIORITY_ANALYSIS.md` | `planning_docs` |
| `docs/DAY1_COMPLETION_REPORT.md` | `isa-archive/phase-reports/DAY1_COMPLETION_REPORT.md` | `phase_reports` |
| `docs/DECISION_BRIEF_ESRS_SCHEMA_MISMATCH.md` | `docs/spec/DECISION_BRIEF_ESRS_SCHEMA_MISMATCH.md` | `spec_docs` |
| `docs/DECISION_CONTEXT_ANALYSIS.md` | `docs/misc/DECISION_CONTEXT_ANALYSIS.md` | `docs_misc` |
| `docs/DEMO_NARRATIVES.md` | `docs/misc/DEMO_NARRATIVES.md` | `docs_misc` |
| `docs/DEPLOYMENT.md` | `docs/misc/DEPLOYMENT.md` | `docs_misc` |
| `docs/DEPLOYMENT_GUIDE.md` | `docs/misc/DEPLOYMENT_GUIDE.md` | `docs_misc` |
| `docs/DEVELOPMENT_PROGRESS_2026-02-01.md` | `docs/misc/DEVELOPMENT_PROGRESS_2026-02-01.md` | `docs_misc` |
| `docs/DEVELOPMENT_SESSION_2026-02-01.md` | `docs/misc/DEVELOPMENT_SESSION_2026-02-01.md` | `docs_misc` |
| `docs/Data_Quality_Updates_Plan.md` | `docs/misc/Data_Quality_Updates_Plan.md` | `docs_misc` |
| `docs/Dutch_Initiatives_Data_Model.md` | `docs/misc/Dutch_Initiatives_Data_Model.md` | `docs_misc` |
| `docs/EMBEDDING_OPTIMIZATION_ANALYSIS.md` | `docs/misc/EMBEDDING_OPTIMIZATION_ANALYSIS.md` | `docs_misc` |
| `docs/EMBEDDING_PIPELINE_OPTIMIZATION.md` | `docs/misc/EMBEDDING_PIPELINE_OPTIMIZATION.md` | `docs_misc` |
| `docs/EMBEDDING_QUALITY_IMPROVEMENT_REPORT.md` | `isa-archive/reports/EMBEDDING_QUALITY_IMPROVEMENT_REPORT.md` | `reports_and_outputs` |
| `docs/EMBEDDING_WORKFLOW_OPTIMIZATION_REPORT.md` | `isa-archive/reports/EMBEDDING_WORKFLOW_OPTIMIZATION_REPORT.md` | `reports_and_outputs` |
| `docs/ENHANCED_EMBEDDING_SCHEMA.md` | `docs/spec/ENHANCED_EMBEDDING_SCHEMA.md` | `spec_docs` |
| `docs/ESG_Hub_MVP_Polish_Plan.md` | `docs/misc/ESG_Hub_MVP_Polish_Plan.md` | `docs_misc` |
| `docs/ESG_INTEGRATION_FINAL_REPORT.md` | `isa-archive/reports/ESG_INTEGRATION_FINAL_REPORT.md` | `reports_and_outputs` |
| `docs/FEATURE_DISCOVERY_REPORT.md` | `isa-archive/reports/FEATURE_DISCOVERY_REPORT.md` | `reports_and_outputs` |
| `docs/FILE_SYSTEM_MEMORY_ARCHITECTURE.md` | `docs/misc/FILE_SYSTEM_MEMORY_ARCHITECTURE.md` | `docs_misc` |
| `docs/FINAL_ISA_GRADE_RESCORE.md` | `docs/misc/FINAL_ISA_GRADE_RESCORE.md` | `docs_misc` |
| `docs/FINAL_RESCORE_POST_PIPELINE.md` | `docs/misc/FINAL_RESCORE_POST_PIPELINE.md` | `docs_misc` |
| `docs/GATING_QUESTIONS_EVIDENCE_INVENTORY.md` | `isa-archive/phase-reports/GATING_QUESTIONS_EVIDENCE_INVENTORY.md` | `phase_reports` |
| `docs/GITHUB_PROVISIONING_REPORT.md` | `isa-archive/reports/GITHUB_PROVISIONING_REPORT.md` | `reports_and_outputs` |
| `docs/GITHUB_PUSH_WORKFLOW.md` | `docs/misc/GITHUB_PUSH_WORKFLOW.md` | `docs_misc` |
| `docs/GOVERNANCE_FINAL_SUMMARY.md` | `docs/governance/GOVERNANCE_FINAL_SUMMARY.md` | `governance_docs` |
| `docs/GOVERNANCE_PHASE_2_3_REPORT.md` | `docs/governance/GOVERNANCE_PHASE_2_3_REPORT.md` | `governance_docs` |
| `docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` | `docs/governance/GOVERNANCE_SELF_CHECK_2025-12-17.md` | `governance_docs` |
| `docs/GS1_ARTEFACTS_ALIGNMENT_VALIDATION.md` | `docs/misc/GS1_ARTEFACTS_ALIGNMENT_VALIDATION.md` | `docs_misc` |
| `docs/GS1_Attribute_Mapper_Technical_Specification.md` | `docs/spec/GS1_Attribute_Mapper_Technical_Specification.md` | `spec_docs` |
| `docs/GS1_BRAND_RESEARCH_NOTES.md` | `docs/misc/GS1_BRAND_RESEARCH_NOTES.md` | `docs_misc` |
| `docs/GS1_DATA_MODELS.md` | `docs/misc/GS1_DATA_MODELS.md` | `docs_misc` |
| `docs/GS1_DOCUMENTS_DATASETS_ANALYSIS.md` | `docs/misc/GS1_DOCUMENTS_DATASETS_ANALYSIS.md` | `docs_misc` |
| `docs/GS1_EU_PCF_EXTRACTION_NOTES.md` | `docs/misc/GS1_EU_PCF_EXTRACTION_NOTES.md` | `docs_misc` |
| `docs/GS1_EU_PCF_INTEGRATION_SUMMARY.md` | `docs/misc/GS1_EU_PCF_INTEGRATION_SUMMARY.md` | `docs_misc` |
| `docs/GS1_EU_PCF_TO_ESRS_E1_MAPPINGS.md` | `docs/misc/GS1_EU_PCF_TO_ESRS_E1_MAPPINGS.md` | `docs_misc` |
| `docs/GS1_STYLE_COMPLIANCE_FINAL_REPORT.md` | `isa-archive/reports/GS1_STYLE_COMPLIANCE_FINAL_REPORT.md` | `reports_and_outputs` |
| `docs/GS1_STYLE_GUIDE_INGESTION_SUMMARY.md` | `docs/misc/GS1_STYLE_GUIDE_INGESTION_SUMMARY.md` | `docs_misc` |
| `docs/GS1_STYLE_QUICK_REFERENCE.md` | `docs/misc/GS1_STYLE_QUICK_REFERENCE.md` | `docs_misc` |
| `docs/INGESTION_DELEGATION_SUMMARY.md` | `docs/misc/INGESTION_DELEGATION_SUMMARY.md` | `docs_misc` |
| `docs/INGESTION_GUIDE.md` | `docs/misc/INGESTION_GUIDE.md` | `docs_misc` |
| `docs/INSTRUCTION_EVALUATION_ANALYSIS.md` | `docs/misc/INSTRUCTION_EVALUATION_ANALYSIS.md` | `docs_misc` |
| `docs/INVENTORY_AFTER.csv` | `isa-archive/phase-reports/INVENTORY_AFTER.csv` | `phase_reports` |
| `docs/INVENTORY_BEFORE.csv` | `isa-archive/phase-reports/INVENTORY_BEFORE.csv` | `phase_reports` |
| `docs/INVENTORY_FINAL.csv` | `isa-archive/phase-reports/INVENTORY_FINAL.csv` | `phase_reports` |
| `docs/ISA_AGENT_COLLABORATION.md` | `docs/misc/ISA_AGENT_COLLABORATION.md` | `docs_misc` |
| `docs/ISA_AUTONOMOUS_ROADMAP_V1.md` | `docs/planning/ISA_AUTONOMOUS_ROADMAP_V1.md` | `planning_docs` |
| `docs/ISA_BRAND_POSITIONING.md` | `docs/misc/ISA_BRAND_POSITIONING.md` | `docs_misc` |
| `docs/ISA_COMPARATIVE_REFACTOR_GATE_PLAN.md` | `isa-archive/phase-reports/ISA_COMPARATIVE_REFACTOR_GATE_PLAN.md` | `phase_reports` |
| `docs/ISA_DATA_NEEDS_AND_PRIORITIES.md` | `docs/misc/ISA_DATA_NEEDS_AND_PRIORITIES.md` | `docs_misc` |
| `docs/ISA_DELIVERY_MODEL.md` | `docs/misc/ISA_DELIVERY_MODEL.md` | `docs_misc` |
| `docs/ISA_DEPLOYMENT_AND_ROADMAP.md` | `docs/planning/ISA_DEPLOYMENT_AND_ROADMAP.md` | `planning_docs` |
| `docs/ISA_DEVELOPMENT_ROADMAP_TO_FINAL_PRODUCT.md` | `docs/planning/ISA_DEVELOPMENT_ROADMAP_TO_FINAL_PRODUCT.md` | `planning_docs` |
| `docs/ISA_DEVELOPMENT_STATUS.md` | `docs/planning/ISA_DEVELOPMENT_STATUS.md` | `planning_docs` |
| `docs/ISA_DOCUMENTATION_MAP.md` | `docs/misc/ISA_DOCUMENTATION_MAP.md` | `docs_misc` |
| `docs/ISA_Development_Roadmap_2026.md` | `docs/planning/ISA_Development_Roadmap_2026.md` | `planning_docs` |
| `docs/ISA_ESG_GS1_CANONICAL_MODEL.md` | `docs/misc/ISA_ESG_GS1_CANONICAL_MODEL.md` | `docs_misc` |
| `docs/ISA_FUTURE_DEVELOPMENT_PLAN.md` | `docs/planning/ISA_FUTURE_DEVELOPMENT_PLAN.md` | `planning_docs` |
| `docs/ISA_First_Advisory_Report_GS1NL.md` | `isa-archive/reports/ISA_First_Advisory_Report_GS1NL.md` | `reports_and_outputs` |
| `docs/ISA_First_Advisory_Report_GS1NL_v1.1_UPDATE.md` | `isa-archive/reports/ISA_First_Advisory_Report_GS1NL_v1.1_UPDATE.md` | `reports_and_outputs` |
| `docs/ISA_GS1_PRE_EXECUTION_PREPARATION.md` | `docs/misc/ISA_GS1_PRE_EXECUTION_PREPARATION.md` | `docs_misc` |
| `docs/ISA_IMPLEMENTATION_EXECUTION_PLAN.md` | `docs/planning/ISA_IMPLEMENTATION_EXECUTION_PLAN.md` | `planning_docs` |
| `docs/ISA_INFORMATION_ARCHITECTURE.md` | `docs/misc/ISA_INFORMATION_ARCHITECTURE.md` | `docs_misc` |
| `docs/ISA_NEVER_AGAIN_ARCHITECTURAL_CONTRACT.md` | `docs/misc/ISA_NEVER_AGAIN_ARCHITECTURAL_CONTRACT.md` | `docs_misc` |
| `docs/ISA_NEWSHUB_EVOLUTION_SUMMARY.md` | `docs/misc/ISA_NEWSHUB_EVOLUTION_SUMMARY.md` | `docs_misc` |
| `docs/ISA_NEWS_HUB_SELF_CHECK_ASSESSMENT.md` | `docs/misc/ISA_NEWS_HUB_SELF_CHECK_ASSESSMENT.md` | `docs_misc` |
| `docs/ISA_NEXT_PHASE_DEVELOPMENT_PLAN.md` | `docs/planning/ISA_NEXT_PHASE_DEVELOPMENT_PLAN.md` | `planning_docs` |
