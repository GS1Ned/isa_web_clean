# Repository Tree

Generated on: 2026-03-02T04:29:50Z

```
.
├── .amazonq
│   ├── default.json
│   └── rules
│       ├── agent-context.md
│       ├── canonical_documents_rules.md
│       ├── mcp-usage.md
│       └── memory-bank
│           ├── guidelines.md
│           ├── product.md
│           ├── structure.md
│           └── tech.md
├── .codex
│   └── config.toml
├── .env.example
├── .eslintrc.server.json
├── .github
│   ├── PULL_REQUEST_TEMPLATE.md
│   ├── copilot-instructions.md
│   └── workflows
│       ├── ask-isa-runtime-smoke.yml
│       ├── ask-isa-smoke.yml
│       ├── canonical-contract-drift.yml
│       ├── catalogue-checks.yml.disabled
│       ├── console-check.yml.disabled
│       ├── generate-embeddings-optimized.yml.disabled
│       ├── generate-embeddings.yml.disabled
│       ├── iron-gate.yml.disabled
│       ├── isa-capability-baseline-weekly.yml
│       ├── isa-capability-eval-nightly.yml
│       ├── mcp-validation-profiles.yml
│       ├── no-console-gate.yml
│       ├── q-branch-ci.yml
│       ├── rag-eval-fixtures.yml
│       ├── refactoring-validation.yml
│       ├── release-artifacts.yml
│       ├── repo-tree.yml
│       ├── schema-validation.yml
│       ├── security-gate.yml
│       ├── security-secrets-scan.yml
│       ├── tiered-tests.yml
│       ├── update-gs1-efrag-catalogue.yml.disabled
│       └── validate-docs.yml
├── .gitignore
├── .gitkeep
├── .markdownlint.json
├── .mcp.json
├── .pat_test
├── .prettierignore
├── .prettierrc
├── .vscode
│   ├── mcp.json
│   └── tasks.json
├── 00_AUTONOMY_SETUP_INDEX.md
├── AGENTS.md
├── AGENT_START_HERE.md
├── CODEOWNERS
├── COPILOT_LAUNCH.txt
├── EU_ESG_to_GS1_Mapping_v1.1
│   ├── CHANGELOG.md
│   ├── DOCUMENT_VALUE_SCORECARD.md
│   ├── EU_ESG_to_GS1_Mapping.md
│   ├── INTEGRATION_POSITIONING.md
│   ├── MANIFEST.json
│   ├── MANUS_HANDOFF.md
│   ├── README.md
│   ├── VALIDATION_REPORT.md
│   ├── backlog.json
│   ├── checksums
│   │   └── SHA256SUMS.txt
│   ├── data
│   │   ├── atomic_requirements.json
│   │   ├── corpus.json
│   │   ├── data_requirements.json
│   │   ├── gs1_mapping.json
│   │   ├── gs1_sources.json
│   │   ├── obligations.json
│   │   └── scoring.json
│   ├── schemas
│   │   ├── atomic_requirements.schema.json
│   │   ├── corpus.schema.json
│   │   ├── data_requirements.schema.json
│   │   ├── gs1_mapping.schema.json
│   │   ├── obligations.schema.json
│   │   └── scoring.schema.json
│   └── validation
│       ├── completeness_matrix.csv
│       ├── consistency_report.txt
│       └── placeholder_scan.txt
├── ISA_MAP.md
├── QUICK_START.md
├── README.md
├── REPO_TREE.md
├── SETUP_COMPLETE.md
├── _golden_gate_roadmaps_move_map.json
├── client
│   ├── index.html
│   ├── public
│   │   ├── .gitkeep
│   │   └── og-image.png
│   └── src
│       ├── App.tsx
│       ├── _core
│       │   └── hooks
│       │       └── useAuth.ts
│       ├── components
│       │   ├── AIChatBox.tsx
│       │   ├── AdvancedSearchFilters.tsx
│       │   ├── AskISAFeedbackButtons.tsx
│       │   ├── AskISAWidget.tsx
│       │   ├── AuthorityBadge.tsx
│       │   ├── Breadcrumbs.tsx
│       │   ├── CompareTimelines.tsx
│       │   ├── ComplianceCoverageChart.tsx
│       │   ├── DashboardLayout.tsx
│       │   ├── DashboardLayoutSkeleton.tsx
│       │   ├── DisclaimerBanner.tsx
│       │   ├── ESRSDatapointsSection.tsx
│       │   ├── EnhancedSearchPanel.tsx
│       │   ├── ErrorBoundary.tsx
│       │   ├── EventContext.tsx
│       │   ├── ExportButtons.tsx
│       │   ├── FeedbackButtons.tsx
│       │   ├── Footer.tsx
│       │   ├── GS1AttributesPanel.tsx
│       │   ├── GS1AttributesPanelEnhanced.tsx
│       │   ├── GS1ImpactBadge.tsx
│       │   ├── GapAnalysisPanel.tsx
│       │   ├── LatestNewsPanel.test.tsx
│       │   ├── LatestNewsPanel.tsx
│       │   ├── ManusDialog.tsx
│       │   ├── Map.tsx
│       │   ├── NavigationMenu.tsx
│       │   ├── NewsCard.tsx
│       │   ├── NewsCardCompact.tsx
│       │   ├── NewsCardSkeleton.tsx
│       │   ├── NewsRecommendationCard.tsx
│       │   ├── NewsTimeline.test.tsx
│       │   ├── NewsTimeline.test.tsx.disabled
│       │   ├── NewsTimeline.tsx
│       │   ├── NewsTimelineItem.tsx
│       │   ├── PageLayout.tsx
│       │   ├── PipelineStatusBanner.tsx
│       │   ├── RecommendedResources.tsx
│       │   ├── RegulationTimeline.tsx
│       │   ├── SectorFilter.tsx
│       │   ├── WebhookConfiguration.test.tsx
│       │   ├── WebhookConfiguration.tsx
│       │   ├── charts
│       │   │   ├── DurationTrendChart.tsx
│       │   │   ├── ItemsFetchedTrendChart.tsx
│       │   │   └── SuccessRateTrendChart.tsx
│       │   └── ui
│       │       ├── accordion.tsx
│       │       ├── alert-dialog.tsx
│       │       ├── alert.tsx
│       │       ├── aspect-ratio.tsx
│       │       ├── avatar.tsx
│       │       ├── badge.tsx
│       │       ├── breadcrumb.tsx
│       │       ├── button-group.tsx
│       │       ├── button.tsx
│       │       ├── calendar.tsx
│       │       ├── card.tsx
│       │       ├── carousel.tsx
│       │       ├── chart.tsx
│       │       ├── checkbox.tsx
│       │       ├── collapsible.tsx
│       │       ├── command.tsx
│       │       ├── context-menu.tsx
│       │       ├── dialog.tsx
│       │       ├── drawer.tsx
│       │       ├── dropdown-menu.tsx
│       │       ├── empty.tsx
│       │       ├── field.tsx
│       │       ├── form.tsx
│       │       ├── hover-card.tsx
│       │       ├── input-group.tsx
│       │       ├── input-otp.tsx
│       │       ├── input.tsx
│       │       ├── item.tsx
│       │       ├── kbd.tsx
│       │       ├── label.tsx
│       │       ├── menubar.tsx
│       │       ├── navigation-menu.tsx
│       │       ├── pagination.tsx
│       │       ├── popover.tsx
│       │       ├── progress.tsx
│       │       ├── radio-group.tsx
│       │       ├── resizable.tsx
│       │       ├── scroll-area.tsx
│       │       ├── select-custom.tsx
│       │       ├── select.tsx
│       │       ├── separator.tsx
│       │       ├── sheet.tsx
│       │       ├── sidebar.tsx
│       │       ├── skeleton.tsx
│       │       ├── slider.tsx
│       │       ├── sonner.tsx
│       │       ├── spinner.tsx
│       │       ├── switch.tsx
│       │       ├── table.tsx
│       │       ├── tabs.tsx
│       │       ├── textarea.tsx
│       │       ├── toggle-group.tsx
│       │       ├── toggle.tsx
│       │       └── tooltip.tsx
│       ├── const.ts
│       ├── contexts
│       │   └── ThemeContext.tsx
│       ├── hooks
│       │   ├── useComposition.ts
│       │   ├── useMobile.tsx
│       │   └── usePersistFn.ts
│       ├── index.css
│       ├── lib
│       │   ├── export.ts
│       │   ├── i18n.tsx
│       │   ├── regulation-milestones.ts
│       │   ├── regulation-search.ts
│       │   ├── trpc.ts
│       │   └── utils.ts
│       ├── main.tsx
│       ├── pages
│       │   ├── AIGapAnalysisWizard.tsx
│       │   ├── About.tsx
│       │   ├── AdminAnalyticsDashboard.tsx
│       │   ├── AdminEUDRSeeder.tsx
│       │   ├── AdminEvidenceVerification.tsx
│       │   ├── AdminFeedbackDashboard.tsx
│       │   ├── AdminKnowledgeBase.tsx
│       │   ├── AdminMonitoring.tsx
│       │   ├── AdminNewsPanel.tsx
│       │   ├── AdminNewsPipelineManager.tsx
│       │   ├── AdminPanel.tsx
│       │   ├── AdminPipelineObservability.tsx
│       │   ├── AdminPromptOptimization.tsx
│       │   ├── AdminScraperHealth.tsx
│       │   ├── AdminTemplateManager.tsx
│       │   ├── AdvisoryDashboard.tsx
│       │   ├── AdvisoryDiff.tsx
│       │   ├── AdvisoryDiffComparison.tsx
│       │   ├── AdvisoryExplorer.tsx
│       │   ├── AdvisoryReports.tsx
│       │   ├── AdvisoryTraceability.tsx
│       │   ├── AskISA.tsx
│       │   ├── AskISAEnhanced.tsx
│       │   ├── AttributeRecommender.tsx
│       │   ├── BarcodeScanner.tsx
│       │   ├── Blog.tsx
│       │   ├── CompareRegulations.tsx
│       │   ├── ComparisonTool.tsx
│       │   ├── ComplianceChecklistGenerator.tsx
│       │   ├── ComplianceMonitoringDashboard.tsx
│       │   ├── ComplianceReport.tsx
│       │   ├── ComplianceRoadmap.tsx
│       │   ├── ComplianceScoreboard.tsx
│       │   ├── ComponentShowcase.tsx
│       │   ├── Contact.tsx
│       │   ├── Dashboard.tsx
│       │   ├── DataQuality.tsx
│       │   ├── DatasetRegistry.tsx
│       │   ├── DualCoreDemo.tsx
│       │   ├── EPCISEUDRMap.tsx
│       │   ├── EPCISSupplyChain.tsx
│       │   ├── EPCISUpload.tsx
│       │   ├── EPCISUploadEnhanced.tsx
│       │   ├── ESRSDatapoints.tsx
│       │   ├── EsgPriorities.tsx
│       │   ├── EsgTraceability.tsx
│       │   ├── EvaluationDashboard.tsx
│       │   ├── EventDetail.tsx
│       │   ├── EventsOverview.tsx
│       │   ├── ExecutiveScorecard.tsx
│       │   ├── ExternalAPIIntegration.tsx
│       │   ├── FAQ.tsx
│       │   ├── Features.tsx
│       │   ├── FeaturesComparison.tsx
│       │   ├── GS1NLAttributeBrowser.tsx
│       │   ├── GapAnalysis.tsx
│       │   ├── GapAnalyzer.tsx
│       │   ├── GettingStarted.tsx
│       │   ├── GovernanceDocuments.tsx
│       │   ├── Home.tsx
│       │   ├── HowItWorks.tsx
│       │   ├── HubAbout.tsx
│       │   ├── HubCalendar.tsx
│       │   ├── HubCompare.tsx
│       │   ├── HubCompareEnhanced.tsx
│       │   ├── HubDutchInitiativeDetail.tsx
│       │   ├── HubDutchInitiatives.tsx
│       │   ├── HubEsrsGs1Mappings.tsx
│       │   ├── HubHome.tsx
│       │   ├── HubImpactMatrix.tsx
│       │   ├── HubNews.tsx
│       │   ├── HubRegulationDetail.tsx
│       │   ├── HubRegulationDetailEnhanced.tsx
│       │   ├── HubRegulations.tsx
│       │   ├── HubResources.tsx
│       │   ├── HubStandardsMapping.tsx
│       │   ├── HubUserDashboard.tsx
│       │   ├── ImpactSimulator.tsx
│       │   ├── IndustryTemplates.tsx
│       │   ├── IndustryTemplatesGS1NL.tsx
│       │   ├── NewsAdmin.tsx
│       │   ├── NewsDetail.tsx
│       │   ├── NewsHub.tsx
│       │   ├── NotFound.tsx
│       │   ├── NotificationPreferences.tsx
│       │   ├── PrivacyPolicy.tsx
│       │   ├── RegulatoryChangeLog.tsx
│       │   ├── RiskRemediation.tsx
│       │   ├── RoadmapCollaboration.tsx
│       │   ├── StakeholderDashboard.tsx
│       │   ├── StandardDetail.tsx
│       │   ├── StandardsDirectory.tsx
│       │   ├── SupplyChainDashboard.tsx
│       │   ├── SystemMonitoring.tsx
│       │   ├── TemplateAnalyticsDashboard.tsx
│       │   ├── TemplateLibrary.tsx
│       │   ├── TermsOfService.tsx
│       │   ├── ToolsComplianceRoadmap.tsx
│       │   ├── UseCases.tsx
│       │   └── admin
│       │       ├── CoverageAnalytics.tsx
│       │       └── ObservabilityDashboard.tsx
│       └── select-fix.css
├── components.json
├── config
│   ├── catalogue_sources.json
│   ├── governance
│   │   ├── canonical_docs_allowlist.json
│   │   ├── golden-gate.policy.json
│   │   └── openclaw_policy_envelope.json
│   ├── isa-catalogue
│   │   └── policy.json
│   ├── openclaw
│   │   ├── browser.policy.json
│   │   ├── exec-lane.policy.json
│   │   └── skills-allowlist.json
│   └── testing
│       └── vitest.quarantine.txt
├── cspell.json
├── data
│   ├── DATASET_METADATA.md
│   ├── adb_release_2.11.csv
│   ├── advisories
│   │   ├── ISA_ADVISORY_DIFF_v1.0_to_v1.0.json
│   │   ├── ISA_ADVISORY_DIFF_v1.0_to_v1.1.json
│   │   ├── ISA_ADVISORY_DIFF_v1.1_to_v1.1.json
│   │   ├── ISA_ADVISORY_v1.0.json
│   │   ├── ISA_ADVISORY_v1.0.summary.json
│   │   ├── ISA_ADVISORY_v1.1.json
│   │   └── ISA_ADVISORY_v1.1.summary.json
│   ├── cbv
│   │   └── cbv_esg_curated.json
│   ├── cbv_bizstep.json
│   ├── cbv_bizstep_raw.txt
│   ├── cbv_vocabularies.json
│   ├── digital_link
│   │   └── linktypes.json
│   ├── dpp-content
│   │   ├── dpp-fundamentals.json
│   │   └── dpp-granular-fixes.json
│   ├── dpp_standard_summary.md
│   ├── efrag
│   │   ├── EFRAGIG3ListofESRSDataPoints.xlsx
│   │   └── esrs-set1-taxonomy-2024-08-30.xlsx
│   ├── epcis_classes_raw.txt
│   ├── epcis_fields_raw.txt
│   ├── esg
│   │   ├── common_data_categories.json
│   │   ├── ctes_and_kdes.json
│   │   ├── dpp_identification_rules.json
│   │   └── dpp_identifier_components.json
│   ├── evaluation
│   │   ├── baselines
│   │   │   ├── isa-capability-baseline-stage_b.json
│   │   │   ├── isa-capability-baseline-v2-candidate.json
│   │   │   └── isa-capability-baseline.json
│   │   └── golden
│   │       ├── advisory
│   │       │   ├── scenarios_v1.json
│   │       │   └── scenarios_v2.json
│   │       ├── ask_isa
│   │       │   ├── questions_v1.json
│   │       │   └── questions_v2.json
│   │       ├── catalog
│   │       │   ├── records_v1.json
│   │       │   └── records_v2.json
│   │       ├── esrs_mapping
│   │       │   ├── mappings_v1.jsonl
│   │       │   └── mappings_v2.jsonl
│   │       ├── knowledge_base
│   │       │   ├── corpus_slice_v1.jsonl
│   │       │   ├── corpus_slice_v2.jsonl
│   │       │   ├── metadata_gold_v1.json
│   │       │   └── metadata_gold_v2.json
│   │       ├── news_hub
│   │       │   ├── timeline_v1.json
│   │       │   └── timeline_v2.json
│   │       └── registry.json
│   ├── gdm_combined_models.csv
│   ├── gs1
│   │   └── gdsn
│   │       ├── gdsn_classAttributes.json
│   │       ├── gdsn_classes.json
│   │       └── gdsn_validationRules.json
│   ├── gs1_position_paper_summary.md
│   ├── gs1_ref_corpus
│   │   ├── README.md
│   │   ├── authoritative_documents_report.md
│   │   ├── gs1_document_index.json
│   │   ├── gs1_document_index_v2.json
│   │   ├── gs1_ref_taxonomy_v1.json
│   │   └── metadata
│   │       ├── discovered_urls.txt
│   │       ├── manifest.json
│   │       ├── metadata.csv
│   │       └── metadata.jsonl
│   ├── gs1_standards_recent_updates.txt
│   ├── gs1_web_vocab
│   │   └── gs1Voc.jsonld
│   ├── gs1nl
│   │   ├── benelux-fmcg-datamodel-3.1.34.2.xlsx
│   │   ├── benelux-healthcare-datamodel-3.1.31.xlsx
│   │   ├── diy_datamodel_content.json
│   │   ├── fashion_dpp_guidance_content.json
│   │   ├── fmcg_datamodel_content.json
│   │   ├── healthcare_datamodel_content.json
│   │   └── sustainability_guidance_content.json
│   ├── metadata
│   │   ├── REGISTRY_LOCK.md
│   │   ├── artifact_move_manifest_2026-02-14.json
│   │   ├── dataset_registry.json
│   │   ├── dataset_registry.schema.json
│   │   ├── dataset_registry_v1.0.0_BACKUP.json
│   │   ├── dataset_registry_v1.0_FROZEN.json
│   │   ├── dataset_registry_v1.3.0_DRAFT.json
│   │   ├── external_repos_archive2.json
│   │   ├── gs1_ref_bundle_registry.json
│   │   ├── gs1_style_guide_registry.json
│   │   └── rag_eval_fixtures_v1.json
│   └── standards
│       ├── gs1-eu
│       │   └── gdsn
│       │       └── carbon-footprint
│       │           └── v1.0
│       └── gs1-nl
│           └── benelux-datasource
│               └── v3.1.33
│                   ├── 3131_common-echo-datamodel_24-05-2025-v3.xlsx
│                   ├── GS1 Data Source Datamodel 3.1.33.xlsx
│                   ├── benelux-fmcg-data-model-31335-nederlands.xlsx
│                   ├── common-echo-datamodel_3133.xlsx
│                   ├── overview_of_validation_rules_for_the_benelux-31334.xlsx
│                   └── supporting
├── db
│   └── sql
│       └── check_esrs_count.sql
├── docs
│   ├── AGENT_COLLABORATION_SUMMARY.md
│   ├── ALERTING_SYSTEM_DESIGN.md
│   ├── Autonomous_Development_Plan.md
│   ├── CELLAR_INGESTION_DEPLOYMENT.md
│   ├── CHANGELOG.md
│   ├── CHANGELOG_FOR_CHATGPT.md
│   ├── CHATGPT_INTEGRATION_CONTRACT.md
│   ├── CHATGPT_INTEGRATION_WORKFLOW.md
│   ├── CI_TESTING.md
│   ├── CLAUDE_CODE_CONTEXT.md
│   ├── CLAUDE_CODE_ONBOARDING.md
│   ├── CLEANUP_REPORT.md
│   ├── COORDINATION_WORKFLOW.md
│   ├── CRON_QUICK_START.md
│   ├── DATASETS_CATALOG.json
│   ├── DATASET_CANDIDATES_DETAILED.md
│   ├── DATASET_PRIORITY_ANALYSIS.md
│   ├── DECISION_BRIEF_ESRS_SCHEMA_MISMATCH.md
│   ├── DECISION_CONTEXT_ANALYSIS.md
│   ├── DEMO_NARRATIVES.md
│   ├── DEPLOYMENT_GUIDE.md
│   ├── Data_Quality_Updates_Plan.md
│   ├── Dutch_Initiatives_Data_Model.md
│   ├── EMBEDDING_OPTIMIZATION_ANALYSIS.md
│   ├── EMBEDDING_PIPELINE_OPTIMIZATION.md
│   ├── EMBEDDING_WORKFLOW_OPTIMIZATION_REPORT.md
│   ├── ESG_INTEGRATION_FINAL_REPORT.md
│   ├── GITHUB_PROVISIONING_REPORT.md
│   ├── GITHUB_PUSH_WORKFLOW.md
│   ├── GS1_ARTEFACTS_ALIGNMENT_VALIDATION.md
│   ├── GS1_BRAND_RESEARCH_NOTES.md
│   ├── GS1_EU_PCF_EXTRACTION_NOTES.md
│   ├── GS1_EU_PCF_INTEGRATION_SUMMARY.md
│   ├── INDEX.md
│   ├── INGESTION_DELEGATION_SUMMARY.md
│   ├── INGESTION_GUIDE.md
│   ├── ISA_AGENT_COLLABORATION.md
│   ├── ISA_BRAND_POSITIONING.md
│   ├── ISA_COMPARATIVE_REFACTOR_GATE_PLAN.md
│   ├── ISA_ESG_GS1_CANONICAL_MODEL.md
│   ├── ISA_GS1_PRE_EXECUTION_PREPARATION.md
│   ├── ISA_IMPLEMENTATION_EXECUTION_PLAN.md
│   ├── ISA_NEVER_AGAIN_ARCHITECTURAL_CONTRACT.md
│   ├── ISA_PRODUCT_DIMENSIONS_ANALYSIS.md
│   ├── ISA_STRATEGIC_CONTEXT_SYNTHESIS.md
│   ├── ISA_STRATEGIC_DISCOVERY_REPORT.md
│   ├── ISA_STRATEGIC_EVALUATION_QUALITY_MAPPING.md
│   ├── ISA_STRATEGIC_PIVOT_REPORT.md
│   ├── ISA_Strategic_Insights_from_Reports.md
│   ├── ISA_V1_LOCK_CHECKSUMS.txt
│   ├── ISA_VISUAL_BRANDING_DEVELOPMENT_PLAN.md
│   ├── ISA_WORKFLOW_IMPROVEMENTS.md
│   ├── MANUS_BEST_PRACTICES_EXECUTIVE_SUMMARY.md
│   ├── MANUS_BEST_PRACTICES_FOR_ISA.md
│   ├── MANUS_OPTIMIZATION_IMPLEMENTATION_SUMMARY.md
│   ├── META_PHASE_COMPLETION_REPORT.md
│   ├── OPERATIONS_RUNBOOK.md
│   ├── PHASE4_OPERATIONAL_READINESS_REPORT.md
│   ├── PHASE_2_ADDENDUM.md
│   ├── PHASE_2_DESIGN_EVALUATION.md
│   ├── PHASE_2_DESIGN_PROPOSAL.md
│   ├── PHASE_8_1_VERIFICATION.md
│   ├── PIPELINE_OBSERVABILITY_SPEC.md
│   ├── PIPELINE_VALIDATION_REPORT.md
│   ├── PRIORITY_1_SCHEMA_DEBT.md
│   ├── PRIORITY_2_BLOCKED.md
│   ├── PRIORITY_3_COMPLETION_REPORT.md
│   ├── PRODUCTION_DEPLOYMENT.md
│   ├── PRODUCTION_IMPROVEMENTS_JAN_2026.md
│   ├── PRODUCTION_READINESS.md
│   ├── README.md
│   ├── REPO_MAP.md
│   ├── REPO_MAP_FINAL.md
│   ├── SERVERLOGGER_INTEGRATION.md
│   ├── STYLE_ALIGNMENT_RECOMMENDATIONS.md
│   ├── TEST_FAILURE_TRIAGE.md
│   ├── _AUDIT_FINDINGS.md
│   ├── agent
│   │   ├── AGENT_MAP.md
│   │   ├── MCP_POLICY.md
│   │   ├── MCP_RECIPES.md
│   │   └── OPENCLAW_UI_DEV_PROMPT_STARTER.md
│   ├── architecture
│   │   └── panel
│   │       ├── ATAM_RISKS_SENSITIVITIES_TRADEOFFS.md
│   │       ├── ATAM_SCENARIOS.md
│   │       ├── ATAM_UTILITY_TREE.md
│   │       ├── BASELINE_REVIEW_REPORT.md
│   │       ├── GOVERNANCE_CONSOLIDATION_LOG.md
│   │       ├── ISO25010_MAPPING.md
│   │       ├── KICKOFF_PACKAGE.md
│   │       ├── README.md
│   │       ├── REPO_TIGHT_V5_COMPLETION.md
│   │       └── _generated
│   │           ├── ARCHITECTURE_SCORECARD.json
│   │           ├── CAPABILITY_GRAPH.json
│   │           ├── CAPABILITY_MANIFEST.json
│   │           ├── EVIDENCE_INDEX.json
│   │           ├── INBOUND_LINKS.json
│   │           ├── MINIMAL_VALIDATION_BUNDLE.json
│   │           ├── PRIMITIVE_DICTIONARY.json
│   │           └── REF_INDEX.json
│   ├── autonomous-session-2025-12-17-critical-events.md
│   ├── ci
│   │   └── INDEX.md
│   ├── datasets-catalog.schema.json
│   ├── decisions
│   │   ├── CONFLICTS_PLAN_DECISIONS_2026-02-10.md
│   │   └── DECISION_LOG.md
│   ├── eurlex_research.md
│   ├── evidence
│   │   └── EXEC_GRAPH.mmd
│   ├── governance
│   │   ├── CREDENTIALS_VERIFICATION.md
│   │   ├── CRITICAL_FILES_CANDIDATES.md
│   │   ├── DOC_AUTHORITY_MAP.md
│   │   ├── ENTRYPOINTS.md
│   │   ├── EVIDENCE_INDEX.md
│   │   ├── EVIDENCE_LEDGER.md
│   │   ├── GITHUB_WORKFLOW.md
│   │   ├── INDEX.md
│   │   ├── IRON_PROTOCOL.md
│   │   ├── ISA_ACCEPTANCE_CRITERIA_v1.md
│   │   ├── ISA_DEVELOPMENT_PLAYBOOK.md
│   │   ├── ISA_MANUS_PROJECT_GOVERNANCE.md
│   │   ├── ISA_ULTIMATE_VISION.md
│   │   ├── KNOWN_FAILURE_MODES.md
│   │   ├── LARGE_ASSETS.md
│   │   ├── LIVING_DOCUMENTATION_POLICY.md
│   │   ├── LLM_STRUCTURAL_RISK_ASSESSMENT.md
│   │   ├── MANUAL_PREFLIGHT.md
│   │   ├── NO_GATES_WINDOW.md
│   │   ├── OPENCLAW_POLICY_ENVELOPE.md
│   │   ├── OPEN_QUESTIONS.md
│   │   ├── PLANNING_POLICY.md
│   │   ├── PLANNING_TRACEABILITY_CANON.md
│   │   ├── PROGRAM_PLAN.md
│   │   ├── SCOPE_DECISIONS.md
│   │   ├── SECRET_RISK_FINDINGS.md
│   │   ├── TEMPORAL_GUARDRAILS.md
│   │   ├── WORK_PRIORITIZATION.md
│   │   ├── _root
│   │   │   └── ISA_GOVERNANCE.md
│   │   ├── agent-prompt-governance.md
│   │   ├── credentials_presence.md
│   │   ├── governance-iron-protocol.md
│   │   └── planning_artifacts
│   │       ├── CAPABILITY_DOCUMENTATION_REFACTOR_PLAN.md
│   │       ├── CAPABILITY_REFACTOR_SUMMARY.md
│   │       ├── ENV_KEY_REGISTRY.json
│   │       ├── PHASE_1_PROGRESS_REPORT.md
│   │       ├── PHASE_2_PROGRESS_SUMMARY.md
│   │       ├── PRE_ARCHITECTURE_REVIEW_PLAN.md
│   │       └── WORK_COMPLETED_SUMMARY.md
│   ├── gsmp_manual.pdf
│   ├── gsmp_manual.txt
│   ├── isa_research_findings.md
│   ├── misc
│   │   └── _root
│   │       └── README.md
│   ├── ops
│   │   └── spellcheck
│   │       ├── cspell-gs1-terms.txt
│   │       └── cspell-isa-terms.txt
│   ├── planning
│   │   ├── BACKLOG.csv
│   │   ├── INDEX.md
│   │   ├── NEXT_ACTIONS.json
│   │   └── refactoring
│   │       ├── CANONICAL_CONTENT_MAP.md
│   │       ├── CAPABILITY_CONFLICTS.md
│   │       ├── CAPABILITY_DOCS_INVENTORY.json
│   │       ├── COMPLETION_SUMMARY.md
│   │       ├── CONTRACT_COMPLETENESS.json
│   │       ├── EVIDENCE_MARKERS.json
│   │       ├── EXECUTION_STATE.json
│   │       ├── EXECUTION_SUMMARY.md
│   │       ├── FILE_INVENTORY.json
│   │       ├── FINAL_STATUS_REPORT.md
│   │       ├── MASTER_REFACTORING_PLAN.md
│   │       ├── MASTER_REFACTORING_PLAN_V2_ENHANCED.md
│   │       ├── MASTER_REFACTORING_PLAN_V3_ENHANCED.md
│   │       ├── MOVE_EXECUTION_LOG.json
│   │       ├── MOVE_PLAN.json
│   │       ├── PHASE_0_REPORT.md
│   │       ├── PHASE_0_SUMMARY.json
│   │       ├── PHASE_1_REPORT.md
│   │       ├── PHASE_1_SUMMARY.json
│   │       ├── PHASE_2_COMPLETION_SUMMARY.md
│   │       ├── PHASE_2_PLANNING_REPORT.md
│   │       ├── PHASE_3_PROGRESS.md
│   │       ├── PHASE_3_SUMMARY.md
│   │       ├── PHASE_4_SUMMARY.json
│   │       ├── QUALITY_SCORECARDS.json
│   │       ├── REFACTORING_COMPLETE.json
│   │       ├── REFACTORING_STATUS.md
│   │       ├── SEMANTIC_VALIDATION.json
│   │       ├── SESSION_2026-02-12_SUMMARY.md
│   │       └── V3_COMPLETION_SUMMARY.md
│   ├── quality
│   │   ├── schemas
│   │   │   ├── architecture-scorecard.schema.json
│   │   │   ├── catalogue.schema.json
│   │   │   ├── error-budget-status.schema.json
│   │   │   ├── governance.schema.json
│   │   │   ├── isa-capability-eval.schema.json
│   │   │   ├── isa-drift-report.schema.json
│   │   │   ├── observability.schema.json
│   │   │   ├── oss-benchmarks-2026-02-15.schema.json
│   │   │   ├── perf.schema.json
│   │   │   ├── rag-eval.schema.json
│   │   │   ├── reliability.schema.json
│   │   │   ├── security-gate.schema.json
│   │   │   ├── slo-policy-check.schema.json
│   │   │   └── test-summary.schema.json
│   │   └── thresholds
│   │       └── isa-capability-thresholds.json
│   ├── reference
│   │   ├── ISA_DEVELOPMENT_RUBRIC.md
│   │   └── REPO_ASSESSMENT_HOWTO.md
│   ├── releases
│   │   └── ARTIFACT_VERSIONING.md
│   ├── research
│   │   ├── isa-deep-research
│   │   │   └── 2026-02-15
│   │   │       ├── ANTI_PATTERNS.md
│   │   │       ├── ARCHITECTURE_BENCHMARK.md
│   │   │       ├── CANDIDATES.md
│   │   │       ├── DOCS_AND_STRUCTURE_GOLD.md
│   │   │       ├── FINDINGS.md
│   │   │       ├── ISA_ACTION_PLAN.md
│   │   │       ├── ISA_BASELINE.md
│   │   │       ├── PLAN.md
│   │   │       ├── benchmarks.json
│   │   │       └── raw
│   │   │           ├── candidate_pool.json
│   │   │           ├── github_discovery_queries.json
│   │   │           ├── sentiment_sources.json
│   │   │           ├── top12_repo_metadata.json
│   │   │           └── top5_forensic_paths.json
│   │   └── oss-benchmarks
│   │       └── 2026-02-15
│   │           ├── ANTI_PATTERNS.md
│   │           ├── CANDIDATES.md
│   │           ├── FINDINGS.md
│   │           ├── ISA_ACTION_PLAN.md
│   │           ├── ISA_BASELINE.md
│   │           ├── PLAN.md
│   │           ├── benchmarks.json
│   │           └── raw
│   │               ├── github_search_candidates.json
│   │               ├── top12_repo_metadata.json
│   │               └── top5_forensic_paths.json
│   ├── research_findings_poc_pivot.md
│   ├── spec
│   │   ├── ADVISORY
│   │   │   ├── ADVISORY_DIFF_METRICS.md
│   │   │   ├── ADVISORY_METHOD.md
│   │   │   ├── ADVISORY_OUTPUTS.md
│   │   │   ├── ADVISORY_UI_NOTES.md
│   │   │   ├── ALIGNMENT_CHECK_2026_01_03.md
│   │   │   ├── API_REFERENCE.md
│   │   │   ├── ARCHITECTURE.md
│   │   │   ├── CHANGELOG_SUMMARY.md
│   │   │   ├── CHATGPT_WORK_PARCEL_SUMMARY.md
│   │   │   ├── COMPLETION_SUMMARY.md
│   │   │   ├── DAY1_COMPLETION_REPORT.md
│   │   │   ├── FEATURE_DISCOVERY_REPORT.md
│   │   │   ├── FILE_SYSTEM_MEMORY_ARCHITECTURE.md
│   │   │   ├── GS1_STYLE_COMPLIANCE_FINAL_REPORT.md
│   │   │   ├── GS1_STYLE_GUIDE_INGESTION_SUMMARY.md
│   │   │   ├── GS1_STYLE_QUICK_REFERENCE.md
│   │   │   ├── INDEX.md
│   │   │   ├── ISA_CORE_CONTRACT.md
│   │   │   ├── ISA_DELIVERY_MODEL.md
│   │   │   ├── ISA_FUTURE_DEVELOPMENT_PLAN.md
│   │   │   ├── ISA_First_Advisory_Report_GS1NL.md
│   │   │   ├── ISA_First_Advisory_Report_GS1NL_v1.1_UPDATE.md
│   │   │   ├── ISA_PRODUCT_VISION.md
│   │   │   ├── ISA_REFERENCE_DOSSIER.md
│   │   │   ├── ISA_UX_STRATEGY.md
│   │   │   ├── ISA_V1_CONSISTENCY_FIXES.md
│   │   │   ├── ISA_V1_FINAL_DELIVERY.md
│   │   │   ├── ISA_V1_FORMALIZATION_COMPLETE.md
│   │   │   ├── ISA_V1_FORMALIZATION_TARGETS.md
│   │   │   ├── ISA_V1_HARDENING_COMPLETE.md
│   │   │   ├── ISA_V1_LOCK_RECORD.md
│   │   │   ├── MANUS_DAY1_EXECUTION_CHECKLIST.md
│   │   │   ├── MANUS_EXECUTION_BRIEF.md
│   │   │   ├── PHASE_AB_UX_SUMMARY.md
│   │   │   ├── QUALITY_BAR.md
│   │   │   ├── REGULATORY_CHANGE_LOG_ENTRY_GUIDE.md
│   │   │   ├── REGULATORY_CHANGE_LOG_TEMPLATES.md
│   │   │   ├── REGULATORY_LANDSCAPE_SUMMARIES.md
│   │   │   ├── RUNTIME_CONTRACT.md
│   │   │   ├── STRATEGIC_PIVOT_POC.md
│   │   │   ├── STYLE_GUIDE_ADOPTION.md
│   │   │   ├── UX_PHASE_A_SUMMARY.md
│   │   │   ├── _CONSOLIDATION_VALIDATION.md
│   │   │   ├── efrag_xbrl_research.md
│   │   │   └── repo-change-control-release.md
│   │   ├── ADVISORY.md
│   │   ├── ARCHITECTURE.md
│   │   ├── ASK_ISA
│   │   │   ├── AGENT_MAP.md
│   │   │   ├── API_REFERENCE.md
│   │   │   ├── ASK_ISA_GUARDRAILS.md
│   │   │   ├── ASK_ISA_QUERY_LIBRARY.md
│   │   │   ├── ASK_ISA_QUERY_LIBRARY_v1.md
│   │   │   ├── ASK_ISA_RUNTIME_CONTRACT.md
│   │   │   ├── ASK_ISA_SMOKE_RUNBOOK.md
│   │   │   ├── ASK_ISA_TEST_RESULTS.md
│   │   │   ├── CAPABILITY_SPEC.md
│   │   │   ├── CHATGPT_WORK_PARCEL_02_ASK_ISA_EXPANSION.md
│   │   │   ├── DEPLOYMENT.md
│   │   │   ├── DEVELOPMENT_PROGRESS_2026-02-01.md
│   │   │   ├── DEVELOPMENT_SESSION_2026-02-01.md
│   │   │   ├── EMBEDDING_QUALITY_IMPROVEMENT_REPORT.md
│   │   │   ├── ENHANCED_EMBEDDING_SCHEMA.md
│   │   │   ├── IMPLEMENTATION_GUIDE.md
│   │   │   ├── ISA_DATA_NEEDS_AND_PRIORITIES.md
│   │   │   ├── ISA_DEVELOPMENT_STATUS.md
│   │   │   ├── META_PHASE_STRATEGIC_EXPLORATION_PLAN.md
│   │   │   ├── RUNTIME_CONTRACT.md
│   │   │   ├── STRATEGIC_EVALUATION_2026-02-01.md
│   │   │   ├── TESTING_GUIDE.md
│   │   │   ├── TROUBLESHOOTING.md
│   │   │   └── TRUST_RISK_ANALYSIS.md
│   │   ├── ASK_ISA.md
│   │   ├── CATALOG
│   │   │   ├── CATALOGUE_ENTRYPOINTS_STATUS.md
│   │   │   ├── DATASETS_CATALOG.md
│   │   │   ├── GS1_DOCUMENTS_DATASETS_ANALYSIS.md
│   │   │   ├── GS1_EFRAG_CATALOGUE_INDEX.md
│   │   │   ├── ISA_INFORMATION_ARCHITECTURE.md
│   │   │   ├── ISA_MASTER_SPEC.md
│   │   │   ├── ISA_STATUS_SUMMARY_2025-12-19.md
│   │   │   ├── MULTI_REGULATION_COMPARISON_SUMMARY.md
│   │   │   ├── RUNTIME_CONTRACT.md
│   │   │   ├── catalogue-source-registry.md
│   │   │   └── index.md
│   │   ├── CATALOG.md
│   │   ├── CONFLICT_REGISTER.md
│   │   ├── DECISION_LOG_PHASE3.md
│   │   ├── DEPLOYMENT_GUIDE.md
│   │   ├── DEPRECATION_MAP.md
│   │   ├── EPCIS_CBV_INTEGRATION_SUMMARY.md
│   │   ├── ESRS_MAPPING
│   │   │   ├── ALTERNATIVE_FUTURES_EXPLORATION.md
│   │   │   ├── CGPT-01_INTEGRATION_REPORT.md
│   │   │   ├── CHATGPT_COLLABORATION_ANALYSIS.md
│   │   │   ├── DATA_MODEL.md
│   │   │   ├── ESG_Hub_MVP_Polish_Plan.md
│   │   │   ├── GS1_DATA_MODELS.md
│   │   │   ├── GS1_EU_PCF_TO_ESRS_E1_MAPPINGS.md
│   │   │   ├── INGESTION.md
│   │   │   ├── INGESTION_SUMMARY_REPORT.md
│   │   │   ├── ISA_NEXT_PHASE_DEVELOPMENT_PLAN.md
│   │   │   ├── KNOWN_FAILURE_MODES.md
│   │   │   ├── PRIORITY_1_COMPLETION_REPORT.md
│   │   │   ├── RUNTIME_CONTRACT.md
│   │   │   ├── STATUS.md
│   │   │   ├── WIDE_RESEARCH_USAGE.md
│   │   │   ├── isa-core-architecture.md
│   │   │   └── test-failure-analysis-2025-12-17.md
│   │   ├── ESRS_MAPPING.md
│   │   ├── EURLEX_SCRAPER_FIX.md
│   │   ├── EXTERNAL_REFERENCES.md
│   │   ├── GS1_ARTEFACT_PROCESSING.md
│   │   ├── INGESTION_DELIVERABLES_INDEX.md
│   │   ├── INTEGRATION_CONTRACTS.md
│   │   ├── ISA_CAPABILITY_MAP.md
│   │   ├── KNOWLEDGE_BASE
│   │   │   ├── GS1_Attribute_Mapper_Technical_Specification.md
│   │   │   ├── IRON_KNOWLEDGE_MAP.md
│   │   │   ├── ISA_DOCUMENTATION_MAP.md
│   │   │   ├── RUNTIME_CONTRACT.md
│   │   │   └── data-knowledge-model.md
│   │   ├── KNOWLEDGE_BASE.md
│   │   ├── NEWS_HUB
│   │   │   ├── API_REFERENCE.md
│   │   │   ├── BASELINE_V2_DECISION_GRADE.md
│   │   │   ├── CAPABILITY_SPEC.md
│   │   │   ├── CHROMIUM_INSTALLATION_GUIDE.md
│   │   │   ├── CODEX_DELEGATION_SPEC.md
│   │   │   ├── CRITICAL_EVENTS_TAXONOMY.md
│   │   │   ├── CRON_DEPLOYMENT.md
│   │   │   ├── CRON_SETUP_GUIDE.md
│   │   │   ├── FINAL_ISA_GRADE_RESCORE.md
│   │   │   ├── FINAL_RESCORE_POST_PIPELINE.md
│   │   │   ├── INSTRUCTION_EVALUATION_ANALYSIS.md
│   │   │   ├── ISA_NEWSHUB_AUDIT_UPDATED.md
│   │   │   ├── ISA_NEWSHUB_EVOLUTION_SUMMARY.md
│   │   │   ├── ISA_NEWSHUB_TARGET_DESIGN.md
│   │   │   ├── ISA_NEWS_HUB_SELF_CHECK_ASSESSMENT.md
│   │   │   ├── ISA_NEWS_OVERVIEW.md
│   │   │   ├── NEWS_HEALTH_MONITORING.md
│   │   │   ├── NEWS_HUB_MATURITY_ANALYSIS.md
│   │   │   ├── NEWS_PIPELINE.md
│   │   │   ├── PHASE_1_RESCORE.md
│   │   │   ├── PHASE_2_RESCORE.md
│   │   │   ├── PHASE_3_COMPLETION_REPORT.md
│   │   │   ├── PHASE_3_STARTDOCUMENT.md
│   │   │   ├── PHASE_8.3_INGESTION_WINDOW_COMPLETE.md
│   │   │   ├── PHASE_8_COMPLETE_SUMMARY.md
│   │   │   ├── PHASE_8_NEWS_HUB_OBSERVABILITY_COMPLETE.md
│   │   │   ├── RESEARCH_FINDINGS_NEWS_SOURCES.md
│   │   │   ├── RUNTIME_CONTRACT.md
│   │   │   ├── autonomous-session-2025-12-17.md
│   │   │   └── research-dutch-sources.md
│   │   ├── NEWS_HUB.md
│   │   ├── PRODUCTION_READINESS.md
│   │   ├── QUICK_START_INGESTION.md
│   │   ├── README.md
│   │   ├── RUN_CONFIG.json
│   │   ├── TRACEABILITY_MATRIX.csv
│   │   ├── TYPESCRIPT_FIX_SUMMARY.md
│   │   ├── TYPESCRIPT_NOTES.md
│   │   ├── WEBHOOK_INTEGRATION.md
│   │   ├── contracts
│   │   │   └── ASK_ISA_RUNTIME_CONTRACT.md
│   │   ├── ingestion-update-lifecycle.md
│   │   ├── observability-tracing-feedback.md
│   │   ├── ops
│   │   │   └── HEALTH_MONITORING_ENHANCEMENTS.md
│   │   ├── retrieval-embeddings-grounding.md
│   │   └── ux-user-journey.md
│   ├── sre
│   │   ├── ERROR_BUDGET_POLICY.md
│   │   ├── OTEL.md
│   │   ├── SLO_CATALOG.md
│   │   └── _generated
│   │       └── error_budget_status.json
│   ├── test-failure-resolution-2025-12-17.md
│   └── typescript-cleanup-2026-01-02.md
├── drizzle
│   ├── 0000_reflective_justin_hammer.sql
│   ├── 0001_overrated_zarda.sql
│   ├── 0002_cloudy_starhawk.sql
│   ├── 0003_tiny_garia.sql
│   ├── 0004_optimal_whistler.sql
│   ├── 0005_aspiring_sphinx.sql
│   ├── 0006_glorious_terrax.sql
│   ├── 0007_fair_fenris.sql
│   ├── 0008_long_tarantula.sql
│   ├── 0009_moaning_human_torch.sql
│   ├── 0010_light_wolfpack.sql
│   ├── 0011_slippery_baron_zemo.sql
│   ├── 0012_chunky_kulan_gath.sql
│   ├── 0013_stale_morg.sql
│   ├── 0014_corpus_governance.sql
│   ├── 0014_daffy_lake.sql
│   ├── meta
│   │   ├── 0003_snapshot.json
│   │   ├── 0004_snapshot.json
│   │   ├── 0005_snapshot.json
│   │   ├── 0006_snapshot.json
│   │   ├── 0007_snapshot.json
│   │   ├── 0008_snapshot.json
│   │   ├── 0009_snapshot.json
│   │   ├── 0010_snapshot.json
│   │   ├── 0011_snapshot.json
│   │   ├── 0012_snapshot.json
│   │   ├── 0013_snapshot.json
│   │   ├── 0014_snapshot.json
│   │   └── _journal.json
│   ├── meta_backup_20251219_172648
│   │   ├── 0000_snapshot.json
│   │   ├── 0001_snapshot.json
│   │   ├── 0002_snapshot.json
│   │   └── _journal.json
│   ├── migrations
│   │   ├── .gitkeep
│   │   ├── 0015_ultimate_dataset_registry.sql
│   │   ├── 0016_add_regulatory_tracking_columns.sql
│   │   ├── 0017_add_ingest_item_provenance.sql
│   │   ├── 0018_add_asr_authority_fields 2.sql
│   │   ├── 0018_add_asr_authority_fields.sql
│   │   ├── 0019_add_canonical_facts_store 2.sql
│   │   ├── 0019_add_canonical_facts_store.sql
│   │   ├── 0020_openclaw_automation_controls.sql
│   │   ├── _root
│   │   │   └── manual_ingest_02_04_05_06.sql
│   │   ├── _server
│   │   │   └── 0001_add_error_ledger.sql
│   │   └── add_enhanced_embedding_metadata.sql
│   ├── relations.ts
│   ├── schema-extensions.sql
│   ├── schema.ts
│   ├── schema_advisory_reports.ts
│   ├── schema_ask_isa_feedback.ts
│   ├── schema_corpus_governance.ts
│   ├── schema_cron_monitoring.ts
│   ├── schema_dataset_registry.ts
│   ├── schema_esg_extensions.ts
│   ├── schema_governance_documents.ts
│   ├── schema_gs1_esrs_mappings.ts
│   ├── schema_gs1_eu_pcf.ts
│   ├── schema_news_history.ts
│   ├── schema_news_hub.ts
│   ├── schema_news_recommendations.ts
│   ├── schema_pipeline_observability.ts
│   ├── schema_regulatory_change_log.ts
│   └── schema_scraper_health.ts
├── drizzle.config.ts
├── isa-archive
│   ├── docs
│   │   ├── _benchmarks
│   │   │   ├── ISA_EXTERNAL_BENCHMARK_NOTES_v1.md
│   │   │   └── ISA_EXTERNAL_BENCHMARK_NOTES_v2.md
│   │   ├── _research
│   │   │   ├── ISA_CURRENT_ARCHITECTURE_BRIEF_v0.md
│   │   │   ├── ISA_RESEARCH_PLAN_v1.md
│   │   │   └── ISA_RESEARCH_PLAN_v2.md
│   │   ├── agent-prompts
│   │   │   ├── AUTONOMOUS_DEVELOPMENT_SUMMARY.md
│   │   │   ├── CHATGPT_PROMPT_BATCH_INGEST_02_04_05_06.md
│   │   │   ├── CHATGPT_PROMPT_INGEST-03.md
│   │   │   ├── CHATGPT_UPDATE_PROMPT.md
│   │   │   ├── DELEGATION_PACKAGE_INGEST-03.md
│   │   │   └── ORCHESTRATION_PROMPT.md
│   │   ├── agent_collaboration
│   │   │   └── MANUS_CHATGPT_PROTOCOL.md
│   │   ├── archive
│   │   │   ├── planning
│   │   │   │   └── PHASE_1.md
│   │   │   └── root_docs
│   │   │       ├── _inventory_db_migrations_20260207_212557.json
│   │   │       ├── _move_manifest_db_migrations_20260207_212557.json
│   │   │       ├── _move_manifest_evidence_generated_20260207_215427.json
│   │   │       ├── _move_manifest_ops_config_cleanup_20260207_213615.json
│   │   │       ├── _move_manifest_root_scripts_20260207_212036.json
│   │   │       ├── _move_map_db_migrations_20260207_212557.json
│   │   │       ├── _move_map_evidence_generated_20260207_215427.json
│   │   │       ├── _move_map_ops_config_cleanup_20260207_213615.json
│   │   │       └── _move_map_root_scripts_20260207_212036.json
│   │   ├── data
│   │   │   └── EXTERNAL_ARTEFACTS.md
│   │   ├── datasets
│   │   │   ├── EXTERNAL_GS1_AND_ESG_REPOS_ARCHIVE2.md
│   │   │   └── HOW_TO_QUERY_ARCHIVE2_INDEX.md
│   │   ├── gs1_research
│   │   │   ├── README.md
│   │   │   ├── README.pdf
│   │   │   ├── STRATEGIC_FOCUS_SELECTION.md
│   │   │   ├── decision_support_feasibility.md
│   │   │   ├── executive_summary.md
│   │   │   ├── executive_summary.pdf
│   │   │   ├── feasibility_assessment.md
│   │   │   ├── feasibility_findings.md
│   │   │   ├── gs1_process_synthesis.md
│   │   │   ├── gs1_process_synthesis.pdf
│   │   │   ├── gsmp_manual_notes.md
│   │   │   ├── hardest_questions_decision_tensions.md
│   │   │   ├── hardest_questions_decision_tensions.pdf
│   │   │   ├── isa_relevance_mapping.md
│   │   │   ├── isa_relevance_mapping.pdf
│   │   │   └── research_gs1_standards_development.md
│   │   ├── legacy
│   │   │   ├── CHATGPT_DOCS_SHA256SUMS.txt
│   │   │   ├── CHATGPT_PROMPT_WORK_PARCEL_02.txt
│   │   │   └── STABILIZATION_REPORT_2026-01-04.md
│   │   ├── references
│   │   │   └── gs1
│   │   │       ├── GS1_STYLE_GUIDE_EXTRACT.md
│   │   │       └── ISA_TOP_20_STYLE_RULES.md
│   │   ├── reviews
│   │   │   ├── dual-core-poc-evaluation.md
│   │   │   ├── task1_review.md
│   │   │   └── task3_review.md
│   │   ├── screenshots
│   │   │   └── news-hub-enhanced-filters.md
│   │   └── templates
│   │       ├── ADVISORY_REPORT_TEMPLATE.md
│   │       ├── GAP_ANALYSIS_TEMPLATE.md
│   │       └── RECOMMENDATION_TEMPLATE.md
│   ├── governance
│   │   ├── ACCELERATED_COMPLETION_PLAN.md
│   │   ├── AUDIT_EXECUTION_MODE.md
│   │   ├── CENSUS_DIFF.md
│   │   ├── CLUSTER_REGISTRY.json
│   │   ├── CLUSTER_REGISTRY.md
│   │   ├── COMPLETE_REFACTORING_PLAN.md
│   │   ├── COMPLETION_DELIVERY_PLAN.md
│   │   ├── DATE_CORRECTION_ACTIONS.md
│   │   ├── DATE_INTEGRITY_AUDIT.md
│   │   ├── DAY_0_AUDIT_RESULTS.md
│   │   ├── DAY_0_EXECUTION.md
│   │   ├── DAY_1_EXECUTION_SUMMARY.md
│   │   ├── DAY_1_PLAN.md
│   │   ├── DAY_1_PROGRESS.md
│   │   ├── GATING_QUESTIONS_EVIDENCE_INVENTORY.md
│   │   ├── GOVERNANCE.md
│   │   ├── GOVERNANCE_FINAL_SUMMARY.md
│   │   ├── GOVERNANCE_PHASE_2_3_REPORT.md
│   │   ├── GOVERNANCE_SELF_CHECK_2025-12-17.md
│   │   ├── IRON_VALIDATION_PLAN.md
│   │   ├── ISA_EVIDENCE_PACK_v0.md
│   │   ├── ISA_EXECUTION_MAP.md
│   │   ├── ISA_IRON_DOCSET_AND_CRITICAL_PATH_DECISION_DRAFT_v0.md
│   │   ├── ISA_JOURNEY_TRACES_v0.md
│   │   ├── ISA_JOURNEY_TRACES_v1.md
│   │   ├── ISA_SOURCES_REGISTRY_v0.md
│   │   ├── PHASE4_CLOSEOUT_REPORT.md
│   │   ├── PHASE4_READINESS_REPORT.md
│   │   ├── REFACTORING_EXECUTION_SUMMARY.md
│   │   ├── REFACTORING_PLAN.md
│   │   ├── REPOSITORY_INVESTIGATION_STATUS.md
│   │   ├── SCHEMA_MISMATCH_ANALYSIS.md
│   │   ├── SELF_CHECK_EVIDENCE.md
│   │   ├── SUBDIR_SUMMARY.md
│   │   ├── VALIDATION_SUMMARY.md
│   │   ├── evaluation-governance-reproducibility.md
│   │   └── forge_vars_where_used.md
│   └── server
│       ├── ask-isa-enhanced.ts
│       ├── automated-cellar-sync.ts
│       ├── cellar-connector.test.ts
│       ├── cellar-connector.ts
│       ├── cellar-diagnostic.test.ts
│       ├── cellar-ingestion-integration.test.ts
│       ├── cellar-ingestion-router.ts
│       ├── cellar-normalizer.test.ts
│       ├── cellar-normalizer.ts
│       ├── epcis-integration.test.ts
│       ├── epcis-router.ts
│       ├── epcis-ui.test.ts
│       ├── epcis-xml-parser.ts
│       ├── eudr-analyzer.ts
│       ├── generate-all-embeddings-optimized.ts
│       ├── generate-all-embeddings-v2.ts
│       ├── generate-all-embeddings.ts
│       ├── news-sources-phase3.ts
│       ├── routers
│       │   ├── batch-epcis.ts
│       │   ├── benchmarking.ts
│       │   ├── collaboration.ts
│       │   ├── impact-simulator.ts
│       │   ├── remediation.ts
│       │   ├── stakeholder-dashboard.ts
│       │   └── template-analytics.ts
│       └── services
│           └── ab-testing
│               └── index.ts
├── isa_map.json
├── openclaw_audit
│   ├── cli
│   │   └── CLI_COMMANDS.md
│   ├── config
│   │   └── CONFIG_REFERENCE.md
│   ├── docs
│   │   ├── DOCS_INDEX.json
│   │   └── pages
│   │       ├── 0001__automation__auth-monitoring.json
│   │       ├── 0002__automation__cron-jobs.json
│   │       ├── 0003__automation__cron-vs-heartbeat.json
│   │       ├── 0004__automation__gmail-pubsub.json
│   │       ├── 0005__automation__hooks.json
│   │       ├── 0006__automation__poll.json
│   │       ├── 0007__automation__troubleshooting.json
│   │       ├── 0008__automation__webhook.json
│   │       ├── 0009__channels__bluebubbles.json
│   │       ├── 0010__channels__broadcast-groups.json
│   │       ├── 0011__channels__channel-routing.json
│   │       ├── 0012__channels__discord.json
│   │       ├── 0013__channels__feishu.json
│   │       ├── 0014__channels__googlechat.json
│   │       ├── 0015__channels__grammy.json
│   │       ├── 0016__channels__group-messages.json
│   │       ├── 0017__channels__groups.json
│   │       ├── 0018__channels__imessage.json
│   │       ├── 0019__channels.json
│   │       ├── 0020__channels__irc.json
│   │       ├── 0021__channels__line.json
│   │       ├── 0022__channels__location.json
│   │       ├── 0023__channels__matrix.json
│   │       ├── 0024__channels__mattermost.json
│   │       ├── 0025__channels__msteams.json
│   │       ├── 0026__channels__nextcloud-talk.json
│   │       ├── 0027__channels__nostr.json
│   │       ├── 0028__channels__pairing.json
│   │       ├── 0029__channels__signal.json
│   │       ├── 0030__channels__slack.json
│   │       ├── 0031__channels__synology-chat.json
│   │       ├── 0032__channels__telegram.json
│   │       ├── 0033__channels__tlon.json
│   │       ├── 0034__channels__troubleshooting.json
│   │       ├── 0035__channels__twitch.json
│   │       ├── 0036__channels__whatsapp.json
│   │       ├── 0037__channels__zalo.json
│   │       ├── 0038__channels__zalouser.json
│   │       ├── 0039__ci.json
│   │       ├── 0040__cli__acp.json
│   │       ├── 0041__cli__agent.json
│   │       ├── 0042__cli__agents.json
│   │       ├── 0043__cli__approvals.json
│   │       ├── 0044__cli__browser.json
│   │       ├── 0045__cli__channels.json
│   │       ├── 0046__cli__clawbot.json
│   │       ├── 0047__cli__completion.json
│   │       ├── 0048__cli__config.json
│   │       ├── 0049__cli__configure.json
│   │       ├── 0050__cli__cron.json
│   │       ├── 0051__cli__daemon.json
│   │       ├── 0052__cli__dashboard.json
│   │       ├── 0053__cli__devices.json
│   │       ├── 0054__cli__directory.json
│   │       ├── 0055__cli__dns.json
│   │       ├── 0056__cli__docs.json
│   │       ├── 0057__cli__doctor.json
│   │       ├── 0058__cli__gateway.json
│   │       ├── 0059__cli__health.json
│   │       ├── 0060__cli__hooks.json
│   │       ├── 0061__cli.json
│   │       ├── 0062__cli__logs.json
│   │       ├── 0063__cli__memory.json
│   │       ├── 0064__cli__message.json
│   │       ├── 0065__cli__models.json
│   │       ├── 0066__cli__node.json
│   │       ├── 0067__cli__nodes.json
│   │       ├── 0068__cli__onboard.json
│   │       ├── 0069__cli__pairing.json
│   │       ├── 0070__cli__plugins.json
│   │       ├── 0071__cli__qr.json
│   │       ├── 0072__cli__reset.json
│   │       ├── 0073__cli__sandbox.json
│   │       ├── 0074__cli__security.json
│   │       ├── 0075__cli__sessions.json
│   │       ├── 0076__cli__setup.json
│   │       ├── 0077__cli__skills.json
│   │       ├── 0078__cli__status.json
│   │       ├── 0079__cli__system.json
│   │       ├── 0080__cli__tui.json
│   │       ├── 0081__cli__uninstall.json
│   │       ├── 0082__cli__update.json
│   │       ├── 0083__cli__voicecall.json
│   │       ├── 0084__cli__webhooks.json
│   │       ├── 0085__concepts__agent.json
│   │       ├── 0086__concepts__agent-loop.json
│   │       ├── 0087__concepts__agent-workspace.json
│   │       ├── 0088__concepts__architecture.json
│   │       ├── 0089__concepts__compaction.json
│   │       ├── 0090__concepts__context.json
│   │       ├── 0091__concepts__features.json
│   │       ├── 0092__concepts__markdown-formatting.json
│   │       ├── 0093__concepts__memory.json
│   │       ├── 0094__concepts__messages.json
│   │       ├── 0095__concepts__model-failover.json
│   │       ├── 0096__concepts__model-providers.json
│   │       ├── 0097__concepts__models.json
│   │       ├── 0098__concepts__multi-agent.json
│   │       ├── 0099__concepts__oauth.json
│   │       ├── 0100__concepts__presence.json
│   │       ├── 0101__concepts__queue.json
│   │       ├── 0102__concepts__retry.json
│   │       ├── 0103__concepts__session.json
│   │       ├── 0104__concepts__session-pruning.json
│   │       ├── 0105__concepts__session-tool.json
│   │       ├── 0106__concepts__sessions.json
│   │       ├── 0107__concepts__streaming.json
│   │       ├── 0108__concepts__system-prompt.json
│   │       ├── 0109__concepts__timezone.json
│   │       ├── 0110__concepts__typebox.json
│   │       ├── 0111__concepts__typing-indicators.json
│   │       ├── 0112__concepts__usage-tracking.json
│   │       ├── 0113__experiments__onboarding-config-protocol.json
│   │       ├── 0114__experiments__proposals__model-config.json
│   │       ├── 0115__experiments__research__memory.json
│   │       ├── 0116__gateway__authentication.json
│   │       ├── 0117__gateway__background-process.json
│   │       ├── 0118__gateway__bonjour.json
│   │       ├── 0119__gateway__bridge-protocol.json
│   │       ├── 0120__gateway__cli-backends.json
│   │       ├── 0121__gateway__configuration.json
│   │       ├── 0122__gateway__configuration-examples.json
│   │       ├── 0123__gateway__configuration-reference.json
│   │       ├── 0124__gateway__discovery.json
│   │       ├── 0125__gateway__doctor.json
│   │       ├── 0126__gateway__gateway-lock.json
│   │       ├── 0127__gateway__health.json
│   │       ├── 0128__gateway__heartbeat.json
│   │       ├── 0129__gateway.json
│   │       ├── 0130__gateway__local-models.json
│   │       ├── 0131__gateway__logging.json
│   │       ├── 0132__gateway__multiple-gateways.json
│   │       ├── 0133__gateway__network-model.json
│   │       ├── 0134__gateway__openai-http-api.json
│   │       ├── 0135__gateway__pairing.json
│   │       ├── 0136__gateway__protocol.json
│   │       ├── 0137__gateway__remote.json
│   │       ├── 0138__gateway__remote-gateway-readme.json
│   │       ├── 0139__gateway__sandbox-vs-tool-policy-vs-elevated.json
│   │       ├── 0140__gateway__sandboxing.json
│   │       ├── 0141__gateway__security.json
│   │       ├── 0142__gateway__tailscale.json
│   │       ├── 0143__gateway__tools-invoke-http-api.json
│   │       ├── 0144__gateway__troubleshooting.json
│   │       ├── 0145__gateway__trusted-proxy-auth.json
│   │       ├── 0146__help__debugging.json
│   │       ├── 0147__help__environment.json
│   │       ├── 0148__help__faq.json
│   │       ├── 0149__help.json
│   │       ├── 0150__help__scripts.json
│   │       ├── 0151__help__testing.json
│   │       ├── 0152__help__troubleshooting.json
│   │       ├── 0153__https_____docs_openclaw_ai.json
│   │       ├── 0154__install__ansible.json
│   │       ├── 0155__install__bun.json
│   │       ├── 0156__install__development-channels.json
│   │       ├── 0157__install__docker.json
│   │       ├── 0158__install__exe-dev.json
│   │       ├── 0159__install__fly.json
│   │       ├── 0160__install__gcp.json
│   │       ├── 0161__install__hetzner.json
│   │       ├── 0162__install.json
│   │       ├── 0163__install__installer.json
│   │       ├── 0164__install__macos-vm.json
│   │       ├── 0165__install__migrating.json
│   │       ├── 0166__install__nix.json
│   │       ├── 0167__install__node.json
│   │       ├── 0168__install__northflank.json
│   │       ├── 0169__install__podman.json
│   │       ├── 0170__install__railway.json
│   │       ├── 0171__install__render.json
│   │       ├── 0172__install__uninstall.json
│   │       ├── 0173__install__updating.json
│   │       ├── 0174__ja-JP.json
│   │       ├── 0175__ja-JP__start__getting-started.json
│   │       ├── 0176__ja-JP__start__wizard.json
│   │       ├── 0177__nodes__audio.json
│   │       ├── 0178__nodes__camera.json
│   │       ├── 0179__nodes__images.json
│   │       ├── 0180__nodes.json
│   │       ├── 0181__nodes__location-command.json
│   │       ├── 0182__nodes__talk.json
│   │       ├── 0183__nodes__troubleshooting.json
│   │       ├── 0184__nodes__voicewake.json
│   │       ├── 0185__platforms__android.json
│   │       ├── 0186__platforms.json
│   │       ├── 0187__platforms__ios.json
│   │       ├── 0188__platforms__linux.json
│   │       ├── 0189__platforms__mac__bundled-gateway.json
│   │       ├── 0190__platforms__mac__canvas.json
│   │       ├── 0191__platforms__mac__child-process.json
│   │       ├── 0192__platforms__mac__dev-setup.json
│   │       ├── 0193__platforms__mac__health.json
│   │       ├── 0194__platforms__mac__icon.json
│   │       ├── 0195__platforms__mac__logging.json
│   │       ├── 0196__platforms__mac__menu-bar.json
│   │       ├── 0197__platforms__mac__peekaboo.json
│   │       ├── 0198__platforms__mac__permissions.json
│   │       ├── 0199__platforms__mac__release.json
│   │       ├── 0200__platforms__mac__remote.json
│   │       ├── 0201__platforms__mac__signing.json
│   │       ├── 0202__platforms__mac__skills.json
│   │       ├── 0203__platforms__mac__voice-overlay.json
│   │       ├── 0204__platforms__mac__voicewake.json
│   │       ├── 0205__platforms__mac__webchat.json
│   │       ├── 0206__platforms__mac__xpc.json
│   │       ├── 0207__platforms__macos.json
│   │       ├── 0208__platforms__windows.json
│   │       ├── 0209__plugins__community.json
│   │       ├── 0210__plugins__voice-call.json
│   │       ├── 0211__plugins__zalouser.json
│   │       ├── 0212__providers__anthropic.json
│   │       ├── 0213__providers__bedrock.json
│   │       ├── 0214__providers__glm.json
│   │       ├── 0215__providers.json
│   │       ├── 0216__providers__litellm.json
│   │       ├── 0217__providers__minimax.json
│   │       ├── 0218__providers__mistral.json
│   │       ├── 0219__providers__models.json
│   │       ├── 0220__providers__moonshot.json
│   │       ├── 0221__providers__openai.json
│   │       ├── 0222__providers__opencode.json
│   │       ├── 0223__providers__openrouter.json
│   │       ├── 0224__providers__qianfan.json
│   │       ├── 0225__providers__synthetic.json
│   │       ├── 0226__providers__vercel-ai-gateway.json
│   │       ├── 0227__providers__zai.json
│   │       ├── 0228__reference__AGENTS_default.json
│   │       ├── 0229__reference__RELEASING.json
│   │       ├── 0230__reference__credits.json
│   │       ├── 0231__reference__device-models.json
│   │       ├── 0232__reference__prompt-caching.json
│   │       ├── 0233__reference__rpc.json
│   │       ├── 0234__reference__session-management-compaction.json
│   │       ├── 0235__reference__templates__AGENTS.json
│   │       ├── 0236__reference__templates__BOOT.json
│   │       ├── 0237__reference__templates__BOOTSTRAP.json
│   │       ├── 0238__reference__templates__HEARTBEAT.json
│   │       ├── 0239__reference__templates__IDENTITY.json
│   │       ├── 0240__reference__templates__SOUL.json
│   │       ├── 0241__reference__templates__TOOLS.json
│   │       ├── 0242__reference__templates__USER.json
│   │       ├── 0243__reference__test.json
│   │       ├── 0244__reference__token-use.json
│   │       ├── 0245__reference__wizard.json
│   │       ├── 0246__security__formal-verification.json
│   │       ├── 0247__start__bootstrapping.json
│   │       ├── 0248__start__docs-directory.json
│   │       ├── 0249__start__getting-started.json
│   │       ├── 0250__start__hubs.json
│   │       ├── 0251__start__lore.json
│   │       ├── 0252__start__onboarding.json
│   │       ├── 0253__start__onboarding-overview.json
│   │       ├── 0254__start__openclaw.json
│   │       ├── 0255__start__setup.json
│   │       ├── 0256__start__showcase.json
│   │       ├── 0257__start__wizard.json
│   │       ├── 0258__tools__acp-agents.json
│   │       ├── 0259__tools__agent-send.json
│   │       ├── 0260__tools__apply-patch.json
│   │       ├── 0261__tools__browser.json
│   │       ├── 0262__tools__browser-linux-troubleshooting.json
│   │       ├── 0263__tools__browser-login.json
│   │       ├── 0264__tools__chrome-extension.json
│   │       ├── 0265__tools__clawhub.json
│   │       ├── 0266__tools__elevated.json
│   │       ├── 0267__tools__exec.json
│   │       ├── 0268__tools.json
│   │       ├── 0269__tools__llm-task.json
│   │       ├── 0270__tools__lobster.json
│   │       ├── 0271__tools__multi-agent-sandbox-tools.json
│   │       ├── 0272__tools__plugin.json
│   │       ├── 0273__tools__reactions.json
│   │       ├── 0274__tools__skills.json
│   │       ├── 0275__tools__skills-config.json
│   │       ├── 0276__tools__slash-commands.json
│   │       ├── 0277__tools__subagents.json
│   │       ├── 0278__tools__thinking.json
│   │       ├── 0279__tools__web.json
│   │       ├── 0280__web__control-ui.json
│   │       ├── 0281__web__dashboard.json
│   │       ├── 0282__web.json
│   │       ├── 0283__web__tui.json
│   │       ├── 0284__web__webchat.json
│   │       ├── 0285__zh-CN__automation__auth-monitoring.json
│   │       ├── 0286__zh-CN__automation__cron-jobs.json
│   │       ├── 0287__zh-CN__automation__cron-vs-heartbeat.json
│   │       ├── 0288__zh-CN__automation__gmail-pubsub.json
│   │       ├── 0289__zh-CN__automation__hooks.json
│   │       ├── 0290__zh-CN__automation__poll.json
│   │       ├── 0291__zh-CN__automation__troubleshooting.json
│   │       ├── 0292__zh-CN__automation__webhook.json
│   │       ├── 0293__zh-CN__channels__broadcast-groups.json
│   │       ├── 0294__zh-CN__channels__channel-routing.json
│   │       ├── 0295__zh-CN__channels__discord.json
│   │       ├── 0296__zh-CN__channels__feishu.json
│   │       ├── 0297__zh-CN__channels__googlechat.json
│   │       ├── 0298__zh-CN__channels__group-messages.json
│   │       ├── 0299__zh-CN__channels__groups.json
│   │       ├── 0300__zh-CN__channels__imessage.json
│   │       ├── 0301__zh-CN__channels.json
│   │       ├── 0302__zh-CN__channels__line.json
│   │       ├── 0303__zh-CN__channels__location.json
│   │       ├── 0304__zh-CN__channels__matrix.json
│   │       ├── 0305__zh-CN__channels__mattermost.json
│   │       ├── 0306__zh-CN__channels__msteams.json
│   │       ├── 0307__zh-CN__channels__pairing.json
│   │       ├── 0308__zh-CN__channels__signal.json
│   │       ├── 0309__zh-CN__channels__slack.json
│   │       ├── 0310__zh-CN__channels__telegram.json
│   │       ├── 0311__zh-CN__channels__troubleshooting.json
│   │       ├── 0312__zh-CN__channels__whatsapp.json
│   │       ├── 0313__zh-CN__channels__zalo.json
│   │       ├── 0314__zh-CN__channels__zalouser.json
│   │       ├── 0315__zh-CN__cli__agent.json
│   │       ├── 0316__zh-CN__cli__agents.json
│   │       ├── 0317__zh-CN__cli__approvals.json
│   │       ├── 0318__zh-CN__cli__browser.json
│   │       ├── 0319__zh-CN__cli__channels.json
│   │       ├── 0320__zh-CN__cli__configure.json
│   │       ├── 0321__zh-CN__cli__cron.json
│   │       ├── 0322__zh-CN__cli__dashboard.json
│   │       ├── 0323__zh-CN__cli__directory.json
│   │       ├── 0324__zh-CN__cli__dns.json
│   │       ├── 0325__zh-CN__cli__docs.json
│   │       ├── 0326__zh-CN__cli__doctor.json
│   │       ├── 0327__zh-CN__cli__gateway.json
│   │       ├── 0328__zh-CN__cli__health.json
│   │       ├── 0329__zh-CN__cli__hooks.json
│   │       ├── 0330__zh-CN__cli.json
│   │       ├── 0331__zh-CN__cli__logs.json
│   │       ├── 0332__zh-CN__cli__memory.json
│   │       ├── 0333__zh-CN__cli__message.json
│   │       ├── 0334__zh-CN__cli__models.json
│   │       ├── 0335__zh-CN__cli__nodes.json
│   │       ├── 0336__zh-CN__cli__onboard.json
│   │       ├── 0337__zh-CN__cli__pairing.json
│   │       ├── 0338__zh-CN__cli__plugins.json
│   │       ├── 0339__zh-CN__cli__reset.json
│   │       ├── 0340__zh-CN__cli__sandbox.json
│   │       ├── 0341__zh-CN__cli__security.json
│   │       ├── 0342__zh-CN__cli__sessions.json
│   │       ├── 0343__zh-CN__cli__setup.json
│   │       ├── 0344__zh-CN__cli__skills.json
│   │       ├── 0345__zh-CN__cli__status.json
│   │       ├── 0346__zh-CN__cli__system.json
│   │       ├── 0347__zh-CN__cli__tui.json
│   │       ├── 0348__zh-CN__cli__uninstall.json
│   │       ├── 0349__zh-CN__cli__update.json
│   │       ├── 0350__zh-CN__cli__voicecall.json
│   │       ├── 0351__zh-CN__concepts__agent.json
│   │       ├── 0352__zh-CN__concepts__agent-loop.json
│   │       ├── 0353__zh-CN__concepts__agent-workspace.json
│   │       ├── 0354__zh-CN__concepts__architecture.json
│   │       ├── 0355__zh-CN__concepts__compaction.json
│   │       ├── 0356__zh-CN__concepts__context.json
│   │       ├── 0357__zh-CN__concepts__features.json
│   │       ├── 0358__zh-CN__concepts__markdown-formatting.json
│   │       ├── 0359__zh-CN__concepts__memory.json
│   │       ├── 0360__zh-CN__concepts__messages.json
│   │       ├── 0361__zh-CN__concepts__model-failover.json
│   │       ├── 0362__zh-CN__concepts__model-providers.json
│   │       ├── 0363__zh-CN__concepts__models.json
│   │       ├── 0364__zh-CN__concepts__multi-agent.json
│   │       ├── 0365__zh-CN__concepts__oauth.json
│   │       ├── 0366__zh-CN__concepts__presence.json
│   │       ├── 0367__zh-CN__concepts__queue.json
│   │       ├── 0368__zh-CN__concepts__retry.json
│   │       ├── 0369__zh-CN__concepts__session.json
│   │       ├── 0370__zh-CN__concepts__session-pruning.json
│   │       ├── 0371__zh-CN__concepts__session-tool.json
│   │       ├── 0372__zh-CN__concepts__sessions.json
│   │       ├── 0373__zh-CN__concepts__streaming.json
│   │       ├── 0374__zh-CN__concepts__system-prompt.json
│   │       ├── 0375__zh-CN__concepts__timezone.json
│   │       ├── 0376__zh-CN__concepts__typebox.json
│   │       ├── 0377__zh-CN__concepts__typing-indicators.json
│   │       ├── 0378__zh-CN__concepts__usage-tracking.json
│   │       ├── 0379__zh-CN__experiments__onboarding-config-protocol.json
│   │       ├── 0380__zh-CN__experiments__plans__cron-add-hardening.json
│   │       ├── 0381__zh-CN__experiments__plans__group-policy-hardening.json
│   │       ├── 0382__zh-CN__experiments__proposals__model-config.json
│   │       ├── 0383__zh-CN__experiments__research__memory.json
│   │       ├── 0384__zh-CN__gateway__authentication.json
│   │       ├── 0385__zh-CN__gateway__background-process.json
│   │       ├── 0386__zh-CN__gateway__bonjour.json
│   │       ├── 0387__zh-CN__gateway__bridge-protocol.json
│   │       ├── 0388__zh-CN__gateway__cli-backends.json
│   │       ├── 0389__zh-CN__gateway__configuration.json
│   │       ├── 0390__zh-CN__gateway__configuration-examples.json
│   │       ├── 0391__zh-CN__gateway__discovery.json
│   │       ├── 0392__zh-CN__gateway__doctor.json
│   │       ├── 0393__zh-CN__gateway__gateway-lock.json
│   │       ├── 0394__zh-CN__gateway__health.json
│   │       ├── 0395__zh-CN__gateway__heartbeat.json
│   │       ├── 0396__zh-CN__gateway.json
│   │       ├── 0397__zh-CN__gateway__local-models.json
│   │       ├── 0398__zh-CN__gateway__logging.json
│   │       ├── 0399__zh-CN__gateway__multiple-gateways.json
│   │       ├── 0400__zh-CN__gateway__network-model.json
│   │       ├── 0401__zh-CN__gateway__openai-http-api.json
│   │       ├── 0402__zh-CN__gateway__pairing.json
│   │       ├── 0403__zh-CN__gateway__protocol.json
│   │       ├── 0404__zh-CN__gateway__remote.json
│   │       ├── 0405__zh-CN__gateway__remote-gateway-readme.json
│   │       ├── 0406__zh-CN__gateway__sandbox-vs-tool-policy-vs-elevated.json
│   │       ├── 0407__zh-CN__gateway__sandboxing.json
│   │       ├── 0408__zh-CN__gateway__security.json
│   │       ├── 0409__zh-CN__gateway__tailscale.json
│   │       ├── 0410__zh-CN__gateway__tools-invoke-http-api.json
│   │       ├── 0411__zh-CN__gateway__troubleshooting.json
│   │       ├── 0412__zh-CN__help__debugging.json
│   │       ├── 0413__zh-CN__help__environment.json
│   │       ├── 0414__zh-CN__help__faq.json
│   │       ├── 0415__zh-CN__help.json
│   │       ├── 0416__zh-CN__help__scripts.json
│   │       ├── 0417__zh-CN__help__testing.json
│   │       ├── 0418__zh-CN__help__troubleshooting.json
│   │       ├── 0419__zh-CN.json
│   │       ├── 0420__zh-CN__install__ansible.json
│   │       ├── 0421__zh-CN__install__bun.json
│   │       ├── 0422__zh-CN__install__development-channels.json
│   │       ├── 0423__zh-CN__install__docker.json
│   │       ├── 0424__zh-CN__install__exe-dev.json
│   │       ├── 0425__zh-CN__install__fly.json
│   │       ├── 0426__zh-CN__install__gcp.json
│   │       ├── 0427__zh-CN__install__hetzner.json
│   │       ├── 0428__zh-CN__install.json
│   │       ├── 0429__zh-CN__install__installer.json
│   │       ├── 0430__zh-CN__install__macos-vm.json
│   │       ├── 0431__zh-CN__install__migrating.json
│   │       ├── 0432__zh-CN__install__nix.json
│   │       ├── 0433__zh-CN__install__node.json
│   │       ├── 0434__zh-CN__install__northflank.json
│   │       ├── 0435__zh-CN__install__railway.json
│   │       ├── 0436__zh-CN__install__render.json
│   │       ├── 0437__zh-CN__install__uninstall.json
│   │       ├── 0438__zh-CN__install__updating.json
│   │       ├── 0439__zh-CN__nodes__audio.json
│   │       ├── 0440__zh-CN__nodes__camera.json
│   │       ├── 0441__zh-CN__nodes__images.json
│   │       ├── 0442__zh-CN__nodes.json
│   │       ├── 0443__zh-CN__nodes__location-command.json
│   │       ├── 0444__zh-CN__nodes__talk.json
│   │       ├── 0445__zh-CN__nodes__troubleshooting.json
│   │       ├── 0446__zh-CN__nodes__voicewake.json
│   │       ├── 0447__zh-CN__platforms__android.json
│   │       ├── 0448__zh-CN__platforms.json
│   │       ├── 0449__zh-CN__platforms__ios.json
│   │       ├── 0450__zh-CN__platforms__linux.json
│   │       ├── 0451__zh-CN__platforms__mac__bundled-gateway.json
│   │       ├── 0452__zh-CN__platforms__mac__canvas.json
│   │       ├── 0453__zh-CN__platforms__mac__child-process.json
│   │       ├── 0454__zh-CN__platforms__mac__dev-setup.json
│   │       ├── 0455__zh-CN__platforms__mac__health.json
│   │       ├── 0456__zh-CN__platforms__mac__icon.json
│   │       ├── 0457__zh-CN__platforms__mac__logging.json
│   │       ├── 0458__zh-CN__platforms__mac__menu-bar.json
│   │       ├── 0459__zh-CN__platforms__mac__peekaboo.json
│   │       ├── 0460__zh-CN__platforms__mac__permissions.json
│   │       ├── 0461__zh-CN__platforms__mac__release.json
│   │       ├── 0462__zh-CN__platforms__mac__remote.json
│   │       ├── 0463__zh-CN__platforms__mac__signing.json
│   │       ├── 0464__zh-CN__platforms__mac__skills.json
│   │       ├── 0465__zh-CN__platforms__mac__voice-overlay.json
│   │       ├── 0466__zh-CN__platforms__mac__voicewake.json
│   │       ├── 0467__zh-CN__platforms__mac__webchat.json
│   │       ├── 0468__zh-CN__platforms__mac__xpc.json
│   │       ├── 0469__zh-CN__platforms__macos.json
│   │       ├── 0470__zh-CN__platforms__windows.json
│   │       ├── 0471__zh-CN__plugins__voice-call.json
│   │       ├── 0472__zh-CN__plugins__zalouser.json
│   │       ├── 0473__zh-CN__providers__anthropic.json
│   │       ├── 0474__zh-CN__providers__bedrock.json
│   │       ├── 0475__zh-CN__providers__glm.json
│   │       ├── 0476__zh-CN__providers.json
│   │       ├── 0477__zh-CN__providers__minimax.json
│   │       ├── 0478__zh-CN__providers__models.json
│   │       ├── 0479__zh-CN__providers__moonshot.json
│   │       ├── 0480__zh-CN__providers__openai.json
│   │       ├── 0481__zh-CN__providers__opencode.json
│   │       ├── 0482__zh-CN__providers__openrouter.json
│   │       ├── 0483__zh-CN__providers__qianfan.json
│   │       ├── 0484__zh-CN__providers__synthetic.json
│   │       ├── 0485__zh-CN__providers__vercel-ai-gateway.json
│   │       ├── 0486__zh-CN__providers__zai.json
│   │       ├── 0487__zh-CN__reference__AGENTS_default.json
│   │       ├── 0488__zh-CN__reference__RELEASING.json
│   │       ├── 0489__zh-CN__reference__credits.json
│   │       ├── 0490__zh-CN__reference__device-models.json
│   │       ├── 0491__zh-CN__reference__rpc.json
│   │       ├── 0492__zh-CN__reference__session-management-compaction.json
│   │       ├── 0493__zh-CN__reference__templates__AGENTS.json
│   │       ├── 0494__zh-CN__reference__templates__BOOT.json
│   │       ├── 0495__zh-CN__reference__templates__BOOTSTRAP.json
│   │       ├── 0496__zh-CN__reference__templates__HEARTBEAT.json
│   │       ├── 0497__zh-CN__reference__templates__IDENTITY.json
│   │       ├── 0498__zh-CN__reference__templates__SOUL.json
│   │       ├── 0499__zh-CN__reference__templates__TOOLS.json
│   │       ├── 0500__zh-CN__reference__templates__USER.json
│   │       ├── 0501__zh-CN__reference__test.json
│   │       ├── 0502__zh-CN__reference__token-use.json
│   │       ├── 0503__zh-CN__reference__wizard.json
│   │       ├── 0504__zh-CN__security__formal-verification.json
│   │       ├── 0505__zh-CN__start__bootstrapping.json
│   │       ├── 0506__zh-CN__start__docs-directory.json
│   │       ├── 0507__zh-CN__start__getting-started.json
│   │       ├── 0508__zh-CN__start__hubs.json
│   │       ├── 0509__zh-CN__start__lore.json
│   │       ├── 0510__zh-CN__start__onboarding.json
│   │       ├── 0511__zh-CN__start__openclaw.json
│   │       ├── 0512__zh-CN__start__setup.json
│   │       ├── 0513__zh-CN__start__showcase.json
│   │       ├── 0514__zh-CN__start__wizard.json
│   │       ├── 0515__zh-CN__tools__agent-send.json
│   │       ├── 0516__zh-CN__tools__apply-patch.json
│   │       ├── 0517__zh-CN__tools__browser.json
│   │       ├── 0518__zh-CN__tools__browser-linux-troubleshooting.json
│   │       ├── 0519__zh-CN__tools__browser-login.json
│   │       ├── 0520__zh-CN__tools__chrome-extension.json
│   │       ├── 0521__zh-CN__tools__clawhub.json
│   │       ├── 0522__zh-CN__tools__elevated.json
│   │       ├── 0523__zh-CN__tools__exec.json
│   │       ├── 0524__zh-CN__tools.json
│   │       ├── 0525__zh-CN__tools__llm-task.json
│   │       ├── 0526__zh-CN__tools__lobster.json
│   │       ├── 0527__zh-CN__tools__multi-agent-sandbox-tools.json
│   │       ├── 0528__zh-CN__tools__plugin.json
│   │       ├── 0529__zh-CN__tools__reactions.json
│   │       ├── 0530__zh-CN__tools__skills.json
│   │       ├── 0531__zh-CN__tools__skills-config.json
│   │       ├── 0532__zh-CN__tools__slash-commands.json
│   │       ├── 0533__zh-CN__tools__subagents.json
│   │       ├── 0534__zh-CN__tools__thinking.json
│   │       ├── 0535__zh-CN__tools__web.json
│   │       ├── 0536__zh-CN__web__control-ui.json
│   │       ├── 0537__zh-CN__web__dashboard.json
│   │       ├── 0538__zh-CN__web.json
│   │       ├── 0539__zh-CN__web__tui.json
│   │       └── 0540__zh-CN__web__webchat.json
│   ├── features
│   │   ├── FEATURE_MATRIX.md
│   │   └── FEATURE_STATUS_SUMMARY.json
│   ├── inventory
│   │   └── FILE_TREE.json
│   ├── network
│   │   └── NETWORK_AND_GATEWAY.md
│   ├── protocols
│   │   └── APIS.md
│   ├── scripts
│   │   ├── audit_openclaw.sh
│   │   ├── build_inventory.mjs
│   │   ├── crawl_docs.mjs
│   │   └── generate_artifacts.mjs
│   ├── security
│   │   └── SECURITY_AND_SANDBOXING.md
│   ├── source
│   │   └── openclaw-main
│   │       ├── .detect-secrets.cfg
│   │       ├── .dockerignore
│   │       ├── .env.example
│   │       ├── .gitattributes
│   │       ├── .github
│   │       │   ├── FUNDING.yml
│   │       │   ├── ISSUE_TEMPLATE
│   │       │   │   ├── bug_report.yml
│   │       │   │   ├── config.yml
│   │       │   │   └── feature_request.yml
│   │       │   ├── actionlint.yaml
│   │       │   ├── actions
│   │       │   │   ├── detect-docs-changes
│   │       │   │   ├── setup-node-env
│   │       │   │   └── setup-pnpm-store-cache
│   │       │   ├── dependabot.yml
│   │       │   ├── instructions
│   │       │   │   └── copilot.instructions.md
│   │       │   ├── labeler.yml
│   │       │   ├── pull_request_template.md
│   │       │   └── workflows
│   │       │       ├── auto-response.yml
│   │       │       ├── ci.yml
│   │       │       ├── docker-release.yml
│   │       │       ├── install-smoke.yml
│   │       │       ├── labeler.yml
│   │       │       ├── sandbox-common-smoke.yml
│   │       │       ├── stale.yml
│   │       │       └── workflow-sanity.yml
│   │       ├── .gitignore
│   │       ├── .mailmap
│   │       ├── .markdownlint-cli2.jsonc
│   │       ├── .npmrc
│   │       ├── .oxfmtrc.jsonc
│   │       ├── .oxlintrc.json
│   │       ├── .pi
│   │       │   ├── extensions
│   │       │   │   ├── diff.ts
│   │       │   │   ├── files.ts
│   │       │   │   ├── prompt-url-widget.ts
│   │       │   │   └── redraws.ts
│   │       │   ├── git
│   │       │   │   └── .gitignore
│   │       │   └── prompts
│   │       │       ├── cl.md
│   │       │       ├── is.md
│   │       │       ├── landpr.md
│   │       │       └── reviewpr.md
│   │       ├── .pre-commit-config.yaml
│   │       ├── .secrets.baseline
│   │       ├── .shellcheckrc
│   │       ├── .swiftformat
│   │       ├── .swiftlint.yml
│   │       ├── .vscode
│   │       │   ├── extensions.json
│   │       │   └── settings.json
│   │       ├── AGENTS.md
│   │       ├── CHANGELOG.md
│   │       ├── CLAUDE.md -> AGENTS.md
│   │       ├── CONTRIBUTING.md
│   │       ├── Dockerfile
│   │       ├── Dockerfile.sandbox
│   │       ├── Dockerfile.sandbox-browser
│   │       ├── Dockerfile.sandbox-common
│   │       ├── LICENSE
│   │       ├── README.md
│   │       ├── SECURITY.md
│   │       ├── Swabble
│   │       │   ├── .github
│   │       │   │   └── workflows
│   │       │   ├── .gitignore
│   │       │   ├── .swiftformat
│   │       │   ├── .swiftlint.yml
│   │       │   ├── CHANGELOG.md
│   │       │   ├── LICENSE
│   │       │   ├── Package.resolved
│   │       │   ├── Package.swift
│   │       │   ├── README.md
│   │       │   ├── Sources
│   │       │   │   ├── SwabbleCore
│   │       │   │   ├── SwabbleKit
│   │       │   │   └── swabble
│   │       │   ├── Tests
│   │       │   │   ├── SwabbleKitTests
│   │       │   │   └── swabbleTests
│   │       │   ├── docs
│   │       │   │   └── spec.md
│   │       │   └── scripts
│   │       │       ├── format.sh
│   │       │       └── lint.sh
│   │       ├── VISION.md
│   │       ├── appcast.xml
│   │       ├── apps
│   │       │   ├── android
│   │       │   │   ├── .gitignore
│   │       │   │   ├── README.md
│   │       │   │   ├── THIRD_PARTY_LICENSES
│   │       │   │   ├── app
│   │       │   │   ├── benchmark
│   │       │   │   ├── build.gradle.kts
│   │       │   │   ├── gradle
│   │       │   │   ├── gradle.properties
│   │       │   │   ├── gradlew
│   │       │   │   ├── gradlew.bat
│   │       │   │   ├── scripts
│   │       │   │   ├── settings.gradle.kts
│   │       │   │   └── style.md
│   │       │   ├── ios
│   │       │   │   ├── .swiftlint.yml
│   │       │   │   ├── Config
│   │       │   │   ├── LocalSigning.xcconfig.example
│   │       │   │   ├── README.md
│   │       │   │   ├── ShareExtension
│   │       │   │   ├── Signing.xcconfig
│   │       │   │   ├── Sources
│   │       │   │   ├── Tests
│   │       │   │   ├── WatchApp
│   │       │   │   ├── WatchExtension
│   │       │   │   ├── fastlane
│   │       │   │   └── project.yml
│   │       │   ├── macos
│   │       │   │   ├── Icon.icon
│   │       │   │   ├── Package.resolved
│   │       │   │   ├── Package.swift
│   │       │   │   ├── README.md
│   │       │   │   ├── Sources
│   │       │   │   └── Tests
│   │       │   └── shared
│   │       │       └── OpenClawKit
│   │       ├── assets
│   │       │   ├── avatar-placeholder.svg
│   │       │   ├── chrome-extension
│   │       │   │   ├── README.md
│   │       │   │   ├── background-utils.js
│   │       │   │   ├── background.js
│   │       │   │   ├── icons
│   │       │   │   ├── manifest.json
│   │       │   │   ├── options-validation.js
│   │       │   │   ├── options.html
│   │       │   │   └── options.js
│   │       │   ├── dmg-background-small.png
│   │       │   └── dmg-background.png
│   │       ├── changelog
│   │       │   └── fragments
│   │       │       └── README.md
│   │       ├── docker-compose.yml
│   │       ├── docker-setup.sh
│   │       ├── docs
│   │       │   ├── .i18n
│   │       │   │   ├── README.md
│   │       │   │   ├── glossary.ja-JP.json
│   │       │   │   ├── glossary.zh-CN.json
│   │       │   │   ├── ja-JP.tm.jsonl
│   │       │   │   └── zh-CN.tm.jsonl
│   │       │   ├── CNAME
│   │       │   ├── assets
│   │       │   │   ├── install-script.svg
│   │       │   │   ├── macos-onboarding
│   │       │   │   ├── openclaw-logo-text-dark.png
│   │       │   │   ├── openclaw-logo-text.png
│   │       │   │   ├── pixel-lobster.svg
│   │       │   │   ├── showcase
│   │       │   │   └── sponsors
│   │       │   ├── automation
│   │       │   │   ├── auth-monitoring.md
│   │       │   │   ├── cron-jobs.md
│   │       │   │   ├── cron-vs-heartbeat.md
│   │       │   │   ├── gmail-pubsub.md
│   │       │   │   ├── hooks.md
│   │       │   │   ├── poll.md
│   │       │   │   ├── troubleshooting.md
│   │       │   │   └── webhook.md
│   │       │   ├── brave-search.md
│   │       │   ├── channels
│   │       │   │   ├── bluebubbles.md
│   │       │   │   ├── broadcast-groups.md
│   │       │   │   ├── channel-routing.md
│   │       │   │   ├── discord.md
│   │       │   │   ├── feishu.md
│   │       │   │   ├── googlechat.md
│   │       │   │   ├── grammy.md
│   │       │   │   ├── group-messages.md
│   │       │   │   ├── groups.md
│   │       │   │   ├── imessage.md
│   │       │   │   ├── index.md
│   │       │   │   ├── irc.md
│   │       │   │   ├── line.md
│   │       │   │   ├── location.md
│   │       │   │   ├── matrix.md
│   │       │   │   ├── mattermost.md
│   │       │   │   ├── msteams.md
│   │       │   │   ├── nextcloud-talk.md
│   │       │   │   ├── nostr.md
│   │       │   │   ├── pairing.md
│   │       │   │   ├── signal.md
│   │       │   │   ├── slack.md
│   │       │   │   ├── synology-chat.md
│   │       │   │   ├── telegram.md
│   │       │   │   ├── tlon.md
│   │       │   │   ├── troubleshooting.md
│   │       │   │   ├── twitch.md
│   │       │   │   ├── whatsapp.md
│   │       │   │   ├── zalo.md
│   │       │   │   └── zalouser.md
│   │       │   ├── ci.md
│   │       │   ├── cli
│   │       │   │   ├── acp.md
│   │       │   │   ├── agent.md
│   │       │   │   ├── agents.md
│   │       │   │   ├── approvals.md
│   │       │   │   ├── browser.md
│   │       │   │   ├── channels.md
│   │       │   │   ├── clawbot.md
│   │       │   │   ├── completion.md
│   │       │   │   ├── config.md
│   │       │   │   ├── configure.md
│   │       │   │   ├── cron.md
│   │       │   │   ├── daemon.md
│   │       │   │   ├── dashboard.md
│   │       │   │   ├── devices.md
│   │       │   │   ├── directory.md
│   │       │   │   ├── dns.md
│   │       │   │   ├── docs.md
│   │       │   │   ├── doctor.md
│   │       │   │   ├── gateway.md
│   │       │   │   ├── health.md
│   │       │   │   ├── hooks.md
│   │       │   │   ├── index.md
│   │       │   │   ├── logs.md
│   │       │   │   ├── memory.md
│   │       │   │   ├── message.md
│   │       │   │   ├── models.md
│   │       │   │   ├── node.md
│   │       │   │   ├── nodes.md
│   │       │   │   ├── onboard.md
│   │       │   │   ├── pairing.md
│   │       │   │   ├── plugins.md
│   │       │   │   ├── qr.md
│   │       │   │   ├── reset.md
│   │       │   │   ├── sandbox.md
│   │       │   │   ├── security.md
│   │       │   │   ├── sessions.md
│   │       │   │   ├── setup.md
│   │       │   │   ├── skills.md
│   │       │   │   ├── status.md
│   │       │   │   ├── system.md
│   │       │   │   ├── tui.md
│   │       │   │   ├── uninstall.md
│   │       │   │   ├── update.md
│   │       │   │   ├── voicecall.md
│   │       │   │   └── webhooks.md
│   │       │   ├── concepts
│   │       │   │   ├── agent-loop.md
│   │       │   │   ├── agent-workspace.md
│   │       │   │   ├── agent.md
│   │       │   │   ├── architecture.md
│   │       │   │   ├── compaction.md
│   │       │   │   ├── context.md
│   │       │   │   ├── features.md
│   │       │   │   ├── markdown-formatting.md
│   │       │   │   ├── memory.md
│   │       │   │   ├── messages.md
│   │       │   │   ├── model-failover.md
│   │       │   │   ├── model-providers.md
│   │       │   │   ├── models.md
│   │       │   │   ├── multi-agent.md
│   │       │   │   ├── oauth.md
│   │       │   │   ├── presence.md
│   │       │   │   ├── queue.md
│   │       │   │   ├── retry.md
│   │       │   │   ├── session-pruning.md
│   │       │   │   ├── session-tool.md
│   │       │   │   ├── session.md
│   │       │   │   ├── sessions.md
│   │       │   │   ├── streaming.md
│   │       │   │   ├── system-prompt.md
│   │       │   │   ├── timezone.md
│   │       │   │   ├── typebox.md
│   │       │   │   ├── typing-indicators.md
│   │       │   │   └── usage-tracking.md
│   │       │   ├── date-time.md
│   │       │   ├── debug
│   │       │   │   └── node-issue.md
│   │       │   ├── design
│   │       │   │   └── kilo-gateway-integration.md
│   │       │   ├── diagnostics
│   │       │   │   └── flags.md
│   │       │   ├── docs.json
│   │       │   ├── experiments
│   │       │   │   ├── onboarding-config-protocol.md
│   │       │   │   ├── plans
│   │       │   │   ├── proposals
│   │       │   │   └── research
│   │       │   ├── gateway
│   │       │   │   ├── authentication.md
│   │       │   │   ├── background-process.md
│   │       │   │   ├── bonjour.md
│   │       │   │   ├── bridge-protocol.md
│   │       │   │   ├── cli-backends.md
│   │       │   │   ├── configuration-examples.md
│   │       │   │   ├── configuration-reference.md
│   │       │   │   ├── configuration.md
│   │       │   │   ├── discovery.md
│   │       │   │   ├── doctor.md
│   │       │   │   ├── gateway-lock.md
│   │       │   │   ├── health.md
│   │       │   │   ├── heartbeat.md
│   │       │   │   ├── index.md
│   │       │   │   ├── local-models.md
│   │       │   │   ├── logging.md
│   │       │   │   ├── multiple-gateways.md
│   │       │   │   ├── network-model.md
│   │       │   │   ├── openai-http-api.md
│   │       │   │   ├── openresponses-http-api.md
│   │       │   │   ├── pairing.md
│   │       │   │   ├── protocol.md
│   │       │   │   ├── remote-gateway-readme.md
│   │       │   │   ├── remote.md
│   │       │   │   ├── sandbox-vs-tool-policy-vs-elevated.md
│   │       │   │   ├── sandboxing.md
│   │       │   │   ├── security
│   │       │   │   ├── tailscale.md
│   │       │   │   ├── tools-invoke-http-api.md
│   │       │   │   ├── troubleshooting.md
│   │       │   │   └── trusted-proxy-auth.md
│   │       │   ├── help
│   │       │   │   ├── debugging.md
│   │       │   │   ├── environment.md
│   │       │   │   ├── faq.md
│   │       │   │   ├── index.md
│   │       │   │   ├── scripts.md
│   │       │   │   ├── testing.md
│   │       │   │   └── troubleshooting.md
│   │       │   ├── images
│   │       │   │   ├── configure-model-picker-unsearchable.png
│   │       │   │   ├── feishu-step2-create-app.png
│   │       │   │   ├── feishu-step3-credentials.png
│   │       │   │   ├── feishu-step4-permissions.png
│   │       │   │   ├── feishu-step5-bot-capability.png
│   │       │   │   ├── feishu-step6-event-subscription.png
│   │       │   │   ├── groups-flow.svg
│   │       │   │   └── mobile-ui-screenshot.png
│   │       │   ├── index.md
│   │       │   ├── install
│   │       │   │   ├── ansible.md
│   │       │   │   ├── bun.md
│   │       │   │   ├── development-channels.md
│   │       │   │   ├── docker.md
│   │       │   │   ├── exe-dev.md
│   │       │   │   ├── fly.md
│   │       │   │   ├── gcp.md
│   │       │   │   ├── hetzner.md
│   │       │   │   ├── index.md
│   │       │   │   ├── installer.md
│   │       │   │   ├── macos-vm.md
│   │       │   │   ├── migrating.md
│   │       │   │   ├── nix.md
│   │       │   │   ├── node.md
│   │       │   │   ├── northflank.mdx
│   │       │   │   ├── podman.md
│   │       │   │   ├── railway.mdx
│   │       │   │   ├── render.mdx
│   │       │   │   ├── uninstall.md
│   │       │   │   └── updating.md
│   │       │   ├── ja-JP
│   │       │   │   ├── AGENTS.md
│   │       │   │   ├── index.md
│   │       │   │   └── start
│   │       │   ├── logging.md
│   │       │   ├── nav-tabs-underline.js
│   │       │   ├── network.md
│   │       │   ├── nodes
│   │       │   │   ├── audio.md
│   │       │   │   ├── camera.md
│   │       │   │   ├── images.md
│   │       │   │   ├── index.md
│   │       │   │   ├── location-command.md
│   │       │   │   ├── media-understanding.md
│   │       │   │   ├── talk.md
│   │       │   │   ├── troubleshooting.md
│   │       │   │   └── voicewake.md
│   │       │   ├── perplexity.md
│   │       │   ├── pi-dev.md
│   │       │   ├── pi.md
│   │       │   ├── platforms
│   │       │   │   ├── android.md
│   │       │   │   ├── digitalocean.md
│   │       │   │   ├── index.md
│   │       │   │   ├── ios.md
│   │       │   │   ├── linux.md
│   │       │   │   ├── mac
│   │       │   │   ├── macos.md
│   │       │   │   ├── oracle.md
│   │       │   │   ├── raspberry-pi.md
│   │       │   │   └── windows.md
│   │       │   ├── plugins
│   │       │   │   ├── agent-tools.md
│   │       │   │   ├── community.md
│   │       │   │   ├── manifest.md
│   │       │   │   ├── voice-call.md
│   │       │   │   └── zalouser.md
│   │       │   ├── prose.md
│   │       │   ├── providers
│   │       │   │   ├── anthropic.md
│   │       │   │   ├── bedrock.md
│   │       │   │   ├── claude-max-api-proxy.md
│   │       │   │   ├── cloudflare-ai-gateway.md
│   │       │   │   ├── deepgram.md
│   │       │   │   ├── github-copilot.md
│   │       │   │   ├── glm.md
│   │       │   │   ├── huggingface.md
│   │       │   │   ├── index.md
│   │       │   │   ├── kilocode.md
│   │       │   │   ├── litellm.md
│   │       │   │   ├── minimax.md
│   │       │   │   ├── mistral.md
│   │       │   │   ├── models.md
│   │       │   │   ├── moonshot.md
│   │       │   │   ├── nvidia.md
│   │       │   │   ├── ollama.md
│   │       │   │   ├── openai.md
│   │       │   │   ├── opencode.md
│   │       │   │   ├── openrouter.md
│   │       │   │   ├── qianfan.md
│   │       │   │   ├── qwen.md
│   │       │   │   ├── synthetic.md
│   │       │   │   ├── together.md
│   │       │   │   ├── venice.md
│   │       │   │   ├── vercel-ai-gateway.md
│   │       │   │   ├── vllm.md
│   │       │   │   ├── xiaomi.md
│   │       │   │   └── zai.md
│   │       │   ├── refactor
│   │       │   │   ├── clawnet.md
│   │       │   │   ├── exec-host.md
│   │       │   │   ├── outbound-session-mirroring.md
│   │       │   │   ├── plugin-sdk.md
│   │       │   │   └── strict-config.md
│   │       │   ├── reference
│   │       │   │   ├── AGENTS.default.md
│   │       │   │   ├── RELEASING.md
│   │       │   │   ├── api-usage-costs.md
│   │       │   │   ├── credits.md
│   │       │   │   ├── device-models.md
│   │       │   │   ├── prompt-caching.md
│   │       │   │   ├── rpc.md
│   │       │   │   ├── session-management-compaction.md
│   │       │   │   ├── templates
│   │       │   │   ├── test.md
│   │       │   │   ├── token-use.md
│   │       │   │   ├── transcript-hygiene.md
│   │       │   │   └── wizard.md
│   │       │   ├── security
│   │       │   │   ├── CONTRIBUTING-THREAT-MODEL.md
│   │       │   │   ├── README.md
│   │       │   │   ├── THREAT-MODEL-ATLAS.md
│   │       │   │   └── formal-verification.md
│   │       │   ├── start
│   │       │   │   ├── bootstrapping.md
│   │       │   │   ├── docs-directory.md
│   │       │   │   ├── getting-started.md
│   │       │   │   ├── hubs.md
│   │       │   │   ├── lore.md
│   │       │   │   ├── onboarding-overview.md
│   │       │   │   ├── onboarding.md
│   │       │   │   ├── openclaw.md
│   │       │   │   ├── quickstart.md
│   │       │   │   ├── setup.md
│   │       │   │   ├── showcase.md
│   │       │   │   ├── wizard-cli-automation.md
│   │       │   │   ├── wizard-cli-reference.md
│   │       │   │   └── wizard.md
│   │       │   ├── style.css
│   │       │   ├── tools
│   │       │   │   ├── acp-agents.md
│   │       │   │   ├── agent-send.md
│   │       │   │   ├── apply-patch.md
│   │       │   │   ├── browser-linux-troubleshooting.md
│   │       │   │   ├── browser-login.md
│   │       │   │   ├── browser.md
│   │       │   │   ├── chrome-extension.md
│   │       │   │   ├── clawhub.md
│   │       │   │   ├── creating-skills.md
│   │       │   │   ├── elevated.md
│   │       │   │   ├── exec-approvals.md
│   │       │   │   ├── exec.md
│   │       │   │   ├── firecrawl.md
│   │       │   │   ├── index.md
│   │       │   │   ├── llm-task.md
│   │       │   │   ├── lobster.md
│   │       │   │   ├── loop-detection.md
│   │       │   │   ├── multi-agent-sandbox-tools.md
│   │       │   │   ├── plugin.md
│   │       │   │   ├── reactions.md
│   │       │   │   ├── skills-config.md
│   │       │   │   ├── skills.md
│   │       │   │   ├── slash-commands.md
│   │       │   │   ├── subagents.md
│   │       │   │   ├── thinking.md
│   │       │   │   └── web.md
│   │       │   ├── tts.md
│   │       │   ├── vps.md
│   │       │   ├── web
│   │       │   │   ├── control-ui.md
│   │       │   │   ├── dashboard.md
│   │       │   │   ├── index.md
│   │       │   │   ├── tui.md
│   │       │   │   └── webchat.md
│   │       │   ├── whatsapp-openclaw-ai-zh.jpg
│   │       │   ├── whatsapp-openclaw.jpg
│   │       │   └── zh-CN
│   │       │       ├── AGENTS.md
│   │       │       ├── automation
│   │       │       ├── brave-search.md
│   │       │       ├── channels
│   │       │       ├── cli
│   │       │       ├── concepts
│   │       │       ├── date-time.md
│   │       │       ├── debug
│   │       │       ├── diagnostics
│   │       │       ├── experiments
│   │       │       ├── gateway
│   │       │       ├── help
│   │       │       ├── index.md
│   │       │       ├── install
│   │       │       ├── logging.md
│   │       │       ├── network.md
│   │       │       ├── nodes
│   │       │       ├── perplexity.md
│   │       │       ├── pi-dev.md
│   │       │       ├── pi.md
│   │       │       ├── platforms
│   │       │       ├── plugins
│   │       │       ├── prose.md
│   │       │       ├── providers
│   │       │       ├── refactor
│   │       │       ├── reference
│   │       │       ├── security
│   │       │       ├── start
│   │       │       ├── tools
│   │       │       ├── tts.md
│   │       │       ├── vps.md
│   │       │       └── web
│   │       ├── docs.acp.md
│   │       ├── extensions
│   │       │   ├── acpx
│   │       │   │   ├── index.ts
│   │       │   │   ├── openclaw.plugin.json
│   │       │   │   ├── package.json
│   │       │   │   ├── skills
│   │       │   │   └── src
│   │       │   ├── bluebubbles
│   │       │   │   ├── README.md
│   │       │   │   ├── index.ts
│   │       │   │   ├── openclaw.plugin.json
│   │       │   │   ├── package.json
│   │       │   │   └── src
│   │       │   ├── copilot-proxy
│   │       │   │   ├── README.md
│   │       │   │   ├── index.ts
│   │       │   │   ├── openclaw.plugin.json
│   │       │   │   └── package.json
│   │       │   ├── device-pair
│   │       │   │   ├── index.ts
│   │       │   │   └── openclaw.plugin.json
│   │       │   ├── diagnostics-otel
│   │       │   │   ├── index.ts
│   │       │   │   ├── openclaw.plugin.json
│   │       │   │   ├── package.json
│   │       │   │   └── src
│   │       │   ├── discord
│   │       │   │   ├── index.ts
│   │       │   │   ├── openclaw.plugin.json
│   │       │   │   ├── package.json
│   │       │   │   └── src
│   │       │   ├── feishu
│   │       │   │   ├── index.ts
│   │       │   │   ├── openclaw.plugin.json
│   │       │   │   ├── package.json
│   │       │   │   ├── skills
│   │       │   │   └── src
│   │       │   ├── google-gemini-cli-auth
│   │       │   │   ├── README.md
│   │       │   │   ├── index.ts
│   │       │   │   ├── oauth.test.ts
│   │       │   │   ├── oauth.ts
│   │       │   │   ├── openclaw.plugin.json
│   │       │   │   └── package.json
│   │       │   ├── googlechat
│   │       │   │   ├── index.ts
│   │       │   │   ├── openclaw.plugin.json
│   │       │   │   ├── package.json
│   │       │   │   └── src
│   │       │   ├── imessage
│   │       │   │   ├── index.ts
│   │       │   │   ├── openclaw.plugin.json
│   │       │   │   ├── package.json
│   │       │   │   └── src
│   │       │   ├── irc
│   │       │   │   ├── index.ts
│   │       │   │   ├── openclaw.plugin.json
│   │       │   │   ├── package.json
│   │       │   │   └── src
│   │       │   ├── line
│   │       │   │   ├── index.ts
│   │       │   │   ├── openclaw.plugin.json
│   │       │   │   ├── package.json
│   │       │   │   └── src
│   │       │   ├── llm-task
│   │       │   │   ├── README.md
│   │       │   │   ├── index.ts
│   │       │   │   ├── openclaw.plugin.json
│   │       │   │   ├── package.json
│   │       │   │   └── src
│   │       │   ├── lobster
│   │       │   │   ├── README.md
│   │       │   │   ├── SKILL.md
│   │       │   │   ├── index.ts
│   │       │   │   ├── openclaw.plugin.json
│   │       │   │   ├── package.json
│   │       │   │   └── src
│   │       │   ├── matrix
│   │       │   │   ├── CHANGELOG.md
│   │       │   │   ├── index.ts
│   │       │   │   ├── openclaw.plugin.json
│   │       │   │   ├── package.json
│   │       │   │   └── src
│   │       │   ├── mattermost
│   │       │   │   ├── index.ts
│   │       │   │   ├── openclaw.plugin.json
│   │       │   │   ├── package.json
│   │       │   │   └── src
│   │       │   ├── memory-core
│   │       │   │   ├── index.ts
│   │       │   │   ├── openclaw.plugin.json
│   │       │   │   └── package.json
│   │       │   ├── memory-lancedb
│   │       │   │   ├── config.ts
│   │       │   │   ├── index.test.ts
│   │       │   │   ├── index.ts
│   │       │   │   ├── openclaw.plugin.json
│   │       │   │   └── package.json
│   │       │   ├── minimax-portal-auth
│   │       │   │   ├── README.md
│   │       │   │   ├── index.ts
│   │       │   │   ├── oauth.ts
│   │       │   │   ├── openclaw.plugin.json
│   │       │   │   └── package.json
│   │       │   ├── msteams
│   │       │   │   ├── CHANGELOG.md
│   │       │   │   ├── index.ts
│   │       │   │   ├── openclaw.plugin.json
│   │       │   │   ├── package.json
│   │       │   │   └── src
│   │       │   ├── nextcloud-talk
│   │       │   │   ├── index.ts
│   │       │   │   ├── openclaw.plugin.json
│   │       │   │   ├── package.json
│   │       │   │   └── src
│   │       │   ├── nostr
│   │       │   │   ├── CHANGELOG.md
│   │       │   │   ├── README.md
│   │       │   │   ├── index.ts
│   │       │   │   ├── openclaw.plugin.json
│   │       │   │   ├── package.json
│   │       │   │   ├── src
│   │       │   │   └── test
│   │       │   ├── open-prose
│   │       │   │   ├── README.md
│   │       │   │   ├── index.ts
│   │       │   │   ├── openclaw.plugin.json
│   │       │   │   ├── package.json
│   │       │   │   └── skills
│   │       │   ├── phone-control
│   │       │   │   ├── index.ts
│   │       │   │   └── openclaw.plugin.json
│   │       │   ├── qwen-portal-auth
│   │       │   │   ├── README.md
│   │       │   │   ├── index.ts
│   │       │   │   ├── oauth.ts
│   │       │   │   └── openclaw.plugin.json
│   │       │   ├── shared
│   │       │   │   └── resolve-target-test-helpers.ts
│   │       │   ├── signal
│   │       │   │   ├── index.ts
│   │       │   │   ├── openclaw.plugin.json
│   │       │   │   ├── package.json
│   │       │   │   └── src
│   │       │   ├── slack
│   │       │   │   ├── index.ts
│   │       │   │   ├── openclaw.plugin.json
│   │       │   │   ├── package.json
│   │       │   │   └── src
│   │       │   ├── synology-chat
│   │       │   │   ├── index.ts
│   │       │   │   ├── openclaw.plugin.json
│   │       │   │   ├── package.json
│   │       │   │   └── src
│   │       │   ├── talk-voice
│   │       │   │   ├── index.ts
│   │       │   │   └── openclaw.plugin.json
│   │       │   ├── telegram
│   │       │   │   ├── index.ts
│   │       │   │   ├── openclaw.plugin.json
│   │       │   │   ├── package.json
│   │       │   │   └── src
│   │       │   ├── test-utils
│   │       │   │   └── runtime-env.ts
│   │       │   ├── thread-ownership
│   │       │   │   ├── index.test.ts
│   │       │   │   ├── index.ts
│   │       │   │   └── openclaw.plugin.json
│   │       │   ├── tlon
│   │       │   │   ├── README.md
│   │       │   │   ├── index.ts
│   │       │   │   ├── openclaw.plugin.json
│   │       │   │   ├── package.json
│   │       │   │   └── src
│   │       │   ├── twitch
│   │       │   │   ├── CHANGELOG.md
│   │       │   │   ├── README.md
│   │       │   │   ├── index.ts
│   │       │   │   ├── openclaw.plugin.json
│   │       │   │   ├── package.json
│   │       │   │   ├── src
│   │       │   │   └── test
│   │       │   ├── voice-call
│   │       │   │   ├── CHANGELOG.md
│   │       │   │   ├── README.md
│   │       │   │   ├── index.ts
│   │       │   │   ├── openclaw.plugin.json
│   │       │   │   ├── package.json
│   │       │   │   └── src
│   │       │   ├── whatsapp
│   │       │   │   ├── index.ts
│   │       │   │   ├── openclaw.plugin.json
│   │       │   │   ├── package.json
│   │       │   │   └── src
│   │       │   ├── zalo
│   │       │   │   ├── CHANGELOG.md
│   │       │   │   ├── README.md
│   │       │   │   ├── index.ts
│   │       │   │   ├── openclaw.plugin.json
│   │       │   │   ├── package.json
│   │       │   │   └── src
│   │       │   └── zalouser
│   │       │       ├── CHANGELOG.md
│   │       │       ├── README.md
│   │       │       ├── index.ts
│   │       │       ├── openclaw.plugin.json
│   │       │       ├── package.json
│   │       │       └── src
│   │       ├── fly.private.toml
│   │       ├── fly.toml
│   │       ├── git-hooks
│   │       │   └── pre-commit
│   │       ├── openclaw.mjs
│   │       ├── openclaw.podman.env
│   │       ├── package.json
│   │       ├── packages
│   │       │   ├── clawdbot
│   │       │   │   ├── index.js
│   │       │   │   ├── package.json
│   │       │   │   └── scripts
│   │       │   └── moltbot
│   │       │       ├── index.js
│   │       │       ├── package.json
│   │       │       └── scripts
│   │       ├── patches
│   │       │   └── .gitkeep
│   │       ├── pnpm-workspace.yaml
│   │       ├── pyproject.toml
│   │       ├── render.yaml
│   │       ├── scripts
│   │       │   ├── auth-monitor.sh
│   │       │   ├── bench-model.ts
│   │       │   ├── build-and-run-mac.sh
│   │       │   ├── build-docs-list.mjs
│   │       │   ├── build_icon.sh
│   │       │   ├── bundle-a2ui.sh
│   │       │   ├── canvas-a2ui-copy.ts
│   │       │   ├── changelog-to-html.sh
│   │       │   ├── check-channel-agnostic-boundaries.mjs
│   │       │   ├── check-composite-action-input-interpolation.py
│   │       │   ├── check-no-random-messaging-tmp.mjs
│   │       │   ├── check-no-raw-window-open.mjs
│   │       │   ├── check-ts-max-loc.ts
│   │       │   ├── claude-auth-status.sh
│   │       │   ├── clawlog.sh
│   │       │   ├── clawtributors-map.json
│   │       │   ├── codesign-mac-app.sh
│   │       │   ├── codespell-dictionary.txt
│   │       │   ├── codespell-ignore.txt
│   │       │   ├── committer
│   │       │   ├── copy-export-html-templates.ts
│   │       │   ├── copy-hook-metadata.ts
│   │       │   ├── create-dmg.sh
│   │       │   ├── cron_usage_report.ts
│   │       │   ├── debug-claude-usage.ts
│   │       │   ├── dev
│   │       │   │   ├── discord-acp-plain-language-smoke.ts
│   │       │   │   ├── gateway-smoke.ts
│   │       │   │   ├── gateway-ws-client.ts
│   │       │   │   ├── ios-node-e2e.ts
│   │       │   │   ├── ios-pull-gateway-log.sh
│   │       │   │   └── test-device-pair-telegram.ts
│   │       │   ├── docker
│   │       │   │   ├── cleanup-smoke
│   │       │   │   ├── install-sh-e2e
│   │       │   │   ├── install-sh-nonroot
│   │       │   │   └── install-sh-smoke
│   │       │   ├── docs-i18n
│   │       │   │   ├── doc_mode.go
│   │       │   │   ├── glossary.go
│   │       │   │   ├── go.mod
│   │       │   │   ├── go.sum
│   │       │   │   ├── html_translate.go
│   │       │   │   ├── main.go
│   │       │   │   ├── markdown_segments.go
│   │       │   │   ├── masking.go
│   │       │   │   ├── order.go
│   │       │   │   ├── placeholders.go
│   │       │   │   ├── process.go
│   │       │   │   ├── prompt.go
│   │       │   │   ├── segment.go
│   │       │   │   ├── tm.go
│   │       │   │   ├── translator.go
│   │       │   │   └── util.go
│   │       │   ├── docs-link-audit.mjs
│   │       │   ├── docs-list.js
│   │       │   ├── docs-spellcheck.sh
│   │       │   ├── e2e
│   │       │   │   ├── Dockerfile
│   │       │   │   ├── Dockerfile.qr-import
│   │       │   │   ├── doctor-install-switch-docker.sh
│   │       │   │   ├── gateway-network-docker.sh
│   │       │   │   ├── onboard-docker.sh
│   │       │   │   ├── plugins-docker.sh
│   │       │   │   └── qr-import-docker.sh
│   │       │   ├── firecrawl-compare.ts
│   │       │   ├── ios-configure-signing.sh
│   │       │   ├── ios-team-id.sh
│   │       │   ├── label-open-issues.ts
│   │       │   ├── make_appcast.sh
│   │       │   ├── mobile-reauth.sh
│   │       │   ├── notarize-mac-artifact.sh
│   │       │   ├── package-mac-app.sh
│   │       │   ├── package-mac-dist.sh
│   │       │   ├── podman
│   │       │   │   └── openclaw.container.in
│   │       │   ├── pr
│   │       │   ├── pr-merge
│   │       │   ├── pr-prepare
│   │       │   ├── pr-review
│   │       │   ├── pre-commit
│   │       │   │   ├── filter-staged-files.mjs
│   │       │   │   └── run-node-tool.sh
│   │       │   ├── protocol-gen-swift.ts
│   │       │   ├── protocol-gen.ts
│   │       │   ├── readability-basic-compare.ts
│   │       │   ├── recover-orphaned-processes.sh
│   │       │   ├── release-check.ts
│   │       │   ├── repro
│   │       │   │   └── tsx-name-repro.ts
│   │       │   ├── restart-mac.sh
│   │       │   ├── run-node.d.mts
│   │       │   ├── run-node.mjs
│   │       │   ├── run-openclaw-podman.sh
│   │       │   ├── sandbox-browser-entrypoint.sh
│   │       │   ├── sandbox-browser-setup.sh
│   │       │   ├── sandbox-common-setup.sh
│   │       │   ├── sandbox-setup.sh
│   │       │   ├── setup-auth-system.sh
│   │       │   ├── shell-helpers
│   │       │   │   ├── README.md
│   │       │   │   └── clawdock-helpers.sh
│   │       │   ├── sqlite-vec-smoke.mjs
│   │       │   ├── sync-labels.ts
│   │       │   ├── sync-moonshot-docs.ts
│   │       │   ├── sync-plugin-versions.ts
│   │       │   ├── systemd
│   │       │   │   ├── openclaw-auth-monitor.service
│   │       │   │   └── openclaw-auth-monitor.timer
│   │       │   ├── termux-auth-widget.sh
│   │       │   ├── termux-quick-auth.sh
│   │       │   ├── termux-sync-widget.sh
│   │       │   ├── test-cleanup-docker.sh
│   │       │   ├── test-force.ts
│   │       │   ├── test-install-sh-docker.sh
│   │       │   ├── test-install-sh-e2e-docker.sh
│   │       │   ├── test-live-gateway-models-docker.sh
│   │       │   ├── test-live-models-docker.sh
│   │       │   ├── test-parallel.mjs
│   │       │   ├── test-shell-completion.ts
│   │       │   ├── ui.js
│   │       │   ├── update-clawtributors.ts
│   │       │   ├── update-clawtributors.types.ts
│   │       │   ├── vitest-slowest.mjs
│   │       │   ├── watch-node.d.mts
│   │       │   ├── watch-node.mjs
│   │       │   ├── write-build-info.ts
│   │       │   ├── write-cli-compat.ts
│   │       │   ├── write-plugin-sdk-entry-dts.ts
│   │       │   └── zai-fallback-repro.ts
│   │       ├── setup-podman.sh
│   │       ├── skills
│   │       │   ├── 1password
│   │       │   │   ├── SKILL.md
│   │       │   │   └── references
│   │       │   ├── apple-notes
│   │       │   │   └── SKILL.md
│   │       │   ├── apple-reminders
│   │       │   │   └── SKILL.md
│   │       │   ├── bear-notes
│   │       │   │   └── SKILL.md
│   │       │   ├── blogwatcher
│   │       │   │   └── SKILL.md
│   │       │   ├── blucli
│   │       │   │   └── SKILL.md
│   │       │   ├── bluebubbles
│   │       │   │   └── SKILL.md
│   │       │   ├── camsnap
│   │       │   │   └── SKILL.md
│   │       │   ├── canvas
│   │       │   │   └── SKILL.md
│   │       │   ├── clawhub
│   │       │   │   └── SKILL.md
│   │       │   ├── coding-agent
│   │       │   │   └── SKILL.md
│   │       │   ├── discord
│   │       │   │   └── SKILL.md
│   │       │   ├── eightctl
│   │       │   │   └── SKILL.md
│   │       │   ├── gemini
│   │       │   │   └── SKILL.md
│   │       │   ├── gh-issues
│   │       │   │   └── SKILL.md
│   │       │   ├── gifgrep
│   │       │   │   └── SKILL.md
│   │       │   ├── github
│   │       │   │   └── SKILL.md
│   │       │   ├── gog
│   │       │   │   └── SKILL.md
│   │       │   ├── goplaces
│   │       │   │   └── SKILL.md
│   │       │   ├── healthcheck
│   │       │   │   └── SKILL.md
│   │       │   ├── himalaya
│   │       │   │   ├── SKILL.md
│   │       │   │   └── references
│   │       │   ├── imsg
│   │       │   │   └── SKILL.md
│   │       │   ├── mcporter
│   │       │   │   └── SKILL.md
│   │       │   ├── model-usage
│   │       │   │   ├── SKILL.md
│   │       │   │   ├── references
│   │       │   │   └── scripts
│   │       │   ├── nano-banana-pro
│   │       │   │   ├── SKILL.md
│   │       │   │   └── scripts
│   │       │   ├── nano-pdf
│   │       │   │   └── SKILL.md
│   │       │   ├── notion
│   │       │   │   └── SKILL.md
│   │       │   ├── obsidian
│   │       │   │   └── SKILL.md
│   │       │   ├── openai-image-gen
│   │       │   │   ├── SKILL.md
│   │       │   │   └── scripts
│   │       │   ├── openai-whisper
│   │       │   │   └── SKILL.md
│   │       │   ├── openai-whisper-api
│   │       │   │   ├── SKILL.md
│   │       │   │   └── scripts
│   │       │   ├── openhue
│   │       │   │   └── SKILL.md
│   │       │   ├── oracle
│   │       │   │   └── SKILL.md
│   │       │   ├── ordercli
│   │       │   │   └── SKILL.md
│   │       │   ├── peekaboo
│   │       │   │   └── SKILL.md
│   │       │   ├── sag
│   │       │   │   └── SKILL.md
│   │       │   ├── session-logs
│   │       │   │   └── SKILL.md
│   │       │   ├── sherpa-onnx-tts
│   │       │   │   └── SKILL.md
│   │       │   ├── skill-creator
│   │       │   │   ├── SKILL.md
│   │       │   │   ├── license.txt
│   │       │   │   └── scripts
│   │       │   ├── slack
│   │       │   │   └── SKILL.md
│   │       │   ├── songsee
│   │       │   │   └── SKILL.md
│   │       │   ├── sonoscli
│   │       │   │   └── SKILL.md
│   │       │   ├── spotify-player
│   │       │   │   └── SKILL.md
│   │       │   ├── summarize
│   │       │   │   └── SKILL.md
│   │       │   ├── things-mac
│   │       │   │   └── SKILL.md
│   │       │   ├── tmux
│   │       │   │   ├── SKILL.md
│   │       │   │   └── scripts
│   │       │   ├── trello
│   │       │   │   └── SKILL.md
│   │       │   ├── video-frames
│   │       │   │   ├── SKILL.md
│   │       │   │   └── scripts
│   │       │   ├── voice-call
│   │       │   │   └── SKILL.md
│   │       │   ├── wacli
│   │       │   │   └── SKILL.md
│   │       │   ├── weather
│   │       │   │   └── SKILL.md
│   │       │   └── xurl
│   │       │       └── SKILL.md
│   │       ├── src
│   │       │   ├── acp
│   │       │   │   ├── client.test.ts
│   │       │   │   ├── client.ts
│   │       │   │   ├── commands.ts
│   │       │   │   ├── control-plane
│   │       │   │   ├── event-mapper.ts
│   │       │   │   ├── meta.ts
│   │       │   │   ├── policy.test.ts
│   │       │   │   ├── policy.ts
│   │       │   │   ├── runtime
│   │       │   │   ├── secret-file.ts
│   │       │   │   ├── server.startup.test.ts
│   │       │   │   ├── server.ts
│   │       │   │   ├── session-mapper.test.ts
│   │       │   │   ├── session-mapper.ts
│   │       │   │   ├── session.test.ts
│   │       │   │   ├── session.ts
│   │       │   │   ├── translator.prompt-prefix.test.ts
│   │       │   │   ├── translator.session-rate-limit.test.ts
│   │       │   │   ├── translator.test-helpers.ts
│   │       │   │   ├── translator.ts
│   │       │   │   └── types.ts
│   │       │   ├── agents
│   │       │   │   ├── acp-binding-architecture.guardrail.test.ts
│   │       │   │   ├── acp-spawn.test.ts
│   │       │   │   ├── acp-spawn.ts
│   │       │   │   ├── agent-paths.test.ts
│   │       │   │   ├── agent-paths.ts
│   │       │   │   ├── agent-scope.test.ts
│   │       │   │   ├── agent-scope.ts
│   │       │   │   ├── announce-idempotency.ts
│   │       │   │   ├── anthropic-payload-log.ts
│   │       │   │   ├── anthropic.setup-token.live.test.ts
│   │       │   │   ├── api-key-rotation.ts
│   │       │   │   ├── apply-patch-update.ts
│   │       │   │   ├── apply-patch.test.ts
│   │       │   │   ├── apply-patch.ts
│   │       │   │   ├── auth-health.test.ts
│   │       │   │   ├── auth-health.ts
│   │       │   │   ├── auth-profiles
│   │       │   │   ├── auth-profiles.chutes.test.ts
│   │       │   │   ├── auth-profiles.cooldown-auto-expiry.test.ts
│   │       │   │   ├── auth-profiles.ensureauthprofilestore.test.ts
│   │       │   │   ├── auth-profiles.getsoonestcooldownexpiry.test.ts
│   │       │   │   ├── auth-profiles.markauthprofilefailure.test.ts
│   │       │   │   ├── auth-profiles.resolve-auth-profile-order.does-not-prioritize-lastgood-round-robin-ordering.test.ts
│   │       │   │   ├── auth-profiles.resolve-auth-profile-order.fixtures.ts
│   │       │   │   ├── auth-profiles.resolve-auth-profile-order.normalizes-z-ai-aliases-auth-order.test.ts
│   │       │   │   ├── auth-profiles.resolve-auth-profile-order.orders-by-lastused-no-explicit-order-exists.test.ts
│   │       │   │   ├── auth-profiles.resolve-auth-profile-order.uses-stored-profiles-no-config-exists.test.ts
│   │       │   │   ├── auth-profiles.ts
│   │       │   │   ├── bash-process-registry.test-helpers.ts
│   │       │   │   ├── bash-process-registry.test.ts
│   │       │   │   ├── bash-process-registry.ts
│   │       │   │   ├── bash-tools.build-docker-exec-args.test.ts
│   │       │   │   ├── bash-tools.exec-approval-request.test.ts
│   │       │   │   ├── bash-tools.exec-approval-request.ts
│   │       │   │   ├── bash-tools.exec-host-gateway.ts
│   │       │   │   ├── bash-tools.exec-host-node.ts
│   │       │   │   ├── bash-tools.exec-runtime.ts
│   │       │   │   ├── bash-tools.exec-types.ts
│   │       │   │   ├── bash-tools.exec.approval-id.test.ts
│   │       │   │   ├── bash-tools.exec.background-abort.test.ts
│   │       │   │   ├── bash-tools.exec.path.test.ts
│   │       │   │   ├── bash-tools.exec.pty-cleanup.test.ts
│   │       │   │   ├── bash-tools.exec.pty-fallback-failure.test.ts
│   │       │   │   ├── bash-tools.exec.pty-fallback.test.ts
│   │       │   │   ├── bash-tools.exec.pty.test.ts
│   │       │   │   ├── bash-tools.exec.script-preflight.test.ts
│   │       │   │   ├── bash-tools.exec.ts
│   │       │   │   ├── bash-tools.process.poll-timeout.test.ts
│   │       │   │   ├── bash-tools.process.send-keys.test.ts
│   │       │   │   ├── bash-tools.process.supervisor.test.ts
│   │       │   │   ├── bash-tools.process.ts
│   │       │   │   ├── bash-tools.shared.ts
│   │       │   │   ├── bash-tools.test.ts
│   │       │   │   ├── bash-tools.ts
│   │       │   │   ├── bedrock-discovery.test.ts
│   │       │   │   ├── bedrock-discovery.ts
│   │       │   │   ├── bootstrap-cache.test.ts
│   │       │   │   ├── bootstrap-cache.ts
│   │       │   │   ├── bootstrap-files.test.ts
│   │       │   │   ├── bootstrap-files.ts
│   │       │   │   ├── bootstrap-hooks.test.ts
│   │       │   │   ├── bootstrap-hooks.ts
│   │       │   │   ├── byteplus-models.ts
│   │       │   │   ├── byteplus.live.test.ts
│   │       │   │   ├── cache-trace.test.ts
│   │       │   │   ├── cache-trace.ts
│   │       │   │   ├── channel-tools.test.ts
│   │       │   │   ├── channel-tools.ts
│   │       │   │   ├── chutes-oauth.flow.test.ts
│   │       │   │   ├── chutes-oauth.test.ts
│   │       │   │   ├── chutes-oauth.ts
│   │       │   │   ├── claude-cli-runner.test.ts
│   │       │   │   ├── claude-cli-runner.ts
│   │       │   │   ├── cli-backends.test.ts
│   │       │   │   ├── cli-backends.ts
│   │       │   │   ├── cli-credentials.test.ts
│   │       │   │   ├── cli-credentials.ts
│   │       │   │   ├── cli-runner
│   │       │   │   ├── cli-runner.test.ts
│   │       │   │   ├── cli-runner.ts
│   │       │   │   ├── cli-session.ts
│   │       │   │   ├── cli-watchdog-defaults.ts
│   │       │   │   ├── cloudflare-ai-gateway.ts
│   │       │   │   ├── command-poll-backoff.test.ts
│   │       │   │   ├── command-poll-backoff.ts
│   │       │   │   ├── compaction.retry.test.ts
│   │       │   │   ├── compaction.test.ts
│   │       │   │   ├── compaction.token-sanitize.test.ts
│   │       │   │   ├── compaction.tool-result-details.test.ts
│   │       │   │   ├── compaction.ts
│   │       │   │   ├── content-blocks.test.ts
│   │       │   │   ├── content-blocks.ts
│   │       │   │   ├── context-window-guard.test.ts
│   │       │   │   ├── context-window-guard.ts
│   │       │   │   ├── context.test.ts
│   │       │   │   ├── context.ts
│   │       │   │   ├── current-time.ts
│   │       │   │   ├── date-time.ts
│   │       │   │   ├── defaults.ts
│   │       │   │   ├── docs-path.ts
│   │       │   │   ├── doubao-models.ts
│   │       │   │   ├── failover-error.test.ts
│   │       │   │   ├── failover-error.ts
│   │       │   │   ├── glob-pattern.ts
│   │       │   │   ├── google-gemini-switch.live.test.ts
│   │       │   │   ├── huggingface-models.test.ts
│   │       │   │   ├── huggingface-models.ts
│   │       │   │   ├── identity-avatar.test.ts
│   │       │   │   ├── identity-avatar.ts
│   │       │   │   ├── identity-file.test.ts
│   │       │   │   ├── identity-file.ts
│   │       │   │   ├── identity.human-delay.test.ts
│   │       │   │   ├── identity.per-channel-prefix.test.ts
│   │       │   │   ├── identity.test.ts
│   │       │   │   ├── identity.ts
│   │       │   │   ├── image-sanitization.test.ts
│   │       │   │   ├── image-sanitization.ts
│   │       │   │   ├── lanes.ts
│   │       │   │   ├── live-auth-keys.ts
│   │       │   │   ├── live-model-filter.ts
│   │       │   │   ├── memory-search.test.ts
│   │       │   │   ├── memory-search.ts
│   │       │   │   ├── minimax-vlm.normalizes-api-key.test.ts
│   │       │   │   ├── minimax-vlm.ts
│   │       │   │   ├── minimax.live.test.ts
│   │       │   │   ├── model-alias-lines.ts
│   │       │   │   ├── model-auth-label.ts
│   │       │   │   ├── model-auth.profiles.test.ts
│   │       │   │   ├── model-auth.test.ts
│   │       │   │   ├── model-auth.ts
│   │       │   │   ├── model-catalog.test-harness.ts
│   │       │   │   ├── model-catalog.test.ts
│   │       │   │   ├── model-catalog.ts
│   │       │   │   ├── model-compat.test.ts
│   │       │   │   ├── model-compat.ts
│   │       │   │   ├── model-fallback.probe.test.ts
│   │       │   │   ├── model-fallback.test.ts
│   │       │   │   ├── model-fallback.ts
│   │       │   │   ├── model-forward-compat.ts
│   │       │   │   ├── model-scan.test.ts
│   │       │   │   ├── model-scan.ts
│   │       │   │   ├── model-selection.test.ts
│   │       │   │   ├── model-selection.ts
│   │       │   │   ├── models-config.auto-injects-github-copilot-provider-token-is.test.ts
│   │       │   │   ├── models-config.e2e-harness.ts
│   │       │   │   ├── models-config.falls-back-default-baseurl-token-exchange-fails.test.ts
│   │       │   │   ├── models-config.fills-missing-provider-apikey-from-env-var.test.ts
│   │       │   │   ├── models-config.normalizes-gemini-3-ids-preview-google-providers.test.ts
│   │       │   │   ├── models-config.preserves-explicit-reasoning-override.test.ts
│   │       │   │   ├── models-config.providers.kilocode.test.ts
│   │       │   │   ├── models-config.providers.kimi-coding.test.ts
│   │       │   │   ├── models-config.providers.nvidia.test.ts
│   │       │   │   ├── models-config.providers.ollama.test.ts
│   │       │   │   ├── models-config.providers.qianfan.test.ts
│   │       │   │   ├── models-config.providers.ts
│   │       │   │   ├── models-config.providers.volcengine-byteplus.test.ts
│   │       │   │   ├── models-config.skips-writing-models-json-no-env-token.test.ts
│   │       │   │   ├── models-config.test-utils.ts
│   │       │   │   ├── models-config.ts
│   │       │   │   ├── models-config.uses-first-github-copilot-profile-env-tokens.test.ts
│   │       │   │   ├── models.profiles.live.test.ts
│   │       │   │   ├── moonshot.live.test.ts
│   │       │   │   ├── ollama-stream.test.ts
│   │       │   │   ├── ollama-stream.ts
│   │       │   │   ├── openai-responses.reasoning-replay.test.ts
│   │       │   │   ├── openclaw-gateway-tool.test.ts
│   │       │   │   ├── openclaw-tools.agents.test.ts
│   │       │   │   ├── openclaw-tools.camera.test.ts
│   │       │   │   ├── openclaw-tools.session-status.test.ts
│   │       │   │   ├── openclaw-tools.sessions-visibility.test.ts
│   │       │   │   ├── openclaw-tools.sessions.test.ts
│   │       │   │   ├── openclaw-tools.subagents.sessions-spawn-applies-thinking-default.test.ts
│   │       │   │   ├── openclaw-tools.subagents.sessions-spawn-default-timeout-absent.test.ts
│   │       │   │   ├── openclaw-tools.subagents.sessions-spawn-default-timeout.test.ts
│   │       │   │   ├── openclaw-tools.subagents.sessions-spawn-depth-limits.test.ts
│   │       │   │   ├── openclaw-tools.subagents.sessions-spawn.allowlist.test.ts
│   │       │   │   ├── openclaw-tools.subagents.sessions-spawn.lifecycle.test.ts
│   │       │   │   ├── openclaw-tools.subagents.sessions-spawn.model.test.ts
│   │       │   │   ├── openclaw-tools.subagents.sessions-spawn.test-harness.ts
│   │       │   │   ├── openclaw-tools.subagents.steer-failure-clears-suppression.test.ts
│   │       │   │   ├── openclaw-tools.subagents.test-harness.ts
│   │       │   │   ├── openclaw-tools.ts
│   │       │   │   ├── opencode-zen-models.test.ts
│   │       │   │   ├── opencode-zen-models.ts
│   │       │   │   ├── owner-display.test.ts
│   │       │   │   ├── owner-display.ts
│   │       │   │   ├── pi-auth-json.test.ts
│   │       │   │   ├── pi-auth-json.ts
│   │       │   │   ├── pi-embedded-block-chunker.test.ts
│   │       │   │   ├── pi-embedded-block-chunker.ts
│   │       │   │   ├── pi-embedded-helpers
│   │       │   │   ├── pi-embedded-helpers.buildbootstrapcontextfiles.test.ts
│   │       │   │   ├── pi-embedded-helpers.formatassistanterrortext.test.ts
│   │       │   │   ├── pi-embedded-helpers.isbillingerrormessage.test.ts
│   │       │   │   ├── pi-embedded-helpers.sanitize-session-messages-images.removes-empty-assistant-text-blocks-but-preserves.test.ts
│   │       │   │   ├── pi-embedded-helpers.sanitizeuserfacingtext.test.ts
│   │       │   │   ├── pi-embedded-helpers.ts
│   │       │   │   ├── pi-embedded-helpers.validate-turns.test.ts
│   │       │   │   ├── pi-embedded-messaging.ts
│   │       │   │   ├── pi-embedded-payloads.ts
│   │       │   │   ├── pi-embedded-runner
│   │       │   │   ├── pi-embedded-runner-extraparams.live.test.ts
│   │       │   │   ├── pi-embedded-runner-extraparams.test.ts
│   │       │   │   ├── pi-embedded-runner.applygoogleturnorderingfix.test.ts
│   │       │   │   ├── pi-embedded-runner.buildembeddedsandboxinfo.test.ts
│   │       │   │   ├── pi-embedded-runner.compaction-safety-timeout.test.ts
│   │       │   │   ├── pi-embedded-runner.createsystempromptoverride.test.ts
│   │       │   │   ├── pi-embedded-runner.get-dm-history-limit-from-session-key.falls-back-provider-default-per-dm-not.test.ts
│   │       │   │   ├── pi-embedded-runner.get-dm-history-limit-from-session-key.returns-undefined-sessionkey-is-undefined.test.ts
│   │       │   │   ├── pi-embedded-runner.guard.test.ts
│   │       │   │   ├── pi-embedded-runner.guard.waitforidle-before-flush.test.ts
│   │       │   │   ├── pi-embedded-runner.history-limit-from-session-key.test.ts
│   │       │   │   ├── pi-embedded-runner.limithistoryturns.test.ts
│   │       │   │   ├── pi-embedded-runner.openai-tool-id-preservation.test.ts
│   │       │   │   ├── pi-embedded-runner.resolvesessionagentids.test.ts
│   │       │   │   ├── pi-embedded-runner.run-embedded-pi-agent.auth-profile-rotation.test.ts
│   │       │   │   ├── pi-embedded-runner.sanitize-session-history.policy.test.ts
│   │       │   │   ├── pi-embedded-runner.sanitize-session-history.test-harness.ts
│   │       │   │   ├── pi-embedded-runner.sanitize-session-history.test.ts
│   │       │   │   ├── pi-embedded-runner.splitsdktools.test.ts
│   │       │   │   ├── pi-embedded-runner.test.ts
│   │       │   │   ├── pi-embedded-runner.ts
│   │       │   │   ├── pi-embedded-subscribe.code-span-awareness.test.ts
│   │       │   │   ├── pi-embedded-subscribe.e2e-harness.ts
│   │       │   │   ├── pi-embedded-subscribe.handlers.compaction.ts
│   │       │   │   ├── pi-embedded-subscribe.handlers.lifecycle.test.ts
│   │       │   │   ├── pi-embedded-subscribe.handlers.lifecycle.ts
│   │       │   │   ├── pi-embedded-subscribe.handlers.messages.test.ts
│   │       │   │   ├── pi-embedded-subscribe.handlers.messages.ts
│   │       │   │   ├── pi-embedded-subscribe.handlers.tools.media.test.ts
│   │       │   │   ├── pi-embedded-subscribe.handlers.tools.test.ts
│   │       │   │   ├── pi-embedded-subscribe.handlers.tools.ts
│   │       │   │   ├── pi-embedded-subscribe.handlers.ts
│   │       │   │   ├── pi-embedded-subscribe.handlers.types.ts
│   │       │   │   ├── pi-embedded-subscribe.lifecycle-billing-error.test.ts
│   │       │   │   ├── pi-embedded-subscribe.raw-stream.ts
│   │       │   │   ├── pi-embedded-subscribe.reply-tags.test.ts
│   │       │   │   ├── pi-embedded-subscribe.subscribe-embedded-pi-session.calls-onblockreplyflush-before-tool-execution-start-preserve.test.ts
│   │       │   │   ├── pi-embedded-subscribe.subscribe-embedded-pi-session.does-not-append-text-end-content-is.test.ts
│   │       │   │   ├── pi-embedded-subscribe.subscribe-embedded-pi-session.does-not-call-onblockreplyflush-callback-is-not.test.ts
│   │       │   │   ├── pi-embedded-subscribe.subscribe-embedded-pi-session.does-not-duplicate-text-end-repeats-full.test.ts
│   │       │   │   ├── pi-embedded-subscribe.subscribe-embedded-pi-session.does-not-emit-duplicate-block-replies-text.test.ts
│   │       │   │   ├── pi-embedded-subscribe.subscribe-embedded-pi-session.emits-block-replies-text-end-does-not.test.ts
│   │       │   │   ├── pi-embedded-subscribe.subscribe-embedded-pi-session.emits-reasoning-as-separate-message-enabled.test.ts
│   │       │   │   ├── pi-embedded-subscribe.subscribe-embedded-pi-session.filters-final-suppresses-output-without-start-tag.test.ts
│   │       │   │   ├── pi-embedded-subscribe.subscribe-embedded-pi-session.includes-canvas-action-metadata-tool-summaries.test.ts
│   │       │   │   ├── pi-embedded-subscribe.subscribe-embedded-pi-session.keeps-assistanttexts-final-answer-block-replies-are.test.ts
│   │       │   │   ├── pi-embedded-subscribe.subscribe-embedded-pi-session.keeps-indented-fenced-blocks-intact.test.ts
│   │       │   │   ├── pi-embedded-subscribe.subscribe-embedded-pi-session.reopens-fenced-blocks-splitting-inside-them.test.ts
│   │       │   │   ├── pi-embedded-subscribe.subscribe-embedded-pi-session.splits-long-single-line-fenced-blocks-reopen.test.ts
│   │       │   │   ├── pi-embedded-subscribe.subscribe-embedded-pi-session.streams-soft-chunks-paragraph-preference.test.ts
│   │       │   │   ├── pi-embedded-subscribe.subscribe-embedded-pi-session.subscribeembeddedpisession.test.ts
│   │       │   │   ├── pi-embedded-subscribe.subscribe-embedded-pi-session.suppresses-message-end-block-replies-message-tool.test.ts
│   │       │   │   ├── pi-embedded-subscribe.subscribe-embedded-pi-session.waits-multiple-compaction-retries-before-resolving.test.ts
│   │       │   │   ├── pi-embedded-subscribe.tools.extract.test.ts
│   │       │   │   ├── pi-embedded-subscribe.tools.media.test.ts
│   │       │   │   ├── pi-embedded-subscribe.tools.test.ts
│   │       │   │   ├── pi-embedded-subscribe.tools.ts
│   │       │   │   ├── pi-embedded-subscribe.ts
│   │       │   │   ├── pi-embedded-subscribe.types.ts
│   │       │   │   ├── pi-embedded-utils.test.ts
│   │       │   │   ├── pi-embedded-utils.ts
│   │       │   │   ├── pi-embedded.ts
│   │       │   │   ├── pi-extensions
│   │       │   │   ├── pi-model-discovery.ts
│   │       │   │   ├── pi-settings.test.ts
│   │       │   │   ├── pi-settings.ts
│   │       │   │   ├── pi-tool-definition-adapter.after-tool-call.test.ts
│   │       │   │   ├── pi-tool-definition-adapter.test.ts
│   │       │   │   ├── pi-tool-definition-adapter.ts
│   │       │   │   ├── pi-tools-agent-config.test.ts
│   │       │   │   ├── pi-tools.abort.ts
│   │       │   │   ├── pi-tools.before-tool-call.integration.test.ts
│   │       │   │   ├── pi-tools.before-tool-call.test.ts
│   │       │   │   ├── pi-tools.before-tool-call.ts
│   │       │   │   ├── pi-tools.create-openclaw-coding-tools.adds-claude-style-aliases-schemas-without-dropping-b.test.ts
│   │       │   │   ├── pi-tools.create-openclaw-coding-tools.adds-claude-style-aliases-schemas-without-dropping-d.test.ts
│   │       │   │   ├── pi-tools.create-openclaw-coding-tools.adds-claude-style-aliases-schemas-without-dropping-f.test.ts
│   │       │   │   ├── pi-tools.create-openclaw-coding-tools.adds-claude-style-aliases-schemas-without-dropping.test.ts
│   │       │   │   ├── pi-tools.message-provider-policy.test.ts
│   │       │   │   ├── pi-tools.policy.test.ts
│   │       │   │   ├── pi-tools.policy.ts
│   │       │   │   ├── pi-tools.read.ts
│   │       │   │   ├── pi-tools.read.workspace-root-guard.test.ts
│   │       │   │   ├── pi-tools.safe-bins.test.ts
│   │       │   │   ├── pi-tools.sandbox-mounted-paths.workspace-only.test.ts
│   │       │   │   ├── pi-tools.schema.ts
│   │       │   │   ├── pi-tools.ts
│   │       │   │   ├── pi-tools.types.ts
│   │       │   │   ├── pi-tools.whatsapp-login-gating.test.ts
│   │       │   │   ├── pi-tools.workspace-paths.test.ts
│   │       │   │   ├── pty-dsr.ts
│   │       │   │   ├── pty-keys.test.ts
│   │       │   │   ├── pty-keys.ts
│   │       │   │   ├── queued-file-writer.ts
│   │       │   │   ├── sandbox
│   │       │   │   ├── sandbox-agent-config.agent-specific-sandbox-config.test.ts
│   │       │   │   ├── sandbox-create-args.test.ts
│   │       │   │   ├── sandbox-explain.test.ts
│   │       │   │   ├── sandbox-media-paths.ts
│   │       │   │   ├── sandbox-merge.test.ts
│   │       │   │   ├── sandbox-paths.test.ts
│   │       │   │   ├── sandbox-paths.ts
│   │       │   │   ├── sandbox-skills.test.ts
│   │       │   │   ├── sandbox-tool-policy.ts
│   │       │   │   ├── sandbox.resolveSandboxContext.test.ts
│   │       │   │   ├── sandbox.ts
│   │       │   │   ├── sanitize-for-prompt.test.ts
│   │       │   │   ├── sanitize-for-prompt.ts
│   │       │   │   ├── schema
│   │       │   │   ├── session-dirs.ts
│   │       │   │   ├── session-file-repair.test.ts
│   │       │   │   ├── session-file-repair.ts
│   │       │   │   ├── session-slug.test.ts
│   │       │   │   ├── session-slug.ts
│   │       │   │   ├── session-tool-result-guard-wrapper.ts
│   │       │   │   ├── session-tool-result-guard.test.ts
│   │       │   │   ├── session-tool-result-guard.tool-result-persist-hook.test.ts
│   │       │   │   ├── session-tool-result-guard.ts
│   │       │   │   ├── session-transcript-repair.test.ts
│   │       │   │   ├── session-transcript-repair.ts
│   │       │   │   ├── session-write-lock.test.ts
│   │       │   │   ├── session-write-lock.ts
│   │       │   │   ├── sessions-spawn-hooks.test.ts
│   │       │   │   ├── sessions-spawn-threadid.test.ts
│   │       │   │   ├── shell-utils.test.ts
│   │       │   │   ├── shell-utils.ts
│   │       │   │   ├── skills
│   │       │   │   ├── skills-install-download.ts
│   │       │   │   ├── skills-install-fallback.test.ts
│   │       │   │   ├── skills-install-output.ts
│   │       │   │   ├── skills-install.download-test-utils.ts
│   │       │   │   ├── skills-install.download.test.ts
│   │       │   │   ├── skills-install.test-mocks.ts
│   │       │   │   ├── skills-install.test.ts
│   │       │   │   ├── skills-install.ts
│   │       │   │   ├── skills-status.test.ts
│   │       │   │   ├── skills-status.ts
│   │       │   │   ├── skills.agents-skills-directory.test.ts
│   │       │   │   ├── skills.build-workspace-skills-prompt.applies-bundled-allowlist-without-affecting-workspace-skills.test.ts
│   │       │   │   ├── skills.build-workspace-skills-prompt.prefers-workspace-skills-managed-skills.test.ts
│   │       │   │   ├── skills.build-workspace-skills-prompt.syncs-merged-skills-into-target-workspace.test.ts
│   │       │   │   ├── skills.buildworkspaceskillsnapshot.test.ts
│   │       │   │   ├── skills.buildworkspaceskillstatus.test.ts
│   │       │   │   ├── skills.compact-skill-paths.test.ts
│   │       │   │   ├── skills.e2e-test-helpers.test.ts
│   │       │   │   ├── skills.e2e-test-helpers.ts
│   │       │   │   ├── skills.loadworkspaceskillentries.test.ts
│   │       │   │   ├── skills.resolveskillspromptforrun.test.ts
│   │       │   │   ├── skills.summarize-skill-description.test.ts
│   │       │   │   ├── skills.test-helpers.ts
│   │       │   │   ├── skills.test.ts
│   │       │   │   ├── skills.ts
│   │       │   │   ├── stable-stringify.ts
│   │       │   │   ├── subagent-announce-dispatch.test.ts
│   │       │   │   ├── subagent-announce-dispatch.ts
│   │       │   │   ├── subagent-announce-queue.test.ts
│   │       │   │   ├── subagent-announce-queue.ts
│   │       │   │   ├── subagent-announce.format.test.ts
│   │       │   │   ├── subagent-announce.timeout.test.ts
│   │       │   │   ├── subagent-announce.ts
│   │       │   │   ├── subagent-depth.test.ts
│   │       │   │   ├── subagent-depth.ts
│   │       │   │   ├── subagent-lifecycle-events.ts
│   │       │   │   ├── subagent-registry-cleanup.ts
│   │       │   │   ├── subagent-registry-completion.test.ts
│   │       │   │   ├── subagent-registry-completion.ts
│   │       │   │   ├── subagent-registry-queries.ts
│   │       │   │   ├── subagent-registry-state.ts
│   │       │   │   ├── subagent-registry.announce-loop-guard.test.ts
│   │       │   │   ├── subagent-registry.archive.test.ts
│   │       │   │   ├── subagent-registry.lifecycle-retry-grace.test.ts
│   │       │   │   ├── subagent-registry.mocks.shared.ts
│   │       │   │   ├── subagent-registry.nested.test.ts
│   │       │   │   ├── subagent-registry.persistence.test.ts
│   │       │   │   ├── subagent-registry.steer-restart.test.ts
│   │       │   │   ├── subagent-registry.store.ts
│   │       │   │   ├── subagent-registry.ts
│   │       │   │   ├── subagent-registry.types.ts
│   │       │   │   ├── subagent-spawn.ts
│   │       │   │   ├── synthetic-models.ts
│   │       │   │   ├── system-prompt-params.test.ts
│   │       │   │   ├── system-prompt-params.ts
│   │       │   │   ├── system-prompt-report.test.ts
│   │       │   │   ├── system-prompt-report.ts
│   │       │   │   ├── system-prompt-stability.test.ts
│   │       │   │   ├── system-prompt.test.ts
│   │       │   │   ├── system-prompt.ts
│   │       │   │   ├── test-helpers
│   │       │   │   ├── timeout.ts
│   │       │   │   ├── together-models.ts
│   │       │   │   ├── tool-call-id.test.ts
│   │       │   │   ├── tool-call-id.ts
│   │       │   │   ├── tool-catalog.ts
│   │       │   │   ├── tool-display-common.ts
│   │       │   │   ├── tool-display.json
│   │       │   │   ├── tool-display.test.ts
│   │       │   │   ├── tool-display.ts
│   │       │   │   ├── tool-fs-policy.test.ts
│   │       │   │   ├── tool-fs-policy.ts
│   │       │   │   ├── tool-images.log.test.ts
│   │       │   │   ├── tool-images.test.ts
│   │       │   │   ├── tool-images.ts
│   │       │   │   ├── tool-loop-detection.test.ts
│   │       │   │   ├── tool-loop-detection.ts
│   │       │   │   ├── tool-mutation.test.ts
│   │       │   │   ├── tool-mutation.ts
│   │       │   │   ├── tool-policy-pipeline.test.ts
│   │       │   │   ├── tool-policy-pipeline.ts
│   │       │   │   ├── tool-policy-shared.ts
│   │       │   │   ├── tool-policy.conformance.ts
│   │       │   │   ├── tool-policy.plugin-only-allowlist.test.ts
│   │       │   │   ├── tool-policy.test.ts
│   │       │   │   ├── tool-policy.ts
│   │       │   │   ├── tool-summaries.ts
│   │       │   │   ├── tools
│   │       │   │   ├── transcript-policy.policy.test.ts
│   │       │   │   ├── transcript-policy.test.ts
│   │       │   │   ├── transcript-policy.ts
│   │       │   │   ├── usage.normalization.test.ts
│   │       │   │   ├── usage.test.ts
│   │       │   │   ├── usage.ts
│   │       │   │   ├── venice-models.ts
│   │       │   │   ├── volc-models.shared.ts
│   │       │   │   ├── workspace-dir.ts
│   │       │   │   ├── workspace-dirs.ts
│   │       │   │   ├── workspace-run.test.ts
│   │       │   │   ├── workspace-run.ts
│   │       │   │   ├── workspace-templates.test.ts
│   │       │   │   ├── workspace-templates.ts
│   │       │   │   ├── workspace.bootstrap-cache.test.ts
│   │       │   │   ├── workspace.defaults.test.ts
│   │       │   │   ├── workspace.load-extra-bootstrap-files.test.ts
│   │       │   │   ├── workspace.test.ts
│   │       │   │   ├── workspace.ts
│   │       │   │   └── zai.live.test.ts
│   │       │   ├── auto-reply
│   │       │   │   ├── chunk.test.ts
│   │       │   │   ├── chunk.ts
│   │       │   │   ├── command-auth.ts
│   │       │   │   ├── command-control.test.ts
│   │       │   │   ├── command-detection.ts
│   │       │   │   ├── commands-args.test.ts
│   │       │   │   ├── commands-args.ts
│   │       │   │   ├── commands-registry.data.ts
│   │       │   │   ├── commands-registry.test.ts
│   │       │   │   ├── commands-registry.ts
│   │       │   │   ├── commands-registry.types.ts
│   │       │   │   ├── dispatch.test.ts
│   │       │   │   ├── dispatch.ts
│   │       │   │   ├── envelope.test.ts
│   │       │   │   ├── envelope.ts
│   │       │   │   ├── fallback-state.test.ts
│   │       │   │   ├── fallback-state.ts
│   │       │   │   ├── group-activation.ts
│   │       │   │   ├── heartbeat-reply-payload.ts
│   │       │   │   ├── heartbeat.test.ts
│   │       │   │   ├── heartbeat.ts
│   │       │   │   ├── inbound-debounce.ts
│   │       │   │   ├── inbound.test.ts
│   │       │   │   ├── media-note.test.ts
│   │       │   │   ├── media-note.ts
│   │       │   │   ├── media-understanding.test-fixtures.ts
│   │       │   │   ├── model-runtime.ts
│   │       │   │   ├── model.test.ts
│   │       │   │   ├── model.ts
│   │       │   │   ├── reply
│   │       │   │   ├── reply.block-streaming.test.ts
│   │       │   │   ├── reply.directive.directive-behavior.applies-inline-reasoning-mixed-messages-acks-immediately.test.ts
│   │       │   │   ├── reply.directive.directive-behavior.defaults-think-low-reasoning-capable-models-no.test.ts
│   │       │   │   ├── reply.directive.directive-behavior.e2e-harness.ts
│   │       │   │   ├── reply.directive.directive-behavior.e2e-mocks.ts
│   │       │   │   ├── reply.directive.directive-behavior.model-directive-test-utils.ts
│   │       │   │   ├── reply.directive.directive-behavior.prefers-alias-matches-fuzzy-selection-is-ambiguous.test.ts
│   │       │   │   ├── reply.directive.directive-behavior.shows-current-verbose-level-verbose-has-no.test.ts
│   │       │   │   ├── reply.directive.parse.test.ts
│   │       │   │   ├── reply.heartbeat-typing.test.ts
│   │       │   │   ├── reply.media-note.test.ts
│   │       │   │   ├── reply.raw-body.test.ts
│   │       │   │   ├── reply.test-harness.ts
│   │       │   │   ├── reply.triggers.group-intro-prompts.cases.ts
│   │       │   │   ├── reply.triggers.trigger-handling.filters-usage-summary-current-model-provider.cases.ts
│   │       │   │   ├── reply.triggers.trigger-handling.stages-inbound-media-into-sandbox-workspace.test.ts
│   │       │   │   ├── reply.triggers.trigger-handling.targets-active-session-native-stop.test.ts
│   │       │   │   ├── reply.triggers.trigger-handling.test-harness.ts
│   │       │   │   ├── reply.ts
│   │       │   │   ├── send-policy.ts
│   │       │   │   ├── skill-commands.test.ts
│   │       │   │   ├── skill-commands.ts
│   │       │   │   ├── stage-sandbox-media.test-harness.ts
│   │       │   │   ├── status.test.ts
│   │       │   │   ├── status.ts
│   │       │   │   ├── templating.ts
│   │       │   │   ├── thinking.test.ts
│   │       │   │   ├── thinking.ts
│   │       │   │   ├── tokens.ts
│   │       │   │   ├── tool-meta.test.ts
│   │       │   │   ├── tool-meta.ts
│   │       │   │   └── types.ts
│   │       │   ├── browser
│   │       │   │   ├── bridge-auth-registry.ts
│   │       │   │   ├── bridge-server.auth.test.ts
│   │       │   │   ├── bridge-server.ts
│   │       │   │   ├── browser-utils.test.ts
│   │       │   │   ├── cdp.helpers.ts
│   │       │   │   ├── cdp.test.ts
│   │       │   │   ├── cdp.ts
│   │       │   │   ├── chrome-extension-background-utils.test.ts
│   │       │   │   ├── chrome-extension-manifest.test.ts
│   │       │   │   ├── chrome-extension-options-validation.test.ts
│   │       │   │   ├── chrome-user-data-dir.test-harness.ts
│   │       │   │   ├── chrome.default-browser.test.ts
│   │       │   │   ├── chrome.executables.ts
│   │       │   │   ├── chrome.profile-decoration.ts
│   │       │   │   ├── chrome.test.ts
│   │       │   │   ├── chrome.ts
│   │       │   │   ├── client-actions-core.ts
│   │       │   │   ├── client-actions-observe.ts
│   │       │   │   ├── client-actions-state.ts
│   │       │   │   ├── client-actions-types.ts
│   │       │   │   ├── client-actions-url.ts
│   │       │   │   ├── client-actions.ts
│   │       │   │   ├── client-fetch.loopback-auth.test.ts
│   │       │   │   ├── client-fetch.ts
│   │       │   │   ├── client.test.ts
│   │       │   │   ├── client.ts
│   │       │   │   ├── config.test.ts
│   │       │   │   ├── config.ts
│   │       │   │   ├── constants.ts
│   │       │   │   ├── control-auth.auto-token.test.ts
│   │       │   │   ├── control-auth.test.ts
│   │       │   │   ├── control-auth.ts
│   │       │   │   ├── control-service.ts
│   │       │   │   ├── csrf.ts
│   │       │   │   ├── extension-relay-auth.test.ts
│   │       │   │   ├── extension-relay-auth.ts
│   │       │   │   ├── extension-relay.test.ts
│   │       │   │   ├── extension-relay.ts
│   │       │   │   ├── http-auth.ts
│   │       │   │   ├── navigation-guard.test.ts
│   │       │   │   ├── navigation-guard.ts
│   │       │   │   ├── paths.test.ts
│   │       │   │   ├── paths.ts
│   │       │   │   ├── profiles-service.test.ts
│   │       │   │   ├── profiles-service.ts
│   │       │   │   ├── profiles.test.ts
│   │       │   │   ├── profiles.ts
│   │       │   │   ├── proxy-files.ts
│   │       │   │   ├── pw-ai-module.ts
│   │       │   │   ├── pw-ai-state.ts
│   │       │   │   ├── pw-ai.test.ts
│   │       │   │   ├── pw-ai.ts
│   │       │   │   ├── pw-role-snapshot.test.ts
│   │       │   │   ├── pw-role-snapshot.ts
│   │       │   │   ├── pw-session.browserless.live.test.ts
│   │       │   │   ├── pw-session.create-page.navigation-guard.test.ts
│   │       │   │   ├── pw-session.get-page-for-targetid.extension-fallback.test.ts
│   │       │   │   ├── pw-session.mock-setup.ts
│   │       │   │   ├── pw-session.test.ts
│   │       │   │   ├── pw-session.ts
│   │       │   │   ├── pw-tools-core.activity.ts
│   │       │   │   ├── pw-tools-core.clamps-timeoutms-scrollintoview.test.ts
│   │       │   │   ├── pw-tools-core.downloads.ts
│   │       │   │   ├── pw-tools-core.interactions.evaluate.abort.test.ts
│   │       │   │   ├── pw-tools-core.interactions.set-input-files.test.ts
│   │       │   │   ├── pw-tools-core.interactions.ts
│   │       │   │   ├── pw-tools-core.last-file-chooser-arm-wins.test.ts
│   │       │   │   ├── pw-tools-core.responses.ts
│   │       │   │   ├── pw-tools-core.screenshots-element-selector.test.ts
│   │       │   │   ├── pw-tools-core.shared.ts
│   │       │   │   ├── pw-tools-core.snapshot.navigate-guard.test.ts
│   │       │   │   ├── pw-tools-core.snapshot.ts
│   │       │   │   ├── pw-tools-core.state.ts
│   │       │   │   ├── pw-tools-core.storage.ts
│   │       │   │   ├── pw-tools-core.test-harness.ts
│   │       │   │   ├── pw-tools-core.trace.ts
│   │       │   │   ├── pw-tools-core.ts
│   │       │   │   ├── pw-tools-core.waits-next-download-saves-it.test.ts
│   │       │   │   ├── resolved-config-refresh.ts
│   │       │   │   ├── routes
│   │       │   │   ├── screenshot.test.ts
│   │       │   │   ├── screenshot.ts
│   │       │   │   ├── server-context.chrome-test-harness.ts
│   │       │   │   ├── server-context.ensure-tab-available.prefers-last-target.test.ts
│   │       │   │   ├── server-context.hot-reload-profiles.test.ts
│   │       │   │   ├── server-context.remote-tab-ops.test.ts
│   │       │   │   ├── server-context.ts
│   │       │   │   ├── server-context.types.ts
│   │       │   │   ├── server-lifecycle.test.ts
│   │       │   │   ├── server-lifecycle.ts
│   │       │   │   ├── server-middleware.ts
│   │       │   │   ├── server.agent-contract-form-layout-act-commands.test.ts
│   │       │   │   ├── server.agent-contract-snapshot-endpoints.test.ts
│   │       │   │   ├── server.agent-contract.test-harness.ts
│   │       │   │   ├── server.auth-token-gates-http.test.ts
│   │       │   │   ├── server.control-server.test-harness.ts
│   │       │   │   ├── server.evaluate-disabled-does-not-block-storage.test.ts
│   │       │   │   ├── server.post-tabs-open-profile-unknown-returns-404.test.ts
│   │       │   │   ├── server.ts
│   │       │   │   ├── target-id.ts
│   │       │   │   ├── test-port.ts
│   │       │   │   └── trash.ts
│   │       │   ├── canvas-host
│   │       │   │   ├── a2ui
│   │       │   │   ├── a2ui.ts
│   │       │   │   ├── file-resolver.ts
│   │       │   │   ├── server.state-dir.test.ts
│   │       │   │   ├── server.test.ts
│   │       │   │   └── server.ts
│   │       │   ├── channel-web.ts
│   │       │   ├── channels
│   │       │   │   ├── account-summary.ts
│   │       │   │   ├── ack-reactions.test.ts
│   │       │   │   ├── ack-reactions.ts
│   │       │   │   ├── allow-from.test.ts
│   │       │   │   ├── allow-from.ts
│   │       │   │   ├── allowlist-match.ts
│   │       │   │   ├── allowlists
│   │       │   │   ├── channel-config.test.ts
│   │       │   │   ├── channel-config.ts
│   │       │   │   ├── channels-misc.test.ts
│   │       │   │   ├── chat-type.ts
│   │       │   │   ├── command-gating.test.ts
│   │       │   │   ├── command-gating.ts
│   │       │   │   ├── conversation-label.test.ts
│   │       │   │   ├── conversation-label.ts
│   │       │   │   ├── dock.test.ts
│   │       │   │   ├── dock.ts
│   │       │   │   ├── draft-stream-controls.test.ts
│   │       │   │   ├── draft-stream-controls.ts
│   │       │   │   ├── draft-stream-loop.ts
│   │       │   │   ├── location.test.ts
│   │       │   │   ├── location.ts
│   │       │   │   ├── logging.ts
│   │       │   │   ├── mention-gating.test.ts
│   │       │   │   ├── mention-gating.ts
│   │       │   │   ├── model-overrides.test.ts
│   │       │   │   ├── model-overrides.ts
│   │       │   │   ├── plugins
│   │       │   │   ├── registry.helpers.test.ts
│   │       │   │   ├── registry.ts
│   │       │   │   ├── reply-prefix.ts
│   │       │   │   ├── sender-identity.ts
│   │       │   │   ├── sender-label.test.ts
│   │       │   │   ├── sender-label.ts
│   │       │   │   ├── session.test.ts
│   │       │   │   ├── session.ts
│   │       │   │   ├── status-reactions.test.ts
│   │       │   │   ├── status-reactions.ts
│   │       │   │   ├── targets.test.ts
│   │       │   │   ├── targets.ts
│   │       │   │   ├── telegram
│   │       │   │   ├── thread-bindings-messages.ts
│   │       │   │   ├── thread-bindings-policy.ts
│   │       │   │   ├── typing-lifecycle.ts
│   │       │   │   ├── typing.test.ts
│   │       │   │   ├── typing.ts
│   │       │   │   └── web
│   │       │   ├── cli
│   │       │   │   ├── acp-cli.option-collisions.test.ts
│   │       │   │   ├── acp-cli.ts
│   │       │   │   ├── argv.test.ts
│   │       │   │   ├── argv.ts
│   │       │   │   ├── banner.ts
│   │       │   │   ├── browser-cli-actions-input
│   │       │   │   ├── browser-cli-actions-input.ts
│   │       │   │   ├── browser-cli-actions-observe.ts
│   │       │   │   ├── browser-cli-debug.ts
│   │       │   │   ├── browser-cli-examples.ts
│   │       │   │   ├── browser-cli-extension.test.ts
│   │       │   │   ├── browser-cli-extension.ts
│   │       │   │   ├── browser-cli-inspect.test.ts
│   │       │   │   ├── browser-cli-inspect.ts
│   │       │   │   ├── browser-cli-manage.ts
│   │       │   │   ├── browser-cli-resize.ts
│   │       │   │   ├── browser-cli-shared.ts
│   │       │   │   ├── browser-cli-state.cookies-storage.ts
│   │       │   │   ├── browser-cli-state.option-collisions.test.ts
│   │       │   │   ├── browser-cli-state.ts
│   │       │   │   ├── browser-cli.test.ts
│   │       │   │   ├── browser-cli.ts
│   │       │   │   ├── channel-auth.test.ts
│   │       │   │   ├── channel-auth.ts
│   │       │   │   ├── channel-options.ts
│   │       │   │   ├── channels-cli.ts
│   │       │   │   ├── clawbot-cli.ts
│   │       │   │   ├── cli-name.ts
│   │       │   │   ├── cli-utils.test.ts
│   │       │   │   ├── cli-utils.ts
│   │       │   │   ├── command-format.ts
│   │       │   │   ├── command-options.test.ts
│   │       │   │   ├── command-options.ts
│   │       │   │   ├── completion-cli.ts
│   │       │   │   ├── completion-fish.test.ts
│   │       │   │   ├── completion-fish.ts
│   │       │   │   ├── config-cli.test.ts
│   │       │   │   ├── config-cli.ts
│   │       │   │   ├── cron-cli
│   │       │   │   ├── cron-cli.test.ts
│   │       │   │   ├── cron-cli.ts
│   │       │   │   ├── daemon-cli
│   │       │   │   ├── daemon-cli-compat.test.ts
│   │       │   │   ├── daemon-cli-compat.ts
│   │       │   │   ├── daemon-cli.coverage.test.ts
│   │       │   │   ├── daemon-cli.ts
│   │       │   │   ├── deps.test.ts
│   │       │   │   ├── deps.ts
│   │       │   │   ├── devices-cli.test.ts
│   │       │   │   ├── devices-cli.ts
│   │       │   │   ├── directory-cli.ts
│   │       │   │   ├── dns-cli.ts
│   │       │   │   ├── docs-cli.ts
│   │       │   │   ├── exec-approvals-cli.test.ts
│   │       │   │   ├── exec-approvals-cli.ts
│   │       │   │   ├── gateway-cli
│   │       │   │   ├── gateway-cli.coverage.test.ts
│   │       │   │   ├── gateway-cli.ts
│   │       │   │   ├── gateway-rpc.ts
│   │       │   │   ├── gateway.sigterm.test.ts
│   │       │   │   ├── help-format.ts
│   │       │   │   ├── hooks-cli.test.ts
│   │       │   │   ├── hooks-cli.ts
│   │       │   │   ├── log-level-option.test.ts
│   │       │   │   ├── log-level-option.ts
│   │       │   │   ├── logs-cli.test.ts
│   │       │   │   ├── logs-cli.ts
│   │       │   │   ├── memory-cli.test.ts
│   │       │   │   ├── memory-cli.ts
│   │       │   │   ├── models-cli.test.ts
│   │       │   │   ├── models-cli.ts
│   │       │   │   ├── node-cli
│   │       │   │   ├── node-cli.ts
│   │       │   │   ├── nodes-camera.test.ts
│   │       │   │   ├── nodes-camera.ts
│   │       │   │   ├── nodes-canvas.ts
│   │       │   │   ├── nodes-cli
│   │       │   │   ├── nodes-cli.coverage.test.ts
│   │       │   │   ├── nodes-cli.ts
│   │       │   │   ├── nodes-media-utils.test.ts
│   │       │   │   ├── nodes-media-utils.ts
│   │       │   │   ├── nodes-run.ts
│   │       │   │   ├── nodes-screen.ts
│   │       │   │   ├── npm-resolution.test.ts
│   │       │   │   ├── npm-resolution.ts
│   │       │   │   ├── outbound-send-deps.ts
│   │       │   │   ├── outbound-send-mapping.test.ts
│   │       │   │   ├── outbound-send-mapping.ts
│   │       │   │   ├── pairing-cli.test.ts
│   │       │   │   ├── pairing-cli.ts
│   │       │   │   ├── parse-bytes.ts
│   │       │   │   ├── parse-duration.ts
│   │       │   │   ├── parse-timeout.ts
│   │       │   │   ├── plugin-registry.ts
│   │       │   │   ├── plugins-cli.ts
│   │       │   │   ├── plugins-config.test.ts
│   │       │   │   ├── plugins-config.ts
│   │       │   │   ├── ports.ts
│   │       │   │   ├── profile-utils.ts
│   │       │   │   ├── profile.test.ts
│   │       │   │   ├── profile.ts
│   │       │   │   ├── program
│   │       │   │   ├── program.force.test.ts
│   │       │   │   ├── program.nodes-basic.test.ts
│   │       │   │   ├── program.nodes-media.test.ts
│   │       │   │   ├── program.nodes-test-helpers.test.ts
│   │       │   │   ├── program.nodes-test-helpers.ts
│   │       │   │   ├── program.smoke.test.ts
│   │       │   │   ├── program.test-mocks.ts
│   │       │   │   ├── program.ts
│   │       │   │   ├── progress.test.ts
│   │       │   │   ├── progress.ts
│   │       │   │   ├── prompt.test.ts
│   │       │   │   ├── prompt.ts
│   │       │   │   ├── qr-cli.test.ts
│   │       │   │   ├── qr-cli.ts
│   │       │   │   ├── requirements-test-fixtures.ts
│   │       │   │   ├── respawn-policy.ts
│   │       │   │   ├── route.ts
│   │       │   │   ├── run-main.exit.test.ts
│   │       │   │   ├── run-main.test.ts
│   │       │   │   ├── run-main.ts
│   │       │   │   ├── sandbox-cli.ts
│   │       │   │   ├── security-cli.ts
│   │       │   │   ├── shared
│   │       │   │   ├── skills-cli.commands.test.ts
│   │       │   │   ├── skills-cli.format.ts
│   │       │   │   ├── skills-cli.formatting.test.ts
│   │       │   │   ├── skills-cli.test.ts
│   │       │   │   ├── skills-cli.ts
│   │       │   │   ├── system-cli.test.ts
│   │       │   │   ├── system-cli.ts
│   │       │   │   ├── tagline.ts
│   │       │   │   ├── test-runtime-capture.ts
│   │       │   │   ├── tui-cli.ts
│   │       │   │   ├── update-cli
│   │       │   │   ├── update-cli.option-collisions.test.ts
│   │       │   │   ├── update-cli.test.ts
│   │       │   │   ├── update-cli.ts
│   │       │   │   ├── wait.ts
│   │       │   │   ├── webhooks-cli.ts
│   │       │   │   └── windows-argv.ts
│   │       │   ├── commands
│   │       │   │   ├── agent
│   │       │   │   ├── agent-via-gateway.test.ts
│   │       │   │   ├── agent-via-gateway.ts
│   │       │   │   ├── agent.acp.test.ts
│   │       │   │   ├── agent.delivery.test.ts
│   │       │   │   ├── agent.test.ts
│   │       │   │   ├── agent.ts
│   │       │   │   ├── agents.add.test.ts
│   │       │   │   ├── agents.bind.commands.test.ts
│   │       │   │   ├── agents.bindings.ts
│   │       │   │   ├── agents.command-shared.ts
│   │       │   │   ├── agents.commands.add.ts
│   │       │   │   ├── agents.commands.bind.ts
│   │       │   │   ├── agents.commands.delete.ts
│   │       │   │   ├── agents.commands.identity.ts
│   │       │   │   ├── agents.commands.list.ts
│   │       │   │   ├── agents.config.ts
│   │       │   │   ├── agents.identity.test.ts
│   │       │   │   ├── agents.providers.ts
│   │       │   │   ├── agents.test.ts
│   │       │   │   ├── agents.ts
│   │       │   │   ├── auth-choice-legacy.ts
│   │       │   │   ├── auth-choice-options.test.ts
│   │       │   │   ├── auth-choice-options.ts
│   │       │   │   ├── auth-choice-prompt.ts
│   │       │   │   ├── auth-choice.api-key.ts
│   │       │   │   ├── auth-choice.apply-helpers.test.ts
│   │       │   │   ├── auth-choice.apply-helpers.ts
│   │       │   │   ├── auth-choice.apply.anthropic.ts
│   │       │   │   ├── auth-choice.apply.api-providers.ts
│   │       │   │   ├── auth-choice.apply.byteplus.ts
│   │       │   │   ├── auth-choice.apply.copilot-proxy.ts
│   │       │   │   ├── auth-choice.apply.github-copilot.ts
│   │       │   │   ├── auth-choice.apply.google-gemini-cli.ts
│   │       │   │   ├── auth-choice.apply.huggingface.test.ts
│   │       │   │   ├── auth-choice.apply.huggingface.ts
│   │       │   │   ├── auth-choice.apply.minimax.test.ts
│   │       │   │   ├── auth-choice.apply.minimax.ts
│   │       │   │   ├── auth-choice.apply.oauth.ts
│   │       │   │   ├── auth-choice.apply.openai.ts
│   │       │   │   ├── auth-choice.apply.openrouter.ts
│   │       │   │   ├── auth-choice.apply.plugin-provider.ts
│   │       │   │   ├── auth-choice.apply.qwen-portal.ts
│   │       │   │   ├── auth-choice.apply.ts
│   │       │   │   ├── auth-choice.apply.vllm.ts
│   │       │   │   ├── auth-choice.apply.volcengine.ts
│   │       │   │   ├── auth-choice.apply.xai.ts
│   │       │   │   ├── auth-choice.default-model.ts
│   │       │   │   ├── auth-choice.model-check.ts
│   │       │   │   ├── auth-choice.moonshot.test.ts
│   │       │   │   ├── auth-choice.preferred-provider.ts
│   │       │   │   ├── auth-choice.test.ts
│   │       │   │   ├── auth-choice.ts
│   │       │   │   ├── auth-token.ts
│   │       │   │   ├── channel-account-context.test.ts
│   │       │   │   ├── channel-account-context.ts
│   │       │   │   ├── channel-test-helpers.ts
│   │       │   │   ├── channels
│   │       │   │   ├── channels.add.test.ts
│   │       │   │   ├── channels.adds-non-default-telegram-account.test.ts
│   │       │   │   ├── channels.mock-harness.ts
│   │       │   │   ├── channels.surfaces-signal-runtime-errors-channels-status-output.test.ts
│   │       │   │   ├── channels.ts
│   │       │   │   ├── chutes-oauth.test.ts
│   │       │   │   ├── chutes-oauth.ts
│   │       │   │   ├── cleanup-plan.ts
│   │       │   │   ├── cleanup-utils.test.ts
│   │       │   │   ├── cleanup-utils.ts
│   │       │   │   ├── config-validation.ts
│   │       │   │   ├── configure.channels.ts
│   │       │   │   ├── configure.commands.ts
│   │       │   │   ├── configure.daemon.ts
│   │       │   │   ├── configure.gateway-auth.prompt-auth-config.test.ts
│   │       │   │   ├── configure.gateway-auth.test.ts
│   │       │   │   ├── configure.gateway-auth.ts
│   │       │   │   ├── configure.gateway.test.ts
│   │       │   │   ├── configure.gateway.ts
│   │       │   │   ├── configure.shared.ts
│   │       │   │   ├── configure.ts
│   │       │   │   ├── configure.wizard.test.ts
│   │       │   │   ├── configure.wizard.ts
│   │       │   │   ├── daemon-install-helpers.test.ts
│   │       │   │   ├── daemon-install-helpers.ts
│   │       │   │   ├── daemon-install-runtime-warning.test.ts
│   │       │   │   ├── daemon-install-runtime-warning.ts
│   │       │   │   ├── daemon-runtime.ts
│   │       │   │   ├── dashboard.links.test.ts
│   │       │   │   ├── dashboard.test.ts
│   │       │   │   ├── dashboard.ts
│   │       │   │   ├── docs.ts
│   │       │   │   ├── doctor-auth.deprecated-cli-profiles.test.ts
│   │       │   │   ├── doctor-auth.hints.test.ts
│   │       │   │   ├── doctor-auth.ts
│   │       │   │   ├── doctor-completion.ts
│   │       │   │   ├── doctor-config-flow.include-warning.test.ts
│   │       │   │   ├── doctor-config-flow.missing-default-account-bindings.integration.test.ts
│   │       │   │   ├── doctor-config-flow.missing-default-account-bindings.test.ts
│   │       │   │   ├── doctor-config-flow.safe-bins.test.ts
│   │       │   │   ├── doctor-config-flow.test-utils.ts
│   │       │   │   ├── doctor-config-flow.test.ts
│   │       │   │   ├── doctor-config-flow.ts
│   │       │   │   ├── doctor-format.ts
│   │       │   │   ├── doctor-gateway-daemon-flow.ts
│   │       │   │   ├── doctor-gateway-health.ts
│   │       │   │   ├── doctor-gateway-services.test.ts
│   │       │   │   ├── doctor-gateway-services.ts
│   │       │   │   ├── doctor-install.ts
│   │       │   │   ├── doctor-legacy-config.migrations.test.ts
│   │       │   │   ├── doctor-legacy-config.test.ts
│   │       │   │   ├── doctor-legacy-config.ts
│   │       │   │   ├── doctor-memory-search.test.ts
│   │       │   │   ├── doctor-memory-search.ts
│   │       │   │   ├── doctor-platform-notes.launchctl-env-overrides.test.ts
│   │       │   │   ├── doctor-platform-notes.ts
│   │       │   │   ├── doctor-prompter.ts
│   │       │   │   ├── doctor-sandbox.ts
│   │       │   │   ├── doctor-sandbox.warns-sandbox-enabled-without-docker.test.ts
│   │       │   │   ├── doctor-security.test.ts
│   │       │   │   ├── doctor-security.ts
│   │       │   │   ├── doctor-session-locks.test.ts
│   │       │   │   ├── doctor-session-locks.ts
│   │       │   │   ├── doctor-state-integrity.test.ts
│   │       │   │   ├── doctor-state-integrity.ts
│   │       │   │   ├── doctor-state-migrations.test.ts
│   │       │   │   ├── doctor-state-migrations.ts
│   │       │   │   ├── doctor-ui.ts
│   │       │   │   ├── doctor-update.ts
│   │       │   │   ├── doctor-workspace-status.ts
│   │       │   │   ├── doctor-workspace.ts
│   │       │   │   ├── doctor.e2e-harness.ts
│   │       │   │   ├── doctor.fast-path-mocks.ts
│   │       │   │   ├── doctor.migrates-routing-allowfrom-channels-whatsapp-allowfrom.test.ts
│   │       │   │   ├── doctor.migrates-slack-discord-dm-policy-aliases.test.ts
│   │       │   │   ├── doctor.runs-legacy-state-migrations-yes-mode-without.test.ts
│   │       │   │   ├── doctor.ts
│   │       │   │   ├── doctor.warns-per-agent-sandbox-docker-browser-prune.test.ts
│   │       │   │   ├── doctor.warns-state-directory-is-missing.test.ts
│   │       │   │   ├── gateway-presence.ts
│   │       │   │   ├── gateway-status
│   │       │   │   ├── gateway-status.test.ts
│   │       │   │   ├── gateway-status.ts
│   │       │   │   ├── google-gemini-model-default.ts
│   │       │   │   ├── health-format.ts
│   │       │   │   ├── health.command.coverage.test.ts
│   │       │   │   ├── health.snapshot.test.ts
│   │       │   │   ├── health.test.ts
│   │       │   │   ├── health.ts
│   │       │   │   ├── message-format.ts
│   │       │   │   ├── message.test.ts
│   │       │   │   ├── message.ts
│   │       │   │   ├── model-allowlist.ts
│   │       │   │   ├── model-default.ts
│   │       │   │   ├── model-picker.test.ts
│   │       │   │   ├── model-picker.ts
│   │       │   │   ├── models
│   │       │   │   ├── models.auth.provider-resolution.test.ts
│   │       │   │   ├── models.list.auth-sync.test.ts
│   │       │   │   ├── models.list.test.ts
│   │       │   │   ├── models.set.test.ts
│   │       │   │   ├── models.ts
│   │       │   │   ├── node-daemon-install-helpers.ts
│   │       │   │   ├── node-daemon-runtime.ts
│   │       │   │   ├── oauth-env.ts
│   │       │   │   ├── oauth-flow.ts
│   │       │   │   ├── onboard-auth.config-core.kilocode.test.ts
│   │       │   │   ├── onboard-auth.config-core.ts
│   │       │   │   ├── onboard-auth.config-gateways.ts
│   │       │   │   ├── onboard-auth.config-litellm.ts
│   │       │   │   ├── onboard-auth.config-minimax.ts
│   │       │   │   ├── onboard-auth.config-opencode.ts
│   │       │   │   ├── onboard-auth.config-shared.test.ts
│   │       │   │   ├── onboard-auth.config-shared.ts
│   │       │   │   ├── onboard-auth.credentials.ts
│   │       │   │   ├── onboard-auth.models.ts
│   │       │   │   ├── onboard-auth.test.ts
│   │       │   │   ├── onboard-auth.ts
│   │       │   │   ├── onboard-channels.test.ts
│   │       │   │   ├── onboard-channels.ts
│   │       │   │   ├── onboard-config.test.ts
│   │       │   │   ├── onboard-config.ts
│   │       │   │   ├── onboard-custom.test.ts
│   │       │   │   ├── onboard-custom.ts
│   │       │   │   ├── onboard-helpers.test.ts
│   │       │   │   ├── onboard-helpers.ts
│   │       │   │   ├── onboard-hooks.test.ts
│   │       │   │   ├── onboard-hooks.ts
│   │       │   │   ├── onboard-interactive.test.ts
│   │       │   │   ├── onboard-interactive.ts
│   │       │   │   ├── onboard-non-interactive
│   │       │   │   ├── onboard-non-interactive.gateway.test.ts
│   │       │   │   ├── onboard-non-interactive.provider-auth.test.ts
│   │       │   │   ├── onboard-non-interactive.test-helpers.ts
│   │       │   │   ├── onboard-non-interactive.ts
│   │       │   │   ├── onboard-provider-auth-flags.ts
│   │       │   │   ├── onboard-remote.test.ts
│   │       │   │   ├── onboard-remote.ts
│   │       │   │   ├── onboard-skills.test.ts
│   │       │   │   ├── onboard-skills.ts
│   │       │   │   ├── onboard-types.ts
│   │       │   │   ├── onboard.ts
│   │       │   │   ├── onboarding
│   │       │   │   ├── openai-codex-model-default.ts
│   │       │   │   ├── openai-codex-oauth.test.ts
│   │       │   │   ├── openai-codex-oauth.ts
│   │       │   │   ├── openai-model-default.test.ts
│   │       │   │   ├── openai-model-default.ts
│   │       │   │   ├── opencode-zen-model-default.ts
│   │       │   │   ├── provider-auth-helpers.ts
│   │       │   │   ├── reset.ts
│   │       │   │   ├── sandbox-display.ts
│   │       │   │   ├── sandbox-explain.test.ts
│   │       │   │   ├── sandbox-explain.ts
│   │       │   │   ├── sandbox-formatters.test.ts
│   │       │   │   ├── sandbox-formatters.ts
│   │       │   │   ├── sandbox.test.ts
│   │       │   │   ├── sandbox.ts
│   │       │   │   ├── session-store-targets.test.ts
│   │       │   │   ├── session-store-targets.ts
│   │       │   │   ├── sessions-cleanup.test.ts
│   │       │   │   ├── sessions-cleanup.ts
│   │       │   │   ├── sessions-table.ts
│   │       │   │   ├── sessions.default-agent-store.test.ts
│   │       │   │   ├── sessions.model-resolution.test.ts
│   │       │   │   ├── sessions.test-helpers.ts
│   │       │   │   ├── sessions.test.ts
│   │       │   │   ├── sessions.ts
│   │       │   │   ├── setup.ts
│   │       │   │   ├── signal-install.test.ts
│   │       │   │   ├── signal-install.ts
│   │       │   │   ├── status-all
│   │       │   │   ├── status-all.ts
│   │       │   │   ├── status.agent-local.ts
│   │       │   │   ├── status.command.ts
│   │       │   │   ├── status.daemon.ts
│   │       │   │   ├── status.format.ts
│   │       │   │   ├── status.gateway-probe.ts
│   │       │   │   ├── status.link-channel.ts
│   │       │   │   ├── status.scan.ts
│   │       │   │   ├── status.summary.redaction.test.ts
│   │       │   │   ├── status.summary.ts
│   │       │   │   ├── status.test.ts
│   │       │   │   ├── status.ts
│   │       │   │   ├── status.types.ts
│   │       │   │   ├── status.update.test.ts
│   │       │   │   ├── status.update.ts
│   │       │   │   ├── systemd-linger.ts
│   │       │   │   ├── test-runtime-config-helpers.ts
│   │       │   │   ├── test-wizard-helpers.ts
│   │       │   │   ├── text-format.test.ts
│   │       │   │   ├── text-format.ts
│   │       │   │   ├── uninstall.ts
│   │       │   │   ├── vllm-setup.ts
│   │       │   │   ├── zai-endpoint-detect.test.ts
│   │       │   │   └── zai-endpoint-detect.ts
│   │       │   ├── compat
│   │       │   │   └── legacy-names.ts
│   │       │   ├── config
│   │       │   │   ├── agent-dirs.test.ts
│   │       │   │   ├── agent-dirs.ts
│   │       │   │   ├── agent-limits.ts
│   │       │   │   ├── backup-rotation.ts
│   │       │   │   ├── cache-utils.ts
│   │       │   │   ├── channel-capabilities.test.ts
│   │       │   │   ├── channel-capabilities.ts
│   │       │   │   ├── commands.test.ts
│   │       │   │   ├── commands.ts
│   │       │   │   ├── config-misc.test.ts
│   │       │   │   ├── config-paths.ts
│   │       │   │   ├── config.agent-concurrency-defaults.test.ts
│   │       │   │   ├── config.backup-rotation.test.ts
│   │       │   │   ├── config.compaction-settings.test.ts
│   │       │   │   ├── config.discord-presence.test.ts
│   │       │   │   ├── config.discord.test.ts
│   │       │   │   ├── config.dm-policy-alias.test.ts
│   │       │   │   ├── config.env-vars.test.ts
│   │       │   │   ├── config.hooks-module-paths.test.ts
│   │       │   │   ├── config.identity-avatar.test.ts
│   │       │   │   ├── config.identity-defaults.test.ts
│   │       │   │   ├── config.irc.test.ts
│   │       │   │   ├── config.legacy-config-detection.accepts-imessage-dmpolicy.test.ts
│   │       │   │   ├── config.legacy-config-detection.rejects-routing-allowfrom.test.ts
│   │       │   │   ├── config.meta-timestamp-coercion.test.ts
│   │       │   │   ├── config.msteams.test.ts
│   │       │   │   ├── config.multi-agent-agentdir-validation.test.ts
│   │       │   │   ├── config.nix-integration-u3-u5-u9.test.ts
│   │       │   │   ├── config.plugin-validation.test.ts
│   │       │   │   ├── config.pruning-defaults.test.ts
│   │       │   │   ├── config.sandbox-docker.test.ts
│   │       │   │   ├── config.schema-regressions.test.ts
│   │       │   │   ├── config.skills-entries-config.test.ts
│   │       │   │   ├── config.talk-api-key-fallback.test.ts
│   │       │   │   ├── config.telegram-custom-commands.test.ts
│   │       │   │   ├── config.tools-alsoAllow.test.ts
│   │       │   │   ├── config.ts
│   │       │   │   ├── config.web-search-provider.test.ts
│   │       │   │   ├── dangerous-name-matching.ts
│   │       │   │   ├── defaults.ts
│   │       │   │   ├── discord-preview-streaming.ts
│   │       │   │   ├── env-preserve-io.test.ts
│   │       │   │   ├── env-preserve.test.ts
│   │       │   │   ├── env-preserve.ts
│   │       │   │   ├── env-substitution.test.ts
│   │       │   │   ├── env-substitution.ts
│   │       │   │   ├── env-vars.ts
│   │       │   │   ├── group-policy.test.ts
│   │       │   │   ├── group-policy.ts
│   │       │   │   ├── home-env.test-harness.ts
│   │       │   │   ├── includes-scan.ts
│   │       │   │   ├── includes.test.ts
│   │       │   │   ├── includes.ts
│   │       │   │   ├── io.compat.test.ts
│   │       │   │   ├── io.eacces.test.ts
│   │       │   │   ├── io.owner-display-secret.test.ts
│   │       │   │   ├── io.ts
│   │       │   │   ├── io.write-config.test.ts
│   │       │   │   ├── legacy-migrate.test.ts
│   │       │   │   ├── legacy-migrate.ts
│   │       │   │   ├── legacy.migrations.part-1.ts
│   │       │   │   ├── legacy.migrations.part-2.ts
│   │       │   │   ├── legacy.migrations.part-3.ts
│   │       │   │   ├── legacy.migrations.ts
│   │       │   │   ├── legacy.rules.ts
│   │       │   │   ├── legacy.shared.test.ts
│   │       │   │   ├── legacy.shared.ts
│   │       │   │   ├── legacy.ts
│   │       │   │   ├── logging-max-file-bytes.test.ts
│   │       │   │   ├── logging.ts
│   │       │   │   ├── markdown-tables.ts
│   │       │   │   ├── merge-config.ts
│   │       │   │   ├── merge-patch.proto-pollution.test.ts
│   │       │   │   ├── merge-patch.test.ts
│   │       │   │   ├── merge-patch.ts
│   │       │   │   ├── model-alias-defaults.test.ts
│   │       │   │   ├── model-input.ts
│   │       │   │   ├── normalize-exec-safe-bin.ts
│   │       │   │   ├── normalize-paths.test.ts
│   │       │   │   ├── normalize-paths.ts
│   │       │   │   ├── paths.test.ts
│   │       │   │   ├── paths.ts
│   │       │   │   ├── plugin-auto-enable.test.ts
│   │       │   │   ├── plugin-auto-enable.ts
│   │       │   │   ├── plugins-allowlist.ts
│   │       │   │   ├── plugins-runtime-boundary.test.ts
│   │       │   │   ├── port-defaults.ts
│   │       │   │   ├── prototype-keys.ts
│   │       │   │   ├── redact-snapshot.test.ts
│   │       │   │   ├── redact-snapshot.ts
│   │       │   │   ├── runtime-group-policy-provider.ts
│   │       │   │   ├── runtime-group-policy.test.ts
│   │       │   │   ├── runtime-group-policy.ts
│   │       │   │   ├── runtime-overrides.test.ts
│   │       │   │   ├── runtime-overrides.ts
│   │       │   │   ├── schema.help.quality.test.ts
│   │       │   │   ├── schema.help.ts
│   │       │   │   ├── schema.hints.test.ts
│   │       │   │   ├── schema.hints.ts
│   │       │   │   ├── schema.irc.ts
│   │       │   │   ├── schema.labels.ts
│   │       │   │   ├── schema.tags.test.ts
│   │       │   │   ├── schema.tags.ts
│   │       │   │   ├── schema.test.ts
│   │       │   │   ├── schema.ts
│   │       │   │   ├── sessions
│   │       │   │   ├── sessions.cache.test.ts
│   │       │   │   ├── sessions.test.ts
│   │       │   │   ├── sessions.ts
│   │       │   │   ├── slack-http-config.test.ts
│   │       │   │   ├── slack-token-validation.test.ts
│   │       │   │   ├── talk.normalize.test.ts
│   │       │   │   ├── talk.ts
│   │       │   │   ├── telegram-custom-commands.ts
│   │       │   │   ├── telegram-webhook-port.test.ts
│   │       │   │   ├── telegram-webhook-secret.test.ts
│   │       │   │   ├── test-helpers.ts
│   │       │   │   ├── types.acp.ts
│   │       │   │   ├── types.agent-defaults.ts
│   │       │   │   ├── types.agents-shared.ts
│   │       │   │   ├── types.agents.ts
│   │       │   │   ├── types.approvals.ts
│   │       │   │   ├── types.auth.ts
│   │       │   │   ├── types.base.ts
│   │       │   │   ├── types.browser.ts
│   │       │   │   ├── types.channel-messaging-common.ts
│   │       │   │   ├── types.channels.ts
│   │       │   │   ├── types.cron.ts
│   │       │   │   ├── types.discord.ts
│   │       │   │   ├── types.gateway.ts
│   │       │   │   ├── types.googlechat.ts
│   │       │   │   ├── types.hooks.ts
│   │       │   │   ├── types.imessage.ts
│   │       │   │   ├── types.installs.ts
│   │       │   │   ├── types.irc.ts
│   │       │   │   ├── types.memory.ts
│   │       │   │   ├── types.messages.ts
│   │       │   │   ├── types.models.ts
│   │       │   │   ├── types.msteams.ts
│   │       │   │   ├── types.node-host.ts
│   │       │   │   ├── types.openclaw.ts
│   │       │   │   ├── types.plugins.ts
│   │       │   │   ├── types.queue.ts
│   │       │   │   ├── types.sandbox.ts
│   │       │   │   ├── types.signal.ts
│   │       │   │   ├── types.skills.ts
│   │       │   │   ├── types.slack.ts
│   │       │   │   ├── types.telegram.ts
│   │       │   │   ├── types.tools.ts
│   │       │   │   ├── types.ts
│   │       │   │   ├── types.tts.ts
│   │       │   │   ├── types.whatsapp.ts
│   │       │   │   ├── validation.ts
│   │       │   │   ├── version.ts
│   │       │   │   ├── zod-schema.agent-defaults.ts
│   │       │   │   ├── zod-schema.agent-model.ts
│   │       │   │   ├── zod-schema.agent-runtime.ts
│   │       │   │   ├── zod-schema.agents.ts
│   │       │   │   ├── zod-schema.allowdeny.ts
│   │       │   │   ├── zod-schema.approvals.ts
│   │       │   │   ├── zod-schema.channels.ts
│   │       │   │   ├── zod-schema.core.ts
│   │       │   │   ├── zod-schema.cron-retention.test.ts
│   │       │   │   ├── zod-schema.hooks.ts
│   │       │   │   ├── zod-schema.installs.ts
│   │       │   │   ├── zod-schema.logging-levels.test.ts
│   │       │   │   ├── zod-schema.providers-core.ts
│   │       │   │   ├── zod-schema.providers-whatsapp.ts
│   │       │   │   ├── zod-schema.providers.ts
│   │       │   │   ├── zod-schema.sensitive.ts
│   │       │   │   ├── zod-schema.session-maintenance-extensions.test.ts
│   │       │   │   ├── zod-schema.session.ts
│   │       │   │   ├── zod-schema.ts
│   │       │   │   └── zod-schema.typing-mode.test.ts
│   │       │   ├── cron
│   │       │   │   ├── cron-protocol-conformance.test.ts
│   │       │   │   ├── delivery.test.ts
│   │       │   │   ├── delivery.ts
│   │       │   │   ├── isolated-agent
│   │       │   │   ├── isolated-agent.auth-profile-propagation.test.ts
│   │       │   │   ├── isolated-agent.delivers-response-has-heartbeat-ok-but-includes.test.ts
│   │       │   │   ├── isolated-agent.delivery-target-thread-session.test.ts
│   │       │   │   ├── isolated-agent.delivery.test-helpers.ts
│   │       │   │   ├── isolated-agent.direct-delivery-forum-topics.test.ts
│   │       │   │   ├── isolated-agent.mocks.ts
│   │       │   │   ├── isolated-agent.skips-delivery-without-whatsapp-recipient-besteffortdeliver-true.test.ts
│   │       │   │   ├── isolated-agent.test-harness.ts
│   │       │   │   ├── isolated-agent.test-setup.ts
│   │       │   │   ├── isolated-agent.ts
│   │       │   │   ├── isolated-agent.uses-last-non-empty-agent-text-as.test.ts
│   │       │   │   ├── legacy-delivery.ts
│   │       │   │   ├── normalize.test.ts
│   │       │   │   ├── normalize.ts
│   │       │   │   ├── parse.ts
│   │       │   │   ├── payload-migration.ts
│   │       │   │   ├── run-log.test.ts
│   │       │   │   ├── run-log.ts
│   │       │   │   ├── schedule.test.ts
│   │       │   │   ├── schedule.ts
│   │       │   │   ├── service
│   │       │   │   ├── service.delivery-plan.test.ts
│   │       │   │   ├── service.every-jobs-fire.test.ts
│   │       │   │   ├── service.get-job.test.ts
│   │       │   │   ├── service.issue-13992-regression.test.ts
│   │       │   │   ├── service.issue-16156-list-skips-cron.test.ts
│   │       │   │   ├── service.issue-17852-daily-skip.test.ts
│   │       │   │   ├── service.issue-22895-every-next-run.test.ts
│   │       │   │   ├── service.issue-regressions.test.ts
│   │       │   │   ├── service.jobs.test.ts
│   │       │   │   ├── service.jobs.top-of-hour-stagger.test.ts
│   │       │   │   ├── service.persists-delivered-status.test.ts
│   │       │   │   ├── service.prevents-duplicate-timers.test.ts
│   │       │   │   ├── service.read-ops-nonblocking.test.ts
│   │       │   │   ├── service.rearm-timer-when-running.test.ts
│   │       │   │   ├── service.restart-catchup.test.ts
│   │       │   │   ├── service.runs-one-shot-main-job-disables-it.test.ts
│   │       │   │   ├── service.skips-main-jobs-empty-systemevent-text.test.ts
│   │       │   │   ├── service.store-migration.test.ts
│   │       │   │   ├── service.store.migration.test.ts
│   │       │   │   ├── service.test-harness.ts
│   │       │   │   ├── service.ts
│   │       │   │   ├── session-reaper.test.ts
│   │       │   │   ├── session-reaper.ts
│   │       │   │   ├── stagger.test.ts
│   │       │   │   ├── stagger.ts
│   │       │   │   ├── store.test.ts
│   │       │   │   ├── store.ts
│   │       │   │   ├── types.ts
│   │       │   │   ├── validate-timestamp.ts
│   │       │   │   └── webhook-url.ts
│   │       │   ├── daemon
│   │       │   │   ├── arg-split.ts
│   │       │   │   ├── cmd-argv.test.ts
│   │       │   │   ├── cmd-argv.ts
│   │       │   │   ├── cmd-set.ts
│   │       │   │   ├── constants.test.ts
│   │       │   │   ├── constants.ts
│   │       │   │   ├── diagnostics.ts
│   │       │   │   ├── exec-file.ts
│   │       │   │   ├── inspect.test.ts
│   │       │   │   ├── inspect.ts
│   │       │   │   ├── launchd-plist.ts
│   │       │   │   ├── launchd.integration.test.ts
│   │       │   │   ├── launchd.test.ts
│   │       │   │   ├── launchd.ts
│   │       │   │   ├── node-service.ts
│   │       │   │   ├── output.ts
│   │       │   │   ├── paths.ts
│   │       │   │   ├── program-args.test.ts
│   │       │   │   ├── program-args.ts
│   │       │   │   ├── runtime-binary.ts
│   │       │   │   ├── runtime-format.ts
│   │       │   │   ├── runtime-parse.ts
│   │       │   │   ├── runtime-paths.test.ts
│   │       │   │   ├── runtime-paths.ts
│   │       │   │   ├── schtasks-exec.ts
│   │       │   │   ├── schtasks.install.test.ts
│   │       │   │   ├── schtasks.test.ts
│   │       │   │   ├── schtasks.ts
│   │       │   │   ├── service-audit.test.ts
│   │       │   │   ├── service-audit.ts
│   │       │   │   ├── service-env.test.ts
│   │       │   │   ├── service-env.ts
│   │       │   │   ├── service-runtime.ts
│   │       │   │   ├── service-types.ts
│   │       │   │   ├── service.ts
│   │       │   │   ├── systemd-hints.ts
│   │       │   │   ├── systemd-linger.ts
│   │       │   │   ├── systemd-unit.test.ts
│   │       │   │   ├── systemd-unit.ts
│   │       │   │   ├── systemd.test.ts
│   │       │   │   └── systemd.ts
│   │       │   ├── discord
│   │       │   │   ├── accounts.ts
│   │       │   │   ├── api.test.ts
│   │       │   │   ├── api.ts
│   │       │   │   ├── audit.test.ts
│   │       │   │   ├── audit.ts
│   │       │   │   ├── chunk.test.ts
│   │       │   │   ├── chunk.ts
│   │       │   │   ├── client.ts
│   │       │   │   ├── components-registry.ts
│   │       │   │   ├── components.test.ts
│   │       │   │   ├── components.ts
│   │       │   │   ├── directory-live.test.ts
│   │       │   │   ├── directory-live.ts
│   │       │   │   ├── draft-chunking.ts
│   │       │   │   ├── draft-stream.ts
│   │       │   │   ├── gateway-logging.test.ts
│   │       │   │   ├── gateway-logging.ts
│   │       │   │   ├── guilds.ts
│   │       │   │   ├── monitor
│   │       │   │   ├── monitor.gateway.test.ts
│   │       │   │   ├── monitor.gateway.ts
│   │       │   │   ├── monitor.test.ts
│   │       │   │   ├── monitor.tool-result.accepts-guild-messages-mentionpatterns-match.test.ts
│   │       │   │   ├── monitor.tool-result.sends-status-replies-responseprefix.test.ts
│   │       │   │   ├── monitor.tool-result.test-harness.ts
│   │       │   │   ├── monitor.ts
│   │       │   │   ├── pluralkit.test.ts
│   │       │   │   ├── pluralkit.ts
│   │       │   │   ├── probe.intents.test.ts
│   │       │   │   ├── probe.ts
│   │       │   │   ├── resolve-channels.test.ts
│   │       │   │   ├── resolve-channels.ts
│   │       │   │   ├── resolve-users.test.ts
│   │       │   │   ├── resolve-users.ts
│   │       │   │   ├── send.channels.ts
│   │       │   │   ├── send.components.test.ts
│   │       │   │   ├── send.components.ts
│   │       │   │   ├── send.creates-thread.test.ts
│   │       │   │   ├── send.emojis-stickers.ts
│   │       │   │   ├── send.guild.ts
│   │       │   │   ├── send.messages.ts
│   │       │   │   ├── send.outbound.ts
│   │       │   │   ├── send.permissions.authz.test.ts
│   │       │   │   ├── send.permissions.ts
│   │       │   │   ├── send.reactions.ts
│   │       │   │   ├── send.sends-basic-channel-messages.test.ts
│   │       │   │   ├── send.shared.ts
│   │       │   │   ├── send.test-harness.ts
│   │       │   │   ├── send.ts
│   │       │   │   ├── send.types.ts
│   │       │   │   ├── send.webhook-activity.test.ts
│   │       │   │   ├── targets.test.ts
│   │       │   │   ├── targets.ts
│   │       │   │   ├── test-http-helpers.ts
│   │       │   │   ├── token.test.ts
│   │       │   │   ├── token.ts
│   │       │   │   ├── ui.ts
│   │       │   │   ├── voice
│   │       │   │   └── voice-message.ts
│   │       │   ├── docker-image-digests.test.ts
│   │       │   ├── docker-setup.test.ts
│   │       │   ├── dockerfile.test.ts
│   │       │   ├── docs
│   │       │   │   └── slash-commands-doc.test.ts
│   │       │   ├── entry.ts
│   │       │   ├── extensionAPI.ts
│   │       │   ├── gateway
│   │       │   │   ├── agent-event-assistant-text.ts
│   │       │   │   ├── agent-prompt.test.ts
│   │       │   │   ├── agent-prompt.ts
│   │       │   │   ├── assistant-identity.test.ts
│   │       │   │   ├── assistant-identity.ts
│   │       │   │   ├── auth-rate-limit.test.ts
│   │       │   │   ├── auth-rate-limit.ts
│   │       │   │   ├── auth.test.ts
│   │       │   │   ├── auth.ts
│   │       │   │   ├── boot.test.ts
│   │       │   │   ├── boot.ts
│   │       │   │   ├── call.test.ts
│   │       │   │   ├── call.ts
│   │       │   │   ├── canvas-capability.ts
│   │       │   │   ├── channel-health-monitor.test.ts
│   │       │   │   ├── channel-health-monitor.ts
│   │       │   │   ├── chat-abort.test.ts
│   │       │   │   ├── chat-abort.ts
│   │       │   │   ├── chat-attachments.test.ts
│   │       │   │   ├── chat-attachments.ts
│   │       │   │   ├── chat-sanitize.test.ts
│   │       │   │   ├── chat-sanitize.ts
│   │       │   │   ├── client.test.ts
│   │       │   │   ├── client.ts
│   │       │   │   ├── client.watchdog.test.ts
│   │       │   │   ├── config-reload.test.ts
│   │       │   │   ├── config-reload.ts
│   │       │   │   ├── control-plane-audit.ts
│   │       │   │   ├── control-plane-rate-limit.ts
│   │       │   │   ├── control-ui-contract.ts
│   │       │   │   ├── control-ui-csp.test.ts
│   │       │   │   ├── control-ui-csp.ts
│   │       │   │   ├── control-ui-shared.ts
│   │       │   │   ├── control-ui.http.test.ts
│   │       │   │   ├── control-ui.ts
│   │       │   │   ├── credential-precedence.parity.test.ts
│   │       │   │   ├── credentials.test.ts
│   │       │   │   ├── credentials.ts
│   │       │   │   ├── device-auth.ts
│   │       │   │   ├── events.ts
│   │       │   │   ├── exec-approval-manager.ts
│   │       │   │   ├── gateway-cli-backend.live.test.ts
│   │       │   │   ├── gateway-config-prompts.shared.ts
│   │       │   │   ├── gateway-connection.test-mocks.ts
│   │       │   │   ├── gateway-misc.test.ts
│   │       │   │   ├── gateway-models.profiles.live.test.ts
│   │       │   │   ├── gateway.test.ts
│   │       │   │   ├── hooks-mapping.test.ts
│   │       │   │   ├── hooks-mapping.ts
│   │       │   │   ├── hooks.test.ts
│   │       │   │   ├── hooks.ts
│   │       │   │   ├── http-auth-helpers.test.ts
│   │       │   │   ├── http-auth-helpers.ts
│   │       │   │   ├── http-common.ts
│   │       │   │   ├── http-endpoint-helpers.test.ts
│   │       │   │   ├── http-endpoint-helpers.ts
│   │       │   │   ├── http-utils.ts
│   │       │   │   ├── live-image-probe.ts
│   │       │   │   ├── live-tool-probe-utils.test.ts
│   │       │   │   ├── live-tool-probe-utils.ts
│   │       │   │   ├── method-scopes.test.ts
│   │       │   │   ├── method-scopes.ts
│   │       │   │   ├── net.test.ts
│   │       │   │   ├── net.ts
│   │       │   │   ├── node-command-policy.ts
│   │       │   │   ├── node-invoke-sanitize.ts
│   │       │   │   ├── node-invoke-system-run-approval-match.test.ts
│   │       │   │   ├── node-invoke-system-run-approval-match.ts
│   │       │   │   ├── node-invoke-system-run-approval.test.ts
│   │       │   │   ├── node-invoke-system-run-approval.ts
│   │       │   │   ├── node-registry.ts
│   │       │   │   ├── open-responses.schema.ts
│   │       │   │   ├── openai-http.test.ts
│   │       │   │   ├── openai-http.ts
│   │       │   │   ├── openresponses-http.test.ts
│   │       │   │   ├── openresponses-http.ts
│   │       │   │   ├── openresponses-parity.test.ts
│   │       │   │   ├── openresponses-prompt.ts
│   │       │   │   ├── origin-check.test.ts
│   │       │   │   ├── origin-check.ts
│   │       │   │   ├── probe-auth.ts
│   │       │   │   ├── probe.test.ts
│   │       │   │   ├── probe.ts
│   │       │   │   ├── protocol
│   │       │   │   ├── role-policy.test.ts
│   │       │   │   ├── role-policy.ts
│   │       │   │   ├── server
│   │       │   │   ├── server-broadcast.ts
│   │       │   │   ├── server-browser.ts
│   │       │   │   ├── server-channels.test.ts
│   │       │   │   ├── server-channels.ts
│   │       │   │   ├── server-chat.agent-events.test.ts
│   │       │   │   ├── server-chat.ts
│   │       │   │   ├── server-close.ts
│   │       │   │   ├── server-constants.ts
│   │       │   │   ├── server-cron.test.ts
│   │       │   │   ├── server-cron.ts
│   │       │   │   ├── server-discovery-runtime.ts
│   │       │   │   ├── server-discovery.test.ts
│   │       │   │   ├── server-discovery.ts
│   │       │   │   ├── server-http.hooks-request-timeout.test.ts
│   │       │   │   ├── server-http.ts
│   │       │   │   ├── server-lanes.ts
│   │       │   │   ├── server-maintenance.ts
│   │       │   │   ├── server-methods
│   │       │   │   ├── server-methods-list.ts
│   │       │   │   ├── server-methods.control-plane-rate-limit.test.ts
│   │       │   │   ├── server-methods.ts
│   │       │   │   ├── server-mobile-nodes.ts
│   │       │   │   ├── server-model-catalog.ts
│   │       │   │   ├── server-node-events-types.ts
│   │       │   │   ├── server-node-events.test.ts
│   │       │   │   ├── server-node-events.ts
│   │       │   │   ├── server-node-subscriptions.ts
│   │       │   │   ├── server-plugins.test.ts
│   │       │   │   ├── server-plugins.ts
│   │       │   │   ├── server-reload-handlers.ts
│   │       │   │   ├── server-restart-deferral.test.ts
│   │       │   │   ├── server-restart-sentinel.ts
│   │       │   │   ├── server-runtime-config.test.ts
│   │       │   │   ├── server-runtime-config.ts
│   │       │   │   ├── server-runtime-state.ts
│   │       │   │   ├── server-session-key.ts
│   │       │   │   ├── server-shared.ts
│   │       │   │   ├── server-startup-log.test.ts
│   │       │   │   ├── server-startup-log.ts
│   │       │   │   ├── server-startup-memory.test.ts
│   │       │   │   ├── server-startup-memory.ts
│   │       │   │   ├── server-startup.ts
│   │       │   │   ├── server-tailscale.ts
│   │       │   │   ├── server-utils.ts
│   │       │   │   ├── server-wizard-sessions.ts
│   │       │   │   ├── server-ws-runtime.ts
│   │       │   │   ├── server.agent.gateway-server-agent-a.test.ts
│   │       │   │   ├── server.agent.gateway-server-agent-b.test.ts
│   │       │   │   ├── server.agent.gateway-server-agent.mocks.ts
│   │       │   │   ├── server.auth.browser-hardening.test.ts
│   │       │   │   ├── server.auth.test.ts
│   │       │   │   ├── server.canvas-auth.test.ts
│   │       │   │   ├── server.channels.test.ts
│   │       │   │   ├── server.chat.gateway-server-chat-b.test.ts
│   │       │   │   ├── server.chat.gateway-server-chat.test.ts
│   │       │   │   ├── server.config-apply.test.ts
│   │       │   │   ├── server.config-patch.test.ts
│   │       │   │   ├── server.cron.test.ts
│   │       │   │   ├── server.e2e-registry-helpers.ts
│   │       │   │   ├── server.e2e-ws-harness.ts
│   │       │   │   ├── server.health.test.ts
│   │       │   │   ├── server.hooks.test.ts
│   │       │   │   ├── server.impl.ts
│   │       │   │   ├── server.ios-client-id.test.ts
│   │       │   │   ├── server.models-voicewake-misc.test.ts
│   │       │   │   ├── server.node-invoke-approval-bypass.test.ts
│   │       │   │   ├── server.plugin-http-auth.test.ts
│   │       │   │   ├── server.reload.test.ts
│   │       │   │   ├── server.roles-allowlist-update.test.ts
│   │       │   │   ├── server.sessions-send.test.ts
│   │       │   │   ├── server.sessions.gateway-server-sessions-a.test.ts
│   │       │   │   ├── server.skills-status.test.ts
│   │       │   │   ├── server.talk-config.test.ts
│   │       │   │   ├── server.tools-catalog.test.ts
│   │       │   │   ├── server.ts
│   │       │   │   ├── session-preview.test-helpers.ts
│   │       │   │   ├── session-utils.fs.test.ts
│   │       │   │   ├── session-utils.fs.ts
│   │       │   │   ├── session-utils.test.ts
│   │       │   │   ├── session-utils.ts
│   │       │   │   ├── session-utils.types.ts
│   │       │   │   ├── sessions-patch.test.ts
│   │       │   │   ├── sessions-patch.ts
│   │       │   │   ├── sessions-resolve.ts
│   │       │   │   ├── startup-auth.test.ts
│   │       │   │   ├── startup-auth.ts
│   │       │   │   ├── test-helpers.agent-results.ts
│   │       │   │   ├── test-helpers.e2e.ts
│   │       │   │   ├── test-helpers.mocks.ts
│   │       │   │   ├── test-helpers.openai-mock.ts
│   │       │   │   ├── test-helpers.server.ts
│   │       │   │   ├── test-helpers.ts
│   │       │   │   ├── test-http-response.ts
│   │       │   │   ├── test-openai-responses-model.ts
│   │       │   │   ├── test-temp-config.ts
│   │       │   │   ├── test-with-server.ts
│   │       │   │   ├── tools-invoke-http.cron-regression.test.ts
│   │       │   │   ├── tools-invoke-http.test.ts
│   │       │   │   ├── tools-invoke-http.ts
│   │       │   │   ├── ws-log.test.ts
│   │       │   │   ├── ws-log.ts
│   │       │   │   └── ws-logging.ts
│   │       │   ├── globals.ts
│   │       │   ├── hooks
│   │       │   │   ├── bundled
│   │       │   │   ├── bundled-dir.ts
│   │       │   │   ├── config.ts
│   │       │   │   ├── frontmatter.test.ts
│   │       │   │   ├── frontmatter.ts
│   │       │   │   ├── gmail-ops.ts
│   │       │   │   ├── gmail-setup-utils.test.ts
│   │       │   │   ├── gmail-setup-utils.ts
│   │       │   │   ├── gmail-watcher-lifecycle.test.ts
│   │       │   │   ├── gmail-watcher-lifecycle.ts
│   │       │   │   ├── gmail-watcher.ts
│   │       │   │   ├── gmail.test.ts
│   │       │   │   ├── gmail.ts
│   │       │   │   ├── hooks-install.test.ts
│   │       │   │   ├── hooks-status.ts
│   │       │   │   ├── hooks.ts
│   │       │   │   ├── import-url.test.ts
│   │       │   │   ├── import-url.ts
│   │       │   │   ├── install.test.ts
│   │       │   │   ├── install.ts
│   │       │   │   ├── installs.ts
│   │       │   │   ├── internal-hooks.test.ts
│   │       │   │   ├── internal-hooks.ts
│   │       │   │   ├── llm-slug-generator.ts
│   │       │   │   ├── loader.test.ts
│   │       │   │   ├── loader.ts
│   │       │   │   ├── module-loader.test.ts
│   │       │   │   ├── module-loader.ts
│   │       │   │   ├── types.ts
│   │       │   │   ├── workspace.test.ts
│   │       │   │   └── workspace.ts
│   │       │   ├── imessage
│   │       │   │   ├── accounts.ts
│   │       │   │   ├── client.ts
│   │       │   │   ├── constants.ts
│   │       │   │   ├── monitor
│   │       │   │   ├── monitor.gating.test.ts
│   │       │   │   ├── monitor.shutdown.unhandled-rejection.test.ts
│   │       │   │   ├── monitor.ts
│   │       │   │   ├── probe.test.ts
│   │       │   │   ├── probe.ts
│   │       │   │   ├── send.test.ts
│   │       │   │   ├── send.ts
│   │       │   │   ├── target-parsing-helpers.ts
│   │       │   │   ├── targets.test.ts
│   │       │   │   └── targets.ts
│   │       │   ├── index.ts
│   │       │   ├── infra
│   │       │   │   ├── abort-pattern.test.ts
│   │       │   │   ├── abort-signal.test.ts
│   │       │   │   ├── abort-signal.ts
│   │       │   │   ├── agent-events.test.ts
│   │       │   │   ├── agent-events.ts
│   │       │   │   ├── archive-path.test.ts
│   │       │   │   ├── archive-path.ts
│   │       │   │   ├── archive.test.ts
│   │       │   │   ├── archive.ts
│   │       │   │   ├── backoff.ts
│   │       │   │   ├── binaries.ts
│   │       │   │   ├── bonjour-ciao.ts
│   │       │   │   ├── bonjour-discovery.test.ts
│   │       │   │   ├── bonjour-discovery.ts
│   │       │   │   ├── bonjour-errors.ts
│   │       │   │   ├── bonjour.test.ts
│   │       │   │   ├── bonjour.ts
│   │       │   │   ├── brew.test.ts
│   │       │   │   ├── brew.ts
│   │       │   │   ├── canvas-host-url.ts
│   │       │   │   ├── channel-activity.ts
│   │       │   │   ├── channel-summary.ts
│   │       │   │   ├── channels-status-issues.ts
│   │       │   │   ├── clipboard.ts
│   │       │   │   ├── control-ui-assets.test.ts
│   │       │   │   ├── control-ui-assets.ts
│   │       │   │   ├── dedupe.ts
│   │       │   │   ├── detect-package-manager.ts
│   │       │   │   ├── device-auth-store.ts
│   │       │   │   ├── device-identity.state-dir.test.ts
│   │       │   │   ├── device-identity.ts
│   │       │   │   ├── device-pairing.test.ts
│   │       │   │   ├── device-pairing.ts
│   │       │   │   ├── diagnostic-events.ts
│   │       │   │   ├── diagnostic-flags.ts
│   │       │   │   ├── dotenv.test.ts
│   │       │   │   ├── dotenv.ts
│   │       │   │   ├── env-file.ts
│   │       │   │   ├── env.test.ts
│   │       │   │   ├── env.ts
│   │       │   │   ├── errors.ts
│   │       │   │   ├── exec-approval-forwarder.test.ts
│   │       │   │   ├── exec-approval-forwarder.ts
│   │       │   │   ├── exec-approvals-allow-always.test.ts
│   │       │   │   ├── exec-approvals-allowlist.ts
│   │       │   │   ├── exec-approvals-analysis.ts
│   │       │   │   ├── exec-approvals-config.test.ts
│   │       │   │   ├── exec-approvals-parity.test.ts
│   │       │   │   ├── exec-approvals-safe-bins.test.ts
│   │       │   │   ├── exec-approvals-test-helpers.ts
│   │       │   │   ├── exec-approvals.test.ts
│   │       │   │   ├── exec-approvals.ts
│   │       │   │   ├── exec-command-resolution.ts
│   │       │   │   ├── exec-host.ts
│   │       │   │   ├── exec-obfuscation-detect.test.ts
│   │       │   │   ├── exec-obfuscation-detect.ts
│   │       │   │   ├── exec-safe-bin-policy-profiles.ts
│   │       │   │   ├── exec-safe-bin-policy-validator.ts
│   │       │   │   ├── exec-safe-bin-policy.test.ts
│   │       │   │   ├── exec-safe-bin-policy.ts
│   │       │   │   ├── exec-safe-bin-runtime-policy.test.ts
│   │       │   │   ├── exec-safe-bin-runtime-policy.ts
│   │       │   │   ├── exec-safe-bin-trust.test.ts
│   │       │   │   ├── exec-safe-bin-trust.ts
│   │       │   │   ├── exec-safety.ts
│   │       │   │   ├── exec-wrapper-resolution.ts
│   │       │   │   ├── fetch.test.ts
│   │       │   │   ├── fetch.ts
│   │       │   │   ├── file-identity.test.ts
│   │       │   │   ├── file-identity.ts
│   │       │   │   ├── file-lock.ts
│   │       │   │   ├── fixed-window-rate-limit.test.ts
│   │       │   │   ├── fixed-window-rate-limit.ts
│   │       │   │   ├── format-time
│   │       │   │   ├── fs-safe.test.ts
│   │       │   │   ├── fs-safe.ts
│   │       │   │   ├── gateway-lock.test.ts
│   │       │   │   ├── gateway-lock.ts
│   │       │   │   ├── gemini-auth.ts
│   │       │   │   ├── git-commit.ts
│   │       │   │   ├── git-root.test.ts
│   │       │   │   ├── git-root.ts
│   │       │   │   ├── hardlink-guards.ts
│   │       │   │   ├── heartbeat-active-hours.test.ts
│   │       │   │   ├── heartbeat-active-hours.ts
│   │       │   │   ├── heartbeat-events-filter.test.ts
│   │       │   │   ├── heartbeat-events-filter.ts
│   │       │   │   ├── heartbeat-events.ts
│   │       │   │   ├── heartbeat-reason.test.ts
│   │       │   │   ├── heartbeat-reason.ts
│   │       │   │   ├── heartbeat-runner.ghost-reminder.test.ts
│   │       │   │   ├── heartbeat-runner.model-override.test.ts
│   │       │   │   ├── heartbeat-runner.respects-ackmaxchars-heartbeat-acks.test.ts
│   │       │   │   ├── heartbeat-runner.returns-default-unset.test.ts
│   │       │   │   ├── heartbeat-runner.scheduler.test.ts
│   │       │   │   ├── heartbeat-runner.sender-prefers-delivery-target.test.ts
│   │       │   │   ├── heartbeat-runner.test-harness.ts
│   │       │   │   ├── heartbeat-runner.test-utils.ts
│   │       │   │   ├── heartbeat-runner.transcript-prune.test.ts
│   │       │   │   ├── heartbeat-runner.ts
│   │       │   │   ├── heartbeat-visibility.test.ts
│   │       │   │   ├── heartbeat-visibility.ts
│   │       │   │   ├── heartbeat-wake.test.ts
│   │       │   │   ├── heartbeat-wake.ts
│   │       │   │   ├── home-dir.test.ts
│   │       │   │   ├── home-dir.ts
│   │       │   │   ├── host-env-security-policy.json
│   │       │   │   ├── host-env-security.policy-parity.test.ts
│   │       │   │   ├── host-env-security.test.ts
│   │       │   │   ├── host-env-security.ts
│   │       │   │   ├── http-body.test.ts
│   │       │   │   ├── http-body.ts
│   │       │   │   ├── infra-parsing.test.ts
│   │       │   │   ├── infra-runtime.test.ts
│   │       │   │   ├── infra-store.test.ts
│   │       │   │   ├── install-flow.test.ts
│   │       │   │   ├── install-flow.ts
│   │       │   │   ├── install-mode-options.test.ts
│   │       │   │   ├── install-mode-options.ts
│   │       │   │   ├── install-package-dir.ts
│   │       │   │   ├── install-safe-path.test.ts
│   │       │   │   ├── install-safe-path.ts
│   │       │   │   ├── install-source-utils.test.ts
│   │       │   │   ├── install-source-utils.ts
│   │       │   │   ├── is-main.ts
│   │       │   │   ├── json-file.ts
│   │       │   │   ├── json-files.ts
│   │       │   │   ├── jsonl-socket.ts
│   │       │   │   ├── machine-name.ts
│   │       │   │   ├── map-size.ts
│   │       │   │   ├── net
│   │       │   │   ├── node-pairing.test.ts
│   │       │   │   ├── node-pairing.ts
│   │       │   │   ├── node-shell.ts
│   │       │   │   ├── npm-integrity.test.ts
│   │       │   │   ├── npm-integrity.ts
│   │       │   │   ├── npm-pack-install.test.ts
│   │       │   │   ├── npm-pack-install.ts
│   │       │   │   ├── npm-registry-spec.ts
│   │       │   │   ├── openclaw-root.test.ts
│   │       │   │   ├── openclaw-root.ts
│   │       │   │   ├── os-summary.ts
│   │       │   │   ├── outbound
│   │       │   │   ├── package-json.ts
│   │       │   │   ├── pairing-files.ts
│   │       │   │   ├── pairing-pending.ts
│   │       │   │   ├── pairing-token.ts
│   │       │   │   ├── path-alias-guards.ts
│   │       │   │   ├── path-env.test.ts
│   │       │   │   ├── path-env.ts
│   │       │   │   ├── path-guards.ts
│   │       │   │   ├── path-prepend.ts
│   │       │   │   ├── path-safety.test.ts
│   │       │   │   ├── path-safety.ts
│   │       │   │   ├── plain-object.test.ts
│   │       │   │   ├── plain-object.ts
│   │       │   │   ├── ports-format.ts
│   │       │   │   ├── ports-inspect.ts
│   │       │   │   ├── ports-lsof.ts
│   │       │   │   ├── ports-probe.ts
│   │       │   │   ├── ports-types.ts
│   │       │   │   ├── ports.test.ts
│   │       │   │   ├── ports.ts
│   │       │   │   ├── process-respawn.test.ts
│   │       │   │   ├── process-respawn.ts
│   │       │   │   ├── prototype-keys.ts
│   │       │   │   ├── provider-usage.auth.normalizes-keys.test.ts
│   │       │   │   ├── provider-usage.auth.ts
│   │       │   │   ├── provider-usage.fetch.claude.test.ts
│   │       │   │   ├── provider-usage.fetch.claude.ts
│   │       │   │   ├── provider-usage.fetch.codex.test.ts
│   │       │   │   ├── provider-usage.fetch.codex.ts
│   │       │   │   ├── provider-usage.fetch.copilot.test.ts
│   │       │   │   ├── provider-usage.fetch.copilot.ts
│   │       │   │   ├── provider-usage.fetch.gemini.test.ts
│   │       │   │   ├── provider-usage.fetch.gemini.ts
│   │       │   │   ├── provider-usage.fetch.minimax.test.ts
│   │       │   │   ├── provider-usage.fetch.minimax.ts
│   │       │   │   ├── provider-usage.fetch.shared.test.ts
│   │       │   │   ├── provider-usage.fetch.shared.ts
│   │       │   │   ├── provider-usage.fetch.ts
│   │       │   │   ├── provider-usage.fetch.zai.test.ts
│   │       │   │   ├── provider-usage.fetch.zai.ts
│   │       │   │   ├── provider-usage.format.test.ts
│   │       │   │   ├── provider-usage.format.ts
│   │       │   │   ├── provider-usage.load.ts
│   │       │   │   ├── provider-usage.shared.test.ts
│   │       │   │   ├── provider-usage.shared.ts
│   │       │   │   ├── provider-usage.test.ts
│   │       │   │   ├── provider-usage.ts
│   │       │   │   ├── provider-usage.types.ts
│   │       │   │   ├── push-apns.test.ts
│   │       │   │   ├── push-apns.ts
│   │       │   │   ├── restart-sentinel.test.ts
│   │       │   │   ├── restart-sentinel.ts
│   │       │   │   ├── restart.ts
│   │       │   │   ├── retry-policy.ts
│   │       │   │   ├── retry.test.ts
│   │       │   │   ├── retry.ts
│   │       │   │   ├── run-node.test.ts
│   │       │   │   ├── runtime-guard.test.ts
│   │       │   │   ├── runtime-guard.ts
│   │       │   │   ├── runtime-status.ts
│   │       │   │   ├── safe-open-sync.ts
│   │       │   │   ├── scp-host.test.ts
│   │       │   │   ├── scp-host.ts
│   │       │   │   ├── scripts-modules.d.ts
│   │       │   │   ├── secure-random.test.ts
│   │       │   │   ├── secure-random.ts
│   │       │   │   ├── session-cost-usage.test.ts
│   │       │   │   ├── session-cost-usage.ts
│   │       │   │   ├── session-cost-usage.types.ts
│   │       │   │   ├── session-maintenance-warning.ts
│   │       │   │   ├── shell-env.test.ts
│   │       │   │   ├── shell-env.ts
│   │       │   │   ├── skills-remote.test.ts
│   │       │   │   ├── skills-remote.ts
│   │       │   │   ├── ssh-config.test.ts
│   │       │   │   ├── ssh-config.ts
│   │       │   │   ├── ssh-tunnel.ts
│   │       │   │   ├── state-migrations.fs.ts
│   │       │   │   ├── state-migrations.state-dir.test.ts
│   │       │   │   ├── state-migrations.ts
│   │       │   │   ├── system-events.test.ts
│   │       │   │   ├── system-events.ts
│   │       │   │   ├── system-message.test.ts
│   │       │   │   ├── system-message.ts
│   │       │   │   ├── system-presence.test.ts
│   │       │   │   ├── system-presence.ts
│   │       │   │   ├── system-presence.version.test.ts
│   │       │   │   ├── system-run-command.contract.test.ts
│   │       │   │   ├── system-run-command.test.ts
│   │       │   │   ├── system-run-command.ts
│   │       │   │   ├── tailnet.ts
│   │       │   │   ├── tailscale.test.ts
│   │       │   │   ├── tailscale.ts
│   │       │   │   ├── tls
│   │       │   │   ├── tmp-openclaw-dir.test.ts
│   │       │   │   ├── tmp-openclaw-dir.ts
│   │       │   │   ├── transport-ready.test.ts
│   │       │   │   ├── transport-ready.ts
│   │       │   │   ├── unhandled-rejections.fatal-detection.test.ts
│   │       │   │   ├── unhandled-rejections.test.ts
│   │       │   │   ├── unhandled-rejections.ts
│   │       │   │   ├── update-channels.test.ts
│   │       │   │   ├── update-channels.ts
│   │       │   │   ├── update-check.test.ts
│   │       │   │   ├── update-check.ts
│   │       │   │   ├── update-global.ts
│   │       │   │   ├── update-runner.test.ts
│   │       │   │   ├── update-runner.ts
│   │       │   │   ├── update-startup.test.ts
│   │       │   │   ├── update-startup.ts
│   │       │   │   ├── voicewake.ts
│   │       │   │   ├── warning-filter.test.ts
│   │       │   │   ├── warning-filter.ts
│   │       │   │   ├── watch-node.test.ts
│   │       │   │   ├── widearea-dns.test.ts
│   │       │   │   ├── widearea-dns.ts
│   │       │   │   ├── ws.ts
│   │       │   │   └── wsl.ts
│   │       │   ├── line
│   │       │   │   ├── accounts.test.ts
│   │       │   │   ├── accounts.ts
│   │       │   │   ├── actions.ts
│   │       │   │   ├── auto-reply-delivery.test.ts
│   │       │   │   ├── auto-reply-delivery.ts
│   │       │   │   ├── bot-access.ts
│   │       │   │   ├── bot-handlers.test.ts
│   │       │   │   ├── bot-handlers.ts
│   │       │   │   ├── bot-message-context.test.ts
│   │       │   │   ├── bot-message-context.ts
│   │       │   │   ├── bot.ts
│   │       │   │   ├── channel-access-token.ts
│   │       │   │   ├── config-schema.ts
│   │       │   │   ├── download.test.ts
│   │       │   │   ├── download.ts
│   │       │   │   ├── flex-templates
│   │       │   │   ├── flex-templates.test.ts
│   │       │   │   ├── flex-templates.ts
│   │       │   │   ├── markdown-to-line.test.ts
│   │       │   │   ├── markdown-to-line.ts
│   │       │   │   ├── monitor.fail-closed.test.ts
│   │       │   │   ├── monitor.lifecycle.test.ts
│   │       │   │   ├── monitor.read-body.test.ts
│   │       │   │   ├── monitor.ts
│   │       │   │   ├── probe.test.ts
│   │       │   │   ├── probe.ts
│   │       │   │   ├── reply-chunks.test.ts
│   │       │   │   ├── reply-chunks.ts
│   │       │   │   ├── rich-menu.test.ts
│   │       │   │   ├── rich-menu.ts
│   │       │   │   ├── send.test.ts
│   │       │   │   ├── send.ts
│   │       │   │   ├── signature.ts
│   │       │   │   ├── template-messages.test.ts
│   │       │   │   ├── template-messages.ts
│   │       │   │   ├── types.ts
│   │       │   │   ├── webhook-node.test.ts
│   │       │   │   ├── webhook-node.ts
│   │       │   │   ├── webhook-utils.ts
│   │       │   │   ├── webhook.test.ts
│   │       │   │   └── webhook.ts
│   │       │   ├── link-understanding
│   │       │   │   ├── apply.ts
│   │       │   │   ├── defaults.ts
│   │       │   │   ├── detect.test.ts
│   │       │   │   ├── detect.ts
│   │       │   │   ├── format.ts
│   │       │   │   └── runner.ts
│   │       │   ├── logger.test.ts
│   │       │   ├── logger.ts
│   │       │   ├── logging
│   │       │   │   ├── config.ts
│   │       │   │   ├── console-capture.test.ts
│   │       │   │   ├── console-settings.test.ts
│   │       │   │   ├── console-timestamp.test.ts
│   │       │   │   ├── console.ts
│   │       │   │   ├── diagnostic-session-state.ts
│   │       │   │   ├── diagnostic.test.ts
│   │       │   │   ├── diagnostic.ts
│   │       │   │   ├── env-log-level.ts
│   │       │   │   ├── levels.ts
│   │       │   │   ├── log-file-size-cap.test.ts
│   │       │   │   ├── logger-env.test.ts
│   │       │   │   ├── logger.ts
│   │       │   │   ├── node-require.ts
│   │       │   │   ├── parse-log-line.test.ts
│   │       │   │   ├── parse-log-line.ts
│   │       │   │   ├── redact-identifier.ts
│   │       │   │   ├── redact.test.ts
│   │       │   │   ├── redact.ts
│   │       │   │   ├── state.ts
│   │       │   │   ├── subsystem.test.ts
│   │       │   │   ├── subsystem.ts
│   │       │   │   ├── timestamps.test.ts
│   │       │   │   └── timestamps.ts
│   │       │   ├── logging.ts
│   │       │   ├── markdown
│   │       │   │   ├── code-spans.ts
│   │       │   │   ├── fences.ts
│   │       │   │   ├── frontmatter.test.ts
│   │       │   │   ├── frontmatter.ts
│   │       │   │   ├── ir.blockquote-spacing.test.ts
│   │       │   │   ├── ir.hr-spacing.test.ts
│   │       │   │   ├── ir.nested-lists.test.ts
│   │       │   │   ├── ir.table-bullets.test.ts
│   │       │   │   ├── ir.table-code.test.ts
│   │       │   │   ├── ir.ts
│   │       │   │   ├── render.ts
│   │       │   │   ├── tables.ts
│   │       │   │   ├── whatsapp.test.ts
│   │       │   │   └── whatsapp.ts
│   │       │   ├── media
│   │       │   │   ├── audio-tags.ts
│   │       │   │   ├── audio.test.ts
│   │       │   │   ├── audio.ts
│   │       │   │   ├── base64.test.ts
│   │       │   │   ├── base64.ts
│   │       │   │   ├── constants.ts
│   │       │   │   ├── fetch.test.ts
│   │       │   │   ├── fetch.ts
│   │       │   │   ├── host.test.ts
│   │       │   │   ├── host.ts
│   │       │   │   ├── image-ops.helpers.test.ts
│   │       │   │   ├── image-ops.ts
│   │       │   │   ├── inbound-path-policy.test.ts
│   │       │   │   ├── inbound-path-policy.ts
│   │       │   │   ├── input-files.fetch-guard.test.ts
│   │       │   │   ├── input-files.ts
│   │       │   │   ├── local-roots.ts
│   │       │   │   ├── mime.test.ts
│   │       │   │   ├── mime.ts
│   │       │   │   ├── outbound-attachment.ts
│   │       │   │   ├── parse.test.ts
│   │       │   │   ├── parse.ts
│   │       │   │   ├── png-encode.ts
│   │       │   │   ├── read-response-with-limit.ts
│   │       │   │   ├── server.test.ts
│   │       │   │   ├── server.ts
│   │       │   │   ├── sniff-mime-from-base64.ts
│   │       │   │   ├── store.redirect.test.ts
│   │       │   │   ├── store.test.ts
│   │       │   │   └── store.ts
│   │       │   ├── media-understanding
│   │       │   │   ├── apply.test.ts
│   │       │   │   ├── apply.ts
│   │       │   │   ├── attachments.ts
│   │       │   │   ├── audio-preflight.ts
│   │       │   │   ├── concurrency.ts
│   │       │   │   ├── defaults.test.ts
│   │       │   │   ├── defaults.ts
│   │       │   │   ├── errors.ts
│   │       │   │   ├── format.test.ts
│   │       │   │   ├── format.ts
│   │       │   │   ├── fs.ts
│   │       │   │   ├── media-understanding-misc.test.ts
│   │       │   │   ├── output-extract.ts
│   │       │   │   ├── providers
│   │       │   │   ├── resolve.test.ts
│   │       │   │   ├── resolve.ts
│   │       │   │   ├── runner.auto-audio.test.ts
│   │       │   │   ├── runner.deepgram.test.ts
│   │       │   │   ├── runner.entries.ts
│   │       │   │   ├── runner.test-utils.ts
│   │       │   │   ├── runner.ts
│   │       │   │   ├── runner.video.test.ts
│   │       │   │   ├── runner.vision-skip.test.ts
│   │       │   │   ├── scope.ts
│   │       │   │   ├── types.ts
│   │       │   │   └── video.ts
│   │       │   ├── memory
│   │       │   │   ├── backend-config.test.ts
│   │       │   │   ├── backend-config.ts
│   │       │   │   ├── batch-error-utils.test.ts
│   │       │   │   ├── batch-error-utils.ts
│   │       │   │   ├── batch-gemini.ts
│   │       │   │   ├── batch-http.test.ts
│   │       │   │   ├── batch-http.ts
│   │       │   │   ├── batch-openai.ts
│   │       │   │   ├── batch-output.test.ts
│   │       │   │   ├── batch-output.ts
│   │       │   │   ├── batch-provider-common.ts
│   │       │   │   ├── batch-runner.ts
│   │       │   │   ├── batch-upload.ts
│   │       │   │   ├── batch-utils.ts
│   │       │   │   ├── batch-voyage.test.ts
│   │       │   │   ├── batch-voyage.ts
│   │       │   │   ├── embedding-chunk-limits.test.ts
│   │       │   │   ├── embedding-chunk-limits.ts
│   │       │   │   ├── embedding-input-limits.ts
│   │       │   │   ├── embedding-manager.test-harness.ts
│   │       │   │   ├── embedding-model-limits.ts
│   │       │   │   ├── embedding.test-mocks.ts
│   │       │   │   ├── embeddings-debug.ts
│   │       │   │   ├── embeddings-gemini.ts
│   │       │   │   ├── embeddings-mistral.test.ts
│   │       │   │   ├── embeddings-mistral.ts
│   │       │   │   ├── embeddings-openai.ts
│   │       │   │   ├── embeddings-remote-client.ts
│   │       │   │   ├── embeddings-remote-fetch.test.ts
│   │       │   │   ├── embeddings-remote-fetch.ts
│   │       │   │   ├── embeddings-remote-provider.ts
│   │       │   │   ├── embeddings-voyage.test.ts
│   │       │   │   ├── embeddings-voyage.ts
│   │       │   │   ├── embeddings.test.ts
│   │       │   │   ├── embeddings.ts
│   │       │   │   ├── fs-utils.ts
│   │       │   │   ├── hybrid.test.ts
│   │       │   │   ├── hybrid.ts
│   │       │   │   ├── index.test.ts
│   │       │   │   ├── index.ts
│   │       │   │   ├── internal.test.ts
│   │       │   │   ├── internal.ts
│   │       │   │   ├── manager-embedding-ops.ts
│   │       │   │   ├── manager-search.ts
│   │       │   │   ├── manager-sync-ops.ts
│   │       │   │   ├── manager.async-search.test.ts
│   │       │   │   ├── manager.atomic-reindex.test.ts
│   │       │   │   ├── manager.batch.test.ts
│   │       │   │   ├── manager.embedding-batches.test.ts
│   │       │   │   ├── manager.mistral-provider.test.ts
│   │       │   │   ├── manager.read-file.test.ts
│   │       │   │   ├── manager.sync-errors-do-not-crash.test.ts
│   │       │   │   ├── manager.ts
│   │       │   │   ├── manager.vector-dedupe.test.ts
│   │       │   │   ├── manager.watcher-config.test.ts
│   │       │   │   ├── memory-schema.ts
│   │       │   │   ├── mmr.test.ts
│   │       │   │   ├── mmr.ts
│   │       │   │   ├── node-llama.ts
│   │       │   │   ├── post-json.test.ts
│   │       │   │   ├── post-json.ts
│   │       │   │   ├── qmd-manager.test.ts
│   │       │   │   ├── qmd-manager.ts
│   │       │   │   ├── qmd-query-parser.test.ts
│   │       │   │   ├── qmd-query-parser.ts
│   │       │   │   ├── qmd-scope.test.ts
│   │       │   │   ├── qmd-scope.ts
│   │       │   │   ├── query-expansion.test.ts
│   │       │   │   ├── query-expansion.ts
│   │       │   │   ├── remote-http.ts
│   │       │   │   ├── search-manager.test.ts
│   │       │   │   ├── search-manager.ts
│   │       │   │   ├── session-files.test.ts
│   │       │   │   ├── session-files.ts
│   │       │   │   ├── sqlite-vec.ts
│   │       │   │   ├── sqlite.ts
│   │       │   │   ├── status-format.ts
│   │       │   │   ├── temporal-decay.test.ts
│   │       │   │   ├── temporal-decay.ts
│   │       │   │   ├── test-embeddings-mock.ts
│   │       │   │   ├── test-manager-helpers.ts
│   │       │   │   ├── test-manager.ts
│   │       │   │   ├── test-runtime-mocks.ts
│   │       │   │   └── types.ts
│   │       │   ├── node-host
│   │       │   │   ├── config.ts
│   │       │   │   ├── exec-policy.test.ts
│   │       │   │   ├── exec-policy.ts
│   │       │   │   ├── invoke-browser.ts
│   │       │   │   ├── invoke-system-run.test.ts
│   │       │   │   ├── invoke-system-run.ts
│   │       │   │   ├── invoke-types.ts
│   │       │   │   ├── invoke.sanitize-env.test.ts
│   │       │   │   ├── invoke.ts
│   │       │   │   ├── runner.ts
│   │       │   │   └── with-timeout.ts
│   │       │   ├── pairing
│   │       │   │   ├── pairing-labels.ts
│   │       │   │   ├── pairing-messages.test.ts
│   │       │   │   ├── pairing-messages.ts
│   │       │   │   ├── pairing-store.test.ts
│   │       │   │   ├── pairing-store.ts
│   │       │   │   ├── setup-code.test.ts
│   │       │   │   └── setup-code.ts
│   │       │   ├── plugin-sdk
│   │       │   │   ├── account-id.ts
│   │       │   │   ├── agent-media-payload.ts
│   │       │   │   ├── allow-from.test.ts
│   │       │   │   ├── allow-from.ts
│   │       │   │   ├── command-auth.ts
│   │       │   │   ├── config-paths.ts
│   │       │   │   ├── file-lock.ts
│   │       │   │   ├── group-access.test.ts
│   │       │   │   ├── group-access.ts
│   │       │   │   ├── index.test.ts
│   │       │   │   ├── index.ts
│   │       │   │   ├── json-store.ts
│   │       │   │   ├── onboarding.ts
│   │       │   │   ├── persistent-dedupe.test.ts
│   │       │   │   ├── persistent-dedupe.ts
│   │       │   │   ├── provider-auth-result.ts
│   │       │   │   ├── reply-payload.ts
│   │       │   │   ├── run-command.ts
│   │       │   │   ├── runtime.ts
│   │       │   │   ├── slack-message-actions.ts
│   │       │   │   ├── status-helpers.test.ts
│   │       │   │   ├── status-helpers.ts
│   │       │   │   ├── temp-path.test.ts
│   │       │   │   ├── temp-path.ts
│   │       │   │   ├── text-chunking.test.ts
│   │       │   │   ├── text-chunking.ts
│   │       │   │   ├── tool-send.ts
│   │       │   │   ├── webhook-path.ts
│   │       │   │   ├── webhook-targets.test.ts
│   │       │   │   └── webhook-targets.ts
│   │       │   ├── plugins
│   │       │   │   ├── bundled-dir.ts
│   │       │   │   ├── cli.test.ts
│   │       │   │   ├── cli.ts
│   │       │   │   ├── commands.ts
│   │       │   │   ├── config-schema.ts
│   │       │   │   ├── config-state.test.ts
│   │       │   │   ├── config-state.ts
│   │       │   │   ├── discovery.test.ts
│   │       │   │   ├── discovery.ts
│   │       │   │   ├── enable.test.ts
│   │       │   │   ├── enable.ts
│   │       │   │   ├── hook-runner-global.ts
│   │       │   │   ├── hooks.before-agent-start.test.ts
│   │       │   │   ├── hooks.model-override-wiring.test.ts
│   │       │   │   ├── hooks.phase-hooks.test.ts
│   │       │   │   ├── hooks.test-helpers.ts
│   │       │   │   ├── hooks.ts
│   │       │   │   ├── http-path.ts
│   │       │   │   ├── http-registry.test.ts
│   │       │   │   ├── http-registry.ts
│   │       │   │   ├── install.test.ts
│   │       │   │   ├── install.ts
│   │       │   │   ├── installs.test.ts
│   │       │   │   ├── installs.ts
│   │       │   │   ├── loader.test.ts
│   │       │   │   ├── loader.ts
│   │       │   │   ├── logger.test.ts
│   │       │   │   ├── logger.ts
│   │       │   │   ├── manifest-registry.test.ts
│   │       │   │   ├── manifest-registry.ts
│   │       │   │   ├── manifest.ts
│   │       │   │   ├── path-safety.ts
│   │       │   │   ├── providers.ts
│   │       │   │   ├── registry.ts
│   │       │   │   ├── runtime
│   │       │   │   ├── runtime.ts
│   │       │   │   ├── schema-validator.ts
│   │       │   │   ├── services.test.ts
│   │       │   │   ├── services.ts
│   │       │   │   ├── slots.test.ts
│   │       │   │   ├── slots.ts
│   │       │   │   ├── source-display.test.ts
│   │       │   │   ├── source-display.ts
│   │       │   │   ├── status.ts
│   │       │   │   ├── toggle-config.ts
│   │       │   │   ├── tools.optional.test.ts
│   │       │   │   ├── tools.ts
│   │       │   │   ├── types.ts
│   │       │   │   ├── uninstall.test.ts
│   │       │   │   ├── uninstall.ts
│   │       │   │   ├── update.ts
│   │       │   │   ├── voice-call.plugin.test.ts
│   │       │   │   ├── wired-hooks-after-tool-call.test.ts
│   │       │   │   ├── wired-hooks-compaction.test.ts
│   │       │   │   ├── wired-hooks-gateway.test.ts
│   │       │   │   ├── wired-hooks-llm.test.ts
│   │       │   │   ├── wired-hooks-message.test.ts
│   │       │   │   ├── wired-hooks-session.test.ts
│   │       │   │   └── wired-hooks-subagent.test.ts
│   │       │   ├── polls.test.ts
│   │       │   ├── polls.ts
│   │       │   ├── process
│   │       │   │   ├── child-process-bridge.ts
│   │       │   │   ├── command-queue.test.ts
│   │       │   │   ├── command-queue.ts
│   │       │   │   ├── exec.test.ts
│   │       │   │   ├── exec.ts
│   │       │   │   ├── kill-tree.test.ts
│   │       │   │   ├── kill-tree.ts
│   │       │   │   ├── lanes.ts
│   │       │   │   ├── restart-recovery.ts
│   │       │   │   ├── spawn-utils.test.ts
│   │       │   │   ├── spawn-utils.ts
│   │       │   │   ├── supervisor
│   │       │   │   └── test-timeouts.ts
│   │       │   ├── providers
│   │       │   │   ├── github-copilot-auth.ts
│   │       │   │   ├── github-copilot-models.test.ts
│   │       │   │   ├── github-copilot-models.ts
│   │       │   │   ├── github-copilot-token.test.ts
│   │       │   │   ├── github-copilot-token.ts
│   │       │   │   ├── google-shared.ensures-function-call-comes-after-user-turn.test.ts
│   │       │   │   ├── google-shared.preserves-parameters-type-is-missing.test.ts
│   │       │   │   ├── google-shared.test-helpers.ts
│   │       │   │   ├── kilocode-shared.ts
│   │       │   │   ├── qwen-portal-oauth.test.ts
│   │       │   │   └── qwen-portal-oauth.ts
│   │       │   ├── routing
│   │       │   │   ├── account-id.test.ts
│   │       │   │   ├── account-id.ts
│   │       │   │   ├── account-lookup.test.ts
│   │       │   │   ├── account-lookup.ts
│   │       │   │   ├── bindings.ts
│   │       │   │   ├── resolve-route.test.ts
│   │       │   │   ├── resolve-route.ts
│   │       │   │   ├── session-key.continuity.test.ts
│   │       │   │   ├── session-key.test.ts
│   │       │   │   └── session-key.ts
│   │       │   ├── runtime.ts
│   │       │   ├── scripts
│   │       │   │   └── canvas-a2ui-copy.test.ts
│   │       │   ├── security
│   │       │   │   ├── audit-channel.ts
│   │       │   │   ├── audit-extra.async.ts
│   │       │   │   ├── audit-extra.sync.test.ts
│   │       │   │   ├── audit-extra.sync.ts
│   │       │   │   ├── audit-extra.ts
│   │       │   │   ├── audit-fs.ts
│   │       │   │   ├── audit-tool-policy.ts
│   │       │   │   ├── audit.test.ts
│   │       │   │   ├── audit.ts
│   │       │   │   ├── channel-metadata.ts
│   │       │   │   ├── dangerous-config-flags.ts
│   │       │   │   ├── dangerous-tools.ts
│   │       │   │   ├── dm-policy-shared.test.ts
│   │       │   │   ├── dm-policy-shared.ts
│   │       │   │   ├── external-content.test.ts
│   │       │   │   ├── external-content.ts
│   │       │   │   ├── fix.test.ts
│   │       │   │   ├── fix.ts
│   │       │   │   ├── mutable-allowlist-detectors.ts
│   │       │   │   ├── safe-regex.test.ts
│   │       │   │   ├── safe-regex.ts
│   │       │   │   ├── scan-paths.ts
│   │       │   │   ├── secret-equal.ts
│   │       │   │   ├── skill-scanner.test.ts
│   │       │   │   ├── skill-scanner.ts
│   │       │   │   ├── temp-path-guard.test.ts
│   │       │   │   ├── windows-acl.test.ts
│   │       │   │   └── windows-acl.ts
│   │       │   ├── sessions
│   │       │   │   ├── input-provenance.ts
│   │       │   │   ├── level-overrides.ts
│   │       │   │   ├── model-overrides.ts
│   │       │   │   ├── send-policy.test.ts
│   │       │   │   ├── send-policy.ts
│   │       │   │   ├── session-key-utils.ts
│   │       │   │   ├── session-label.ts
│   │       │   │   └── transcript-events.ts
│   │       │   ├── shared
│   │       │   │   ├── avatar-policy.test.ts
│   │       │   │   ├── avatar-policy.ts
│   │       │   │   ├── chat-content.ts
│   │       │   │   ├── chat-envelope.ts
│   │       │   │   ├── config-eval.test.ts
│   │       │   │   ├── config-eval.ts
│   │       │   │   ├── device-auth.ts
│   │       │   │   ├── entry-metadata.ts
│   │       │   │   ├── entry-status.ts
│   │       │   │   ├── frontmatter.ts
│   │       │   │   ├── gateway-bind-url.ts
│   │       │   │   ├── model-param-b.ts
│   │       │   │   ├── net
│   │       │   │   ├── node-list-parse.test.ts
│   │       │   │   ├── node-list-parse.ts
│   │       │   │   ├── node-list-types.ts
│   │       │   │   ├── node-match.ts
│   │       │   │   ├── operator-scope-compat.test.ts
│   │       │   │   ├── operator-scope-compat.ts
│   │       │   │   ├── pid-alive.test.ts
│   │       │   │   ├── pid-alive.ts
│   │       │   │   ├── process-scoped-map.ts
│   │       │   │   ├── requirements.test.ts
│   │       │   │   ├── requirements.ts
│   │       │   │   ├── shared-misc.test.ts
│   │       │   │   ├── string-normalization.test.ts
│   │       │   │   ├── string-normalization.ts
│   │       │   │   ├── subagents-format.ts
│   │       │   │   ├── tailscale-status.ts
│   │       │   │   ├── text
│   │       │   │   ├── text-chunking.ts
│   │       │   │   └── usage-aggregates.ts
│   │       │   ├── signal
│   │       │   │   ├── accounts.ts
│   │       │   │   ├── client.test.ts
│   │       │   │   ├── client.ts
│   │       │   │   ├── daemon.ts
│   │       │   │   ├── format.chunking.test.ts
│   │       │   │   ├── format.links.test.ts
│   │       │   │   ├── format.test.ts
│   │       │   │   ├── format.ts
│   │       │   │   ├── format.visual.test.ts
│   │       │   │   ├── identity.test.ts
│   │       │   │   ├── identity.ts
│   │       │   │   ├── index.ts
│   │       │   │   ├── monitor
│   │       │   │   ├── monitor.test.ts
│   │       │   │   ├── monitor.tool-result.pairs-uuid-only-senders-uuid-allowlist-entry.test.ts
│   │       │   │   ├── monitor.tool-result.sends-tool-summaries-responseprefix.test.ts
│   │       │   │   ├── monitor.tool-result.test-harness.ts
│   │       │   │   ├── monitor.ts
│   │       │   │   ├── probe.test.ts
│   │       │   │   ├── probe.ts
│   │       │   │   ├── reaction-level.ts
│   │       │   │   ├── rpc-context.ts
│   │       │   │   ├── send-reactions.test.ts
│   │       │   │   ├── send-reactions.ts
│   │       │   │   ├── send.ts
│   │       │   │   └── sse-reconnect.ts
│   │       │   ├── slack
│   │       │   │   ├── accounts.ts
│   │       │   │   ├── actions.blocks.test.ts
│   │       │   │   ├── actions.read.test.ts
│   │       │   │   ├── actions.ts
│   │       │   │   ├── blocks-fallback.test.ts
│   │       │   │   ├── blocks-fallback.ts
│   │       │   │   ├── blocks-input.test.ts
│   │       │   │   ├── blocks-input.ts
│   │       │   │   ├── blocks.test-helpers.ts
│   │       │   │   ├── channel-migration.test.ts
│   │       │   │   ├── channel-migration.ts
│   │       │   │   ├── client.test.ts
│   │       │   │   ├── client.ts
│   │       │   │   ├── directory-live.ts
│   │       │   │   ├── draft-stream.test.ts
│   │       │   │   ├── draft-stream.ts
│   │       │   │   ├── format.test.ts
│   │       │   │   ├── format.ts
│   │       │   │   ├── http
│   │       │   │   ├── index.ts
│   │       │   │   ├── message-actions.ts
│   │       │   │   ├── modal-metadata.test.ts
│   │       │   │   ├── modal-metadata.ts
│   │       │   │   ├── monitor
│   │       │   │   ├── monitor.test-helpers.ts
│   │       │   │   ├── monitor.test.ts
│   │       │   │   ├── monitor.threading.missing-thread-ts.test.ts
│   │       │   │   ├── monitor.tool-result.test.ts
│   │       │   │   ├── monitor.ts
│   │       │   │   ├── probe.ts
│   │       │   │   ├── resolve-channels.test.ts
│   │       │   │   ├── resolve-channels.ts
│   │       │   │   ├── resolve-users.ts
│   │       │   │   ├── scopes.ts
│   │       │   │   ├── send.blocks.test.ts
│   │       │   │   ├── send.ts
│   │       │   │   ├── send.upload.test.ts
│   │       │   │   ├── stream-mode.test.ts
│   │       │   │   ├── stream-mode.ts
│   │       │   │   ├── streaming.ts
│   │       │   │   ├── targets.test.ts
│   │       │   │   ├── targets.ts
│   │       │   │   ├── threading-tool-context.test.ts
│   │       │   │   ├── threading-tool-context.ts
│   │       │   │   ├── threading.test.ts
│   │       │   │   ├── threading.ts
│   │       │   │   ├── token.ts
│   │       │   │   └── types.ts
│   │       │   ├── telegram
│   │       │   │   ├── accounts.test.ts
│   │       │   │   ├── accounts.ts
│   │       │   │   ├── allowed-updates.ts
│   │       │   │   ├── api-logging.ts
│   │       │   │   ├── audit.test.ts
│   │       │   │   ├── audit.ts
│   │       │   │   ├── bot
│   │       │   │   ├── bot-access.ts
│   │       │   │   ├── bot-handlers.ts
│   │       │   │   ├── bot-message-context.audio-transcript.test.ts
│   │       │   │   ├── bot-message-context.dm-threads.test.ts
│   │       │   │   ├── bot-message-context.dm-topic-threadid.test.ts
│   │       │   │   ├── bot-message-context.sender-prefix.test.ts
│   │       │   │   ├── bot-message-context.test-harness.ts
│   │       │   │   ├── bot-message-context.ts
│   │       │   │   ├── bot-message-dispatch.test.ts
│   │       │   │   ├── bot-message-dispatch.ts
│   │       │   │   ├── bot-message.test.ts
│   │       │   │   ├── bot-message.ts
│   │       │   │   ├── bot-native-command-menu.test.ts
│   │       │   │   ├── bot-native-command-menu.ts
│   │       │   │   ├── bot-native-commands.plugin-auth.test.ts
│   │       │   │   ├── bot-native-commands.session-meta.test.ts
│   │       │   │   ├── bot-native-commands.test-helpers.ts
│   │       │   │   ├── bot-native-commands.test.ts
│   │       │   │   ├── bot-native-commands.ts
│   │       │   │   ├── bot-updates.ts
│   │       │   │   ├── bot.create-telegram-bot.test-harness.ts
│   │       │   │   ├── bot.create-telegram-bot.test.ts
│   │       │   │   ├── bot.helpers.test.ts
│   │       │   │   ├── bot.media.downloads-media-file-path-no-file-download.test.ts
│   │       │   │   ├── bot.media.e2e-harness.ts
│   │       │   │   ├── bot.media.stickers-and-fragments.test.ts
│   │       │   │   ├── bot.media.test-utils.ts
│   │       │   │   ├── bot.test.ts
│   │       │   │   ├── bot.ts
│   │       │   │   ├── button-types.ts
│   │       │   │   ├── caption.ts
│   │       │   │   ├── dm-access.ts
│   │       │   │   ├── draft-chunking.test.ts
│   │       │   │   ├── draft-chunking.ts
│   │       │   │   ├── draft-stream.test.ts
│   │       │   │   ├── draft-stream.ts
│   │       │   │   ├── fetch.test.ts
│   │       │   │   ├── fetch.ts
│   │       │   │   ├── format.test.ts
│   │       │   │   ├── format.ts
│   │       │   │   ├── format.wrap-md.test.ts
│   │       │   │   ├── group-access.base-access.test.ts
│   │       │   │   ├── group-access.group-policy.test.ts
│   │       │   │   ├── group-access.ts
│   │       │   │   ├── group-config-helpers.ts
│   │       │   │   ├── group-migration.test.ts
│   │       │   │   ├── group-migration.ts
│   │       │   │   ├── inline-buttons.test.ts
│   │       │   │   ├── inline-buttons.ts
│   │       │   │   ├── lane-delivery.ts
│   │       │   │   ├── model-buttons.test.ts
│   │       │   │   ├── model-buttons.ts
│   │       │   │   ├── monitor.test.ts
│   │       │   │   ├── monitor.ts
│   │       │   │   ├── network-config.test.ts
│   │       │   │   ├── network-config.ts
│   │       │   │   ├── network-errors.test.ts
│   │       │   │   ├── network-errors.ts
│   │       │   │   ├── outbound-params.ts
│   │       │   │   ├── probe.test.ts
│   │       │   │   ├── probe.ts
│   │       │   │   ├── proxy.test.ts
│   │       │   │   ├── proxy.ts
│   │       │   │   ├── reaction-level.test.ts
│   │       │   │   ├── reaction-level.ts
│   │       │   │   ├── reasoning-lane-coordinator.test.ts
│   │       │   │   ├── reasoning-lane-coordinator.ts
│   │       │   │   ├── send.proxy.test.ts
│   │       │   │   ├── send.test-harness.ts
│   │       │   │   ├── send.test.ts
│   │       │   │   ├── send.ts
│   │       │   │   ├── sent-message-cache.ts
│   │       │   │   ├── status-reaction-variants.test.ts
│   │       │   │   ├── status-reaction-variants.ts
│   │       │   │   ├── sticker-cache.test.ts
│   │       │   │   ├── sticker-cache.ts
│   │       │   │   ├── target-writeback.test.ts
│   │       │   │   ├── target-writeback.ts
│   │       │   │   ├── targets.test.ts
│   │       │   │   ├── targets.ts
│   │       │   │   ├── token.test.ts
│   │       │   │   ├── token.ts
│   │       │   │   ├── update-offset-store.test.ts
│   │       │   │   ├── update-offset-store.ts
│   │       │   │   ├── voice.test.ts
│   │       │   │   ├── voice.ts
│   │       │   │   ├── webhook.test.ts
│   │       │   │   └── webhook.ts
│   │       │   ├── terminal
│   │       │   │   ├── ansi.ts
│   │       │   │   ├── health-style.ts
│   │       │   │   ├── links.ts
│   │       │   │   ├── note.ts
│   │       │   │   ├── palette.ts
│   │       │   │   ├── progress-line.ts
│   │       │   │   ├── prompt-select-styled.test.ts
│   │       │   │   ├── prompt-select-styled.ts
│   │       │   │   ├── prompt-style.ts
│   │       │   │   ├── restore.test.ts
│   │       │   │   ├── restore.ts
│   │       │   │   ├── stream-writer.test.ts
│   │       │   │   ├── stream-writer.ts
│   │       │   │   ├── table.test.ts
│   │       │   │   ├── table.ts
│   │       │   │   └── theme.ts
│   │       │   ├── test-helpers
│   │       │   │   ├── ssrf.ts
│   │       │   │   ├── state-dir-env.test.ts
│   │       │   │   ├── state-dir-env.ts
│   │       │   │   └── workspace.ts
│   │       │   ├── test-utils
│   │       │   │   ├── auth-token-assertions.ts
│   │       │   │   ├── channel-plugins.test.ts
│   │       │   │   ├── channel-plugins.ts
│   │       │   │   ├── chunk-test-helpers.ts
│   │       │   │   ├── command-runner.ts
│   │       │   │   ├── env.test.ts
│   │       │   │   ├── env.ts
│   │       │   │   ├── exec-assertions.ts
│   │       │   │   ├── fetch-mock.ts
│   │       │   │   ├── fixture-suite.ts
│   │       │   │   ├── imessage-test-plugin.ts
│   │       │   │   ├── internal-hook-event-payload.ts
│   │       │   │   ├── mock-http-response.ts
│   │       │   │   ├── model-auth-mock.ts
│   │       │   │   ├── model-fallback.mock.ts
│   │       │   │   ├── npm-spec-install-test-helpers.ts
│   │       │   │   ├── ports.ts
│   │       │   │   ├── provider-usage-fetch.ts
│   │       │   │   ├── repo-scan.ts
│   │       │   │   ├── runtime-source-guardrail-scan.ts
│   │       │   │   ├── temp-dir.ts
│   │       │   │   ├── temp-home.test.ts
│   │       │   │   ├── temp-home.ts
│   │       │   │   ├── tracked-temp-dirs.ts
│   │       │   │   ├── typed-cases.ts
│   │       │   │   └── vitest-mock-fn.ts
│   │       │   ├── tts
│   │       │   │   ├── prepare-text.test.ts
│   │       │   │   ├── tts-core.ts
│   │       │   │   ├── tts.test.ts
│   │       │   │   └── tts.ts
│   │       │   ├── tui
│   │       │   │   ├── commands.test.ts
│   │       │   │   ├── commands.ts
│   │       │   │   ├── components
│   │       │   │   ├── gateway-chat.test.ts
│   │       │   │   ├── gateway-chat.ts
│   │       │   │   ├── osc8-hyperlinks.test.ts
│   │       │   │   ├── osc8-hyperlinks.ts
│   │       │   │   ├── theme
│   │       │   │   ├── tui-command-handlers.test.ts
│   │       │   │   ├── tui-command-handlers.ts
│   │       │   │   ├── tui-event-handlers.test.ts
│   │       │   │   ├── tui-event-handlers.ts
│   │       │   │   ├── tui-formatters.test.ts
│   │       │   │   ├── tui-formatters.ts
│   │       │   │   ├── tui-input-history.test.ts
│   │       │   │   ├── tui-local-shell.test.ts
│   │       │   │   ├── tui-local-shell.ts
│   │       │   │   ├── tui-overlays.test.ts
│   │       │   │   ├── tui-overlays.ts
│   │       │   │   ├── tui-session-actions.test.ts
│   │       │   │   ├── tui-session-actions.ts
│   │       │   │   ├── tui-status-summary.ts
│   │       │   │   ├── tui-stream-assembler.test.ts
│   │       │   │   ├── tui-stream-assembler.ts
│   │       │   │   ├── tui-submit-test-helpers.ts
│   │       │   │   ├── tui-types.ts
│   │       │   │   ├── tui-waiting.test.ts
│   │       │   │   ├── tui-waiting.ts
│   │       │   │   ├── tui.submit-handler.test.ts
│   │       │   │   ├── tui.test.ts
│   │       │   │   └── tui.ts
│   │       │   ├── types
│   │       │   │   ├── cli-highlight.d.ts
│   │       │   │   ├── lydell-node-pty.d.ts
│   │       │   │   ├── napi-rs-canvas.d.ts
│   │       │   │   ├── node-edge-tts.d.ts
│   │       │   │   ├── node-llama-cpp.d.ts
│   │       │   │   ├── osc-progress.d.ts
│   │       │   │   ├── pdfjs-dist-legacy.d.ts
│   │       │   │   └── qrcode-terminal.d.ts
│   │       │   ├── utils
│   │       │   │   ├── account-id.ts
│   │       │   │   ├── boolean.ts
│   │       │   │   ├── chunk-items.ts
│   │       │   │   ├── delivery-context.test.ts
│   │       │   │   ├── delivery-context.ts
│   │       │   │   ├── directive-tags.test.ts
│   │       │   │   ├── directive-tags.ts
│   │       │   │   ├── fetch-timeout.ts
│   │       │   │   ├── mask-api-key.test.ts
│   │       │   │   ├── mask-api-key.ts
│   │       │   │   ├── message-channel.test.ts
│   │       │   │   ├── message-channel.ts
│   │       │   │   ├── normalize-secret-input.ts
│   │       │   │   ├── provider-utils.ts
│   │       │   │   ├── queue-helpers.test.ts
│   │       │   │   ├── queue-helpers.ts
│   │       │   │   ├── reaction-level.test.ts
│   │       │   │   ├── reaction-level.ts
│   │       │   │   ├── run-with-concurrency.test.ts
│   │       │   │   ├── run-with-concurrency.ts
│   │       │   │   ├── safe-json.ts
│   │       │   │   ├── shell-argv.ts
│   │       │   │   ├── transcript-tools.test.ts
│   │       │   │   ├── transcript-tools.ts
│   │       │   │   ├── usage-format.test.ts
│   │       │   │   ├── usage-format.ts
│   │       │   │   ├── utils-misc.test.ts
│   │       │   │   └── with-timeout.ts
│   │       │   ├── utils.test.ts
│   │       │   ├── utils.ts
│   │       │   ├── version.test.ts
│   │       │   ├── version.ts
│   │       │   ├── web
│   │       │   │   ├── accounts.test.ts
│   │       │   │   ├── accounts.ts
│   │       │   │   ├── accounts.whatsapp-auth.test.ts
│   │       │   │   ├── active-listener.ts
│   │       │   │   ├── auth-store.ts
│   │       │   │   ├── auto-reply
│   │       │   │   ├── auto-reply.broadcast-groups.broadcasts-sequentially-configured-order.test.ts
│   │       │   │   ├── auto-reply.broadcast-groups.skips-unknown-broadcast-agent-ids-agents-list.test.ts
│   │       │   │   ├── auto-reply.broadcast-groups.test-harness.ts
│   │       │   │   ├── auto-reply.impl.ts
│   │       │   │   ├── auto-reply.test-harness.ts
│   │       │   │   ├── auto-reply.ts
│   │       │   │   ├── auto-reply.typing-controller-idle.test.ts
│   │       │   │   ├── auto-reply.web-auto-reply.compresses-common-formats-jpeg-cap.test.ts
│   │       │   │   ├── auto-reply.web-auto-reply.last-route.test.ts
│   │       │   │   ├── auto-reply.web-auto-reply.monitor-logging.test.ts
│   │       │   │   ├── auto-reply.web-auto-reply.reconnects-after-connection-close.test.ts
│   │       │   │   ├── inbound
│   │       │   │   ├── inbound.media.test.ts
│   │       │   │   ├── inbound.test.ts
│   │       │   │   ├── inbound.ts
│   │       │   │   ├── login-qr.test.ts
│   │       │   │   ├── login-qr.ts
│   │       │   │   ├── login.coverage.test.ts
│   │       │   │   ├── login.test.ts
│   │       │   │   ├── login.ts
│   │       │   │   ├── logout.test.ts
│   │       │   │   ├── media.test.ts
│   │       │   │   ├── media.ts
│   │       │   │   ├── monitor-inbox.allows-messages-from-senders-allowfrom-list.test.ts
│   │       │   │   ├── monitor-inbox.blocks-messages-from-unauthorized-senders-not-allowfrom.test.ts
│   │       │   │   ├── monitor-inbox.captures-media-path-image-messages.test.ts
│   │       │   │   ├── monitor-inbox.streams-inbound-messages.test.ts
│   │       │   │   ├── monitor-inbox.test-harness.ts
│   │       │   │   ├── outbound.test.ts
│   │       │   │   ├── outbound.ts
│   │       │   │   ├── qr-image.ts
│   │       │   │   ├── reconnect.test.ts
│   │       │   │   ├── reconnect.ts
│   │       │   │   ├── session.test.ts
│   │       │   │   ├── session.ts
│   │       │   │   ├── test-helpers.ts
│   │       │   │   └── vcard.ts
│   │       │   ├── whatsapp
│   │       │   │   ├── normalize.test.ts
│   │       │   │   ├── normalize.ts
│   │       │   │   ├── resolve-outbound-target.test.ts
│   │       │   │   └── resolve-outbound-target.ts
│   │       │   └── wizard
│   │       │       ├── clack-prompter.test.ts
│   │       │       ├── clack-prompter.ts
│   │       │       ├── onboarding.completion.test.ts
│   │       │       ├── onboarding.completion.ts
│   │       │       ├── onboarding.finalize.ts
│   │       │       ├── onboarding.gateway-config.test.ts
│   │       │       ├── onboarding.gateway-config.ts
│   │       │       ├── onboarding.test.ts
│   │       │       ├── onboarding.ts
│   │       │       ├── onboarding.types.ts
│   │       │       ├── prompts.ts
│   │       │       ├── session.test.ts
│   │       │       └── session.ts
│   │       ├── test
│   │       │   ├── appcast.test.ts
│   │       │   ├── fixtures
│   │       │   │   ├── child-process-bridge
│   │       │   │   ├── exec-allowlist-shell-parser-parity.json
│   │       │   │   ├── exec-wrapper-resolution-parity.json
│   │       │   │   └── system-run-command-contract.json
│   │       │   ├── gateway.multi.e2e.test.ts
│   │       │   ├── git-hooks-pre-commit.test.ts
│   │       │   ├── global-setup.ts
│   │       │   ├── helpers
│   │       │   │   ├── dispatch-inbound-capture.ts
│   │       │   │   ├── envelope-timestamp.ts
│   │       │   │   ├── fast-short-timeouts.ts
│   │       │   │   ├── gateway-e2e-harness.ts
│   │       │   │   ├── inbound-contract-capture.ts
│   │       │   │   ├── inbound-contract-dispatch-mock.ts
│   │       │   │   ├── inbound-contract.ts
│   │       │   │   ├── memory-tool-manager-mock.ts
│   │       │   │   ├── mock-incoming-request.ts
│   │       │   │   ├── normalize-text.ts
│   │       │   │   ├── paths.ts
│   │       │   │   ├── poll.ts
│   │       │   │   ├── temp-home.ts
│   │       │   │   └── wizard-prompter.ts
│   │       │   ├── mocks
│   │       │   │   └── baileys.ts
│   │       │   ├── scripts
│   │       │   │   ├── check-channel-agnostic-boundaries.test.ts
│   │       │   │   ├── check-no-random-messaging-tmp.test.ts
│   │       │   │   ├── check-no-raw-window-open.test.ts
│   │       │   │   ├── ios-team-id.test.ts
│   │       │   │   └── ui.test.ts
│   │       │   ├── setup.ts
│   │       │   ├── test-env.ts
│   │       │   └── ui.presenter-next-run.test.ts
│   │       ├── tsconfig.json
│   │       ├── tsconfig.plugin-sdk.dts.json
│   │       ├── tsdown.config.ts
│   │       ├── ui
│   │       │   ├── index.html
│   │       │   ├── package.json
│   │       │   ├── public
│   │       │   │   ├── apple-touch-icon.png
│   │       │   │   ├── favicon-32.png
│   │       │   │   ├── favicon.ico
│   │       │   │   └── favicon.svg
│   │       │   ├── src
│   │       │   │   ├── css.d.ts
│   │       │   │   ├── i18n
│   │       │   │   ├── main.ts
│   │       │   │   ├── styles
│   │       │   │   ├── styles.css
│   │       │   │   └── ui
│   │       │   ├── vite.config.ts
│   │       │   ├── vitest.config.ts
│   │       │   └── vitest.node.config.ts
│   │       ├── vitest.config.ts
│   │       ├── vitest.e2e.config.ts
│   │       ├── vitest.extensions.config.ts
│   │       ├── vitest.gateway.config.ts
│   │       ├── vitest.live.config.ts
│   │       ├── vitest.unit.config.ts
│   │       └── zizmor.yml
│   ├── strategy
│   │   ├── DEPENDENCY_STACK_MAP.json
│   │   ├── DEPENDENCY_STACK_MAP.mmd
│   │   ├── FEATURE_VALUE_MATRIX.md
│   │   ├── RISK_SECURITY_HEATMAP.md
│   │   ├── STRATEGIC_ALIGNMENT_REPORT.md
│   │   ├── STRATEGIC_RECOMMENDATIONS.json
│   │   ├── STRATEGIC_RECOMMENDATIONS.md
│   │   └── USE_CASE_REPOSITORY.md
│   └── use_cases
│       └── USE_CASES.md
├── ops
│   └── cron
│       ├── .github
│       │   └── workflows
│       │       └── isa-news-cron.yml
│       ├── 00-START-HERE.md
│       ├── README.md
│       ├── cron-job.org-instructions.md
│       ├── curl-test-config.txt
│       ├── curl-test-instructions.md
│       ├── easycron-instructions.md
│       └── github-actions-instructions.md
├── package.json
├── patches
│   └── wouter@3.7.1.patch
├── pnpm-lock.yaml
├── scripts
│   ├── audit
│   │   └── repo_assessment.sh
│   ├── check-columns.ts
│   ├── check-db-status.ts
│   ├── check-env.js
│   ├── compute_advisory_diff.cjs
│   ├── copilot
│   │   └── automerge_prs.sh
│   ├── create-dutch-initiatives-tables.sql
│   ├── create-esrs-tables.ts
│   ├── cron-generate-embeddings.sh
│   ├── datasets
│   │   ├── build_registry.py
│   │   ├── create_gs1_eu_pcf_tables.sql
│   │   ├── generate_inventory.py
│   │   ├── ingest_gs1_eu_pcf_attributes.sql
│   │   └── ingest_gs1_eu_pcf_code_lists.sql
│   ├── dev
│   │   ├── auto-sync-q-branch.sh
│   │   ├── get-scope-stats.mjs
│   │   ├── local-doctor.sh
│   │   ├── manus-readiness-precheck.py
│   │   ├── run-pipeline-verbose.mjs
│   │   ├── setup-q-branch.sh
│   │   ├── test-db-ssl.mjs
│   │   ├── test-efrag-detail.mjs
│   │   ├── test-efrag-pipeline.mjs
│   │   └── test-xml-parser.mjs
│   ├── docker-down.sh
│   ├── docker-up.sh
│   ├── docs
│   │   └── ref_index.ts
│   ├── env-check.ts
│   ├── env-discover.sh
│   ├── env-sync-vm.sh
│   ├── env-validate.sh
│   ├── eval
│   │   ├── adapters
│   │   │   ├── advisory.cjs
│   │   │   ├── ask-isa.cjs
│   │   │   ├── catalog.cjs
│   │   │   ├── esrs-mapping.cjs
│   │   │   ├── knowledge-base.cjs
│   │   │   └── news-hub.cjs
│   │   ├── assert-capability-thresholds.cjs
│   │   ├── drift-detect.cjs
│   │   ├── generate-baseline-candidate.cjs
│   │   ├── lib
│   │   │   ├── common.cjs
│   │   │   └── runtime-probes.cjs
│   │   ├── resolve-baseline-path.cjs
│   │   └── run-capability-evals.cjs
│   ├── extract_advisory_v1.py
│   ├── gates
│   │   ├── canonical-contract-drift.sh
│   │   ├── canonical-docs-allowlist.sh
│   │   ├── doc-code-validator.sh
│   │   ├── governance-gate.sh
│   │   ├── manifest-ownership-drift.py
│   │   ├── no-console-gate.sh
│   │   ├── observability-contract.sh
│   │   ├── openclaw-browser-policy.sh
│   │   ├── openclaw-exec-policy.sh
│   │   ├── openclaw-policy-envelope.sh
│   │   ├── openclaw-skills-allowlist.sh
│   │   ├── perf-smoke.sh
│   │   ├── reliability-smoke.sh
│   │   ├── security-gate.sh
│   │   ├── security-secrets-scan.sh
│   │   ├── slo-policy-check.sh
│   │   └── validate-proof-artifacts.sh
│   ├── generate-api-docs.ts
│   ├── generate_embeddings_standalone.ts
│   ├── ingest_fashion_dpp_content.py
│   ├── ingest_gs1nl_content.py
│   ├── ingest_gs1nl_sector_content.py
│   ├── ingest_sustainability_content.py
│   ├── ingestion
│   │   └── news
│   │       ├── check-news-dates.mjs
│   │       ├── debug-scraper.mjs
│   │       ├── populate-live-news.mjs
│   │       ├── populate-simple.mjs
│   │       ├── seed-news.mjs
│   │       ├── test-news-pipeline.mjs
│   │       ├── test-playwright-scraper.mjs
│   │       └── test-scraper.mjs
│   ├── iron-context.sh
│   ├── iron-inventory.sh
│   ├── isa-catalogue
│   │   ├── export_run_to_repo.sh
│   │   ├── generate_legacy_artefacts.py
│   │   └── iron_gate_catalogue.sh
│   ├── migrate-scraper-health.sql
│   ├── openclaw-bootstrap.sh
│   ├── openclaw-dashboard-url.sh
│   ├── openclaw-doctor.sh
│   ├── openclaw-isa-dev-start.sh
│   ├── openclaw-safe-exec.sh
│   ├── openclaw-skill-admit.sh
│   ├── openclaw-skill-install.sh
│   ├── openclaw-status.sh
│   ├── openclaw-trusted-proxies.sh
│   ├── openclaw-tunnel.sh
│   ├── openclaw-ui.sh
│   ├── openclaw-validate-no-secrets.sh
│   ├── parse_gs1nl_datamodel.py
│   ├── phase3_synthesis.py
│   ├── probe
│   │   ├── advisory_health.sh
│   │   ├── ask_isa_smoke.py
│   │   ├── catalog_health.sh
│   │   ├── esrs_mapping_health.sh
│   │   ├── knowledge_base_health.sh
│   │   └── news_hub_health.sh
│   ├── proto_crawl_catalogue.py
│   ├── refactor
│   │   ├── phase_0_final_pass.py
│   │   ├── phase_0_inventory.py
│   │   ├── phase_0_refine.py
│   │   ├── phase_0_ultra.py
│   │   ├── phase_1_contracts.py
│   │   ├── phase_2_execute.py
│   │   ├── phase_2_plan.py
│   │   ├── phase_3_quality.py
│   │   ├── phase_4_automation.py
│   │   ├── phase_5_final_lock.py
│   │   ├── score_contract_completeness.py
│   │   ├── semantic_validator.py
│   │   └── validate_gates.sh
│   ├── release-artifacts.sh
│   ├── run-all-ingestion.ts
│   ├── run-ci-tests.sh
│   ├── run-esrs-ingest.ts
│   ├── run-integration-tests.sh
│   ├── run-migration-simple.ts
│   ├── run-migration.ts
│   ├── run-rag-evaluation-fixtures.cjs
│   ├── run-rag-evaluation.cjs
│   ├── run-unit-tests.sh
│   ├── seed-golden-qa-pairs.cjs
│   ├── seed-regulatory-change-log-sql.txt
│   ├── seed-regulatory-change-log.ts
│   ├── smoke.sh
│   ├── sre
│   │   ├── generate-error-budget-status.ts
│   │   └── generate-evidence-catalogue.ts
│   ├── test-report.ts
│   ├── validate_advisory.py
│   ├── validate_advisory_schema.cjs
│   ├── validate_cluster_registry.py
│   ├── validate_gs1_efrag_catalogue.py
│   ├── validate_isa_deep_research_2026_02_15.sh
│   ├── validate_mcp_agent_readiness.sh
│   ├── validate_mcp_connectivity.sh
│   ├── validate_oss_benchmarks_2026_02_15.sh
│   ├── validate_planning_and_traceability.py
│   ├── validate_specs.py
│   ├── validation
│   │   ├── check-columns.ts
│   │   ├── check-error-ledger.ts
│   │   ├── check-pipeline-log.ts
│   │   ├── check-pipeline-table.ts
│   │   ├── check-table.ts
│   │   ├── test-db-connection.ts
│   │   └── test-pipeline-run.ts
│   ├── verify-data-files.ts
│   ├── verify_catalogue_entrypoints.py
│   └── vm-run.sh
├── server
│   ├── _core
│   │   ├── context.ts
│   │   ├── cookies.ts
│   │   ├── dataApi.ts
│   │   ├── embedding.ts
│   │   ├── env.ts
│   │   ├── error-tracking.ts
│   │   ├── imageGeneration.ts
│   │   ├── index.ts
│   │   ├── llm.ts
│   │   ├── logger-wiring.ts
│   │   ├── map.ts
│   │   ├── notification.ts
│   │   ├── oauth.ts
│   │   ├── otel.ts
│   │   ├── performance-monitoring.ts
│   │   ├── rate-limit.ts
│   │   ├── request-context.ts
│   │   ├── sdk.ts
│   │   ├── security-headers.ts
│   │   ├── systemRouter.ts
│   │   ├── trace-id.test.ts
│   │   ├── trace-id.ts
│   │   ├── trpc.ts
│   │   ├── types
│   │   │   ├── cookie.d.ts
│   │   │   └── manusTypes.ts
│   │   ├── vite.ts
│   │   └── voiceTranscription.ts
│   ├── admin-analytics.test.ts
│   ├── advisory-diff.test.ts
│   ├── advisory-report-export.test.ts
│   ├── advisory-report-export.ts
│   ├── alert-detection.ts
│   ├── alert-monitoring-cron.ts
│   ├── alert-notification-service.ts
│   ├── alert-system.test.ts
│   ├── ask-isa-cache.ts
│   ├── ask-isa-guardrails.test.ts
│   ├── ask-isa-guardrails.ts
│   ├── ask-isa-integration.test.ts
│   ├── ask-isa-query-library.ts
│   ├── attribute-recommender.test.ts
│   ├── attribute-recommender.ts
│   ├── auth.logout.test.ts
│   ├── authority-model.test.ts
│   ├── authority-model.ts
│   ├── batch-epcis-processor.ts
│   ├── batch-generate-esrs-mappings.ts
│   ├── bm25-search.ts
│   ├── cellar-ingestion-scheduler.mjs
│   ├── check-regulations.ts
│   ├── citation-validation.ts
│   ├── claim-citation-verifier.test.ts
│   ├── claim-citation-verifier.ts
│   ├── collaboration-notifications.ts
│   ├── compliance-scoring.ts
│   ├── coverage-analytics.test.ts
│   ├── create-attribute-mappings.ts
│   ├── create-multi-sector-mappings.ts
│   ├── cron-endpoint.ts
│   ├── cron-monitoring-simple.ts
│   ├── cron-monitoring.ts.disabled
│   ├── cron-scheduler.ts
│   ├── cron-secret-validation.test.ts
│   ├── cron.test.ts
│   ├── data-quality.test.ts
│   ├── db-advisory-reports.ts
│   ├── db-connection.ts
│   ├── db-coverage-analytics.ts
│   ├── db-data-quality.ts
│   ├── db-dataset-registry.ts
│   ├── db-error-tracking.test.ts
│   ├── db-error-tracking.ts
│   ├── db-esg-artefacts.ts
│   ├── db-esrs-gs1-mapping.ts
│   ├── db-governance-documents.ts
│   ├── db-health-guard.test.ts
│   ├── db-knowledge-vector.ts
│   ├── db-knowledge.ts
│   ├── db-news-helpers-additions.ts
│   ├── db-news-helpers.ts
│   ├── db-performance-tracking.test.ts
│   ├── db-performance-tracking.ts
│   ├── db-pipeline-observability.ts
│   ├── db-recommendations.ts
│   ├── db-regulatory-change-log.ts
│   ├── db.ts
│   ├── dutch-initiatives.test.ts
│   ├── efrag-ig3-parser.ts
│   ├── efrag-xbrl-parser.ts
│   ├── email-notification-triggers.ts
│   ├── email-notifications.ts
│   ├── email-service.ts
│   ├── embedding.test.ts
│   ├── embedding.ts
│   ├── epcis-schema.json
│   ├── esrs-gs1-mapping.test.ts
│   ├── esrs.test.ts
│   ├── evaluation
│   │   ├── evaluation-harness.test.ts
│   │   ├── evaluation-harness.ts
│   │   └── golden-set.ts
│   ├── evaluation-history.ts
│   ├── event-procedures.test.ts
│   ├── export-enhancements.test.ts
│   ├── export-router.ts
│   ├── export-scheduler.ts
│   ├── export-utils-branded.ts
│   ├── export-utils.ts
│   ├── export.test.ts
│   ├── gap-reasoning.test.ts
│   ├── gap-reasoning.ts
│   ├── generate-embeddings-enhanced.ts
│   ├── generate-embeddings-optimized.ts
│   ├── github-pat-validation.test.ts
│   ├── gs1-benelux-parser.ts
│   ├── gs1-diy-parser.ts
│   ├── gs1-mapping-engine.test.ts
│   ├── gs1-mapping-engine.ts
│   ├── gs1-nl-content.test.ts
│   ├── gs1-standards-router.ts
│   ├── gs1-web-vocab-parser.ts
│   ├── health.test.ts
│   ├── health.ts
│   ├── hybrid-search.test.ts
│   ├── hybrid-search.ts
│   ├── ingest
│   │   ├── INGEST-02_gdsn_current.ts
│   │   ├── INGEST-03_esrs_datapoints.test.ts
│   │   ├── INGEST-03_esrs_datapoints.ts
│   │   ├── INGEST-03_esrs_datapoints_README.md
│   │   ├── INGEST-04_ctes_kdes.ts
│   │   ├── INGEST-05_dpp_rules.ts
│   │   ├── INGEST-06_cbv_digital_link.ts
│   │   └── _core
│   │       ├── provenance.test.ts
│   │       └── provenance.ts
│   ├── ingest-gs1-nl-complete.ts
│   ├── ingest-gs1-standards.ts
│   ├── ingest-validation-rules.ts
│   ├── inspect-efrag-excel.ts
│   ├── knowledge-vector-search.ts
│   ├── load-gs1-attribute-mappings.ts
│   ├── load-gs1-esrs-mappings.ts
│   ├── mapping-feedback.test.ts
│   ├── mappings
│   │   ├── README.md
│   │   ├── esrs-gs1-mapping-data.ts
│   │   ├── esrs-to-gs1-mapper.test.ts
│   │   └── esrs-to-gs1-mapper.ts
│   ├── news
│   │   ├── news-fetch-utils.test.ts
│   │   ├── news-fetch-utils.ts
│   │   ├── news-scraper-eurlex.test.ts
│   │   ├── news-scraper-eurlex.ts
│   │   ├── news-scraper-greendeal.ts
│   │   ├── news-scraper-gs1eu.ts
│   │   └── news-scraper-zes.ts
│   ├── news-admin-router.test.ts
│   ├── news-admin-router.ts
│   ├── news-ai-processor.test.ts
│   ├── news-ai-processor.ts
│   ├── news-archival.ts
│   ├── news-content-analyzer.ts
│   ├── news-cron-scheduler.ts
│   ├── news-deduplicator.ts
│   ├── news-event-processor.test.ts
│   ├── news-event-processor.ts
│   ├── news-fetcher.ts
│   ├── news-filters.test.ts
│   ├── news-health-monitor.test.ts
│   ├── news-health-monitor.ts
│   ├── news-pipeline-config.ts
│   ├── news-pipeline-db-integration.test.ts
│   ├── news-pipeline-modes.test.ts
│   ├── news-pipeline.test.ts
│   ├── news-pipeline.ts
│   ├── news-recommendation-engine.ts
│   ├── news-recommendations.test.ts
│   ├── news-regulatory-integration.ts
│   ├── news-regulatory-intelligence.test.ts
│   ├── news-retry-health.test.ts
│   ├── news-retry-util.ts
│   ├── news-scraper-efrag.ts
│   ├── news-scraper-gs1nl.ts
│   ├── news-scraper-playwright.ts
│   ├── news-sources-phase3.test.ts
│   ├── news-sources-phase3.ts
│   ├── news-sources.test.ts
│   ├── news-sources.ts
│   ├── observability.test.ts
│   ├── onboarding-progress.ts
│   ├── onboarding.test.ts
│   ├── pipeline-observability.test.ts
│   ├── production-monitoring.test.ts
│   ├── prompts
│   │   ├── ask_isa
│   │   │   ├── ask_isa.test.ts
│   │   │   ├── cite_then_write.ts
│   │   │   ├── context.ts
│   │   │   ├── index.ts
│   │   │   ├── output_contracts.ts
│   │   │   ├── step_policy.ts
│   │   │   ├── system.ts
│   │   │   └── verification.ts
│   │   └── ingestion
│   │       ├── index.ts
│   │       └── system.ts
│   ├── query-clarification.test.ts
│   ├── query-clarification.ts
│   ├── rate-limit.test.ts
│   ├── realtime-notifications.ts
│   ├── reasoning-engine.ts
│   ├── regulation-change-tracker.ts
│   ├── regulation-esrs-mapper.test.ts
│   ├── regulation-esrs-mapper.ts
│   ├── regulatory-change-log.test.ts
│   ├── roadmap-generator.ts
│   ├── router-error-tracking.ts
│   ├── router-performance-tracking.ts
│   ├── routers
│   │   ├── __tests__
│   │   │   └── capability-heartbeat.test.ts
│   │   ├── admin-templates.ts
│   │   ├── advisory-diff.ts
│   │   ├── advisory-reports.test.ts
│   │   ├── advisory-reports.ts
│   │   ├── advisory.ts
│   │   ├── ask-isa-enhanced-routes.ts
│   │   ├── ask-isa-v2.ts
│   │   ├── ask-isa.ts
│   │   ├── attribute-recommender.test.ts
│   │   ├── attribute-recommender.ts
│   │   ├── citation-admin.ts
│   │   ├── compliance-risks.ts
│   │   ├── coverage-analytics.ts
│   │   ├── cron.ts
│   │   ├── dataset-registry.test.ts
│   │   ├── dataset-registry.ts
│   │   ├── dutch-initiatives.ts
│   │   ├── esg-artefacts.ts
│   │   ├── esrs-gs1-mapping.ts
│   │   ├── esrs-roadmap.ts
│   │   ├── esrs.ts
│   │   ├── evaluation.ts
│   │   ├── executive-analytics.ts
│   │   ├── gap-analyzer.ts
│   │   ├── governance-documents.test.ts
│   │   ├── governance-documents.ts
│   │   ├── gs1-attributes-multi-sector.test.ts
│   │   ├── gs1-attributes.test.ts
│   │   ├── gs1-attributes.ts
│   │   ├── gs1nl-attributes.ts
│   │   ├── hub.ts
│   │   ├── insights.ts
│   │   ├── monitoring.ts
│   │   ├── notification-preferences.ts
│   │   ├── observability.ts
│   │   ├── pipeline-observability.ts
│   │   ├── production-monitoring.ts
│   │   ├── realtime.ts
│   │   ├── regulations.ts
│   │   ├── regulatory-change-log.ts
│   │   ├── roadmap-export.ts
│   │   ├── roadmap.ts
│   │   ├── scoring.ts
│   │   ├── scraper-health.test.ts
│   │   ├── scraper-health.ts
│   │   ├── standards-directory.test.ts
│   │   ├── standards-directory.ts
│   │   ├── standards.ts
│   │   ├── templates.ts
│   │   └── user.ts
│   ├── routers-data-quality.ts
│   ├── routers-shape.test.ts
│   ├── routers-webhook-config.ts
│   ├── routers.test.ts
│   ├── routers.ts
│   ├── rss-aggregator-db.mjs
│   ├── rss-aggregator-real.mjs
│   ├── rss-aggregator.mjs
│   ├── run-first-ingestion.test.ts
│   ├── run-gs1-mapping.ts
│   ├── security
│   │   ├── automation-auth.test.ts
│   │   ├── automation-auth.ts
│   │   ├── browser-automation-policy.test.ts
│   │   └── browser-automation-policy.ts
│   ├── seed-demo-data.mjs
│   ├── seed-epcis-events.ts
│   ├── seed-eudr-data.ts
│   ├── seed-gs1-standards.mjs
│   ├── seed-gs1-standards.ts
│   ├── seed-production-regulations.mjs
│   ├── services
│   │   ├── authority-scoring
│   │   │   └── index.ts
│   │   ├── canonical-facts
│   │   │   ├── index 2.ts
│   │   │   └── index.ts
│   │   ├── corpus-governance
│   │   │   ├── index.ts
│   │   │   ├── schema.ts
│   │   │   └── test-ingestion.ts
│   │   ├── corpus-ingestion
│   │   │   └── index.ts
│   │   ├── evidence-analysis
│   │   │   └── index.ts
│   │   ├── news
│   │   │   └── scrapers
│   │   │       ├── efrag-scraper.ts
│   │   │       ├── eu-commission-scraper.ts
│   │   │       └── eurlex-scraper.ts
│   │   ├── rag-metrics
│   │   │   ├── index.ts
│   │   │   ├── source-diversity.ts
│   │   │   └── traceability-score.ts
│   │   └── rag-tracing
│   │       ├── failure-taxonomy.ts
│   │       ├── index.ts
│   │       └── metric-definitions.ts
│   ├── standards-directory.test.ts
│   ├── storage.ts
│   ├── test-helpers
│   │   ├── api-mocks-dryrun.test.ts
│   │   ├── api-mocks.test.ts
│   │   ├── api-mocks.ts
│   │   ├── db-test-utils.insert-id.test.ts
│   │   ├── db-test-utils.test.ts
│   │   └── db-test-utils.ts
│   ├── test-utils
│   │   └── boolean-helpers.ts
│   ├── types
│   │   └── bm25.d.ts
│   ├── utils
│   │   ├── deterministic-json.ts
│   │   ├── pipeline-logger.ts
│   │   ├── server-logger.test.ts
│   │   └── server-logger.ts
│   ├── webhook-notification-service.test.ts
│   ├── webhook-notification-service.ts
│   └── weekly-cellar-ingestion.ts
├── shared
│   ├── _core
│   │   └── errors.ts
│   ├── const.ts
│   ├── epcis-cbv-types.ts
│   ├── gs1-link-types.ts
│   ├── news-tags.ts
│   ├── schemas
│   │   └── advisory-output.schema.json
│   └── types.ts
├── test-results
│   └── ci
│       ├── governance.json
│       ├── observability.json
│       ├── perf.json
│       ├── reliability.json
│       ├── security-gate.json
│       └── slo-policy-check.json
├── todo.md
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
└── vitest.setup.ts

592 directories, 5474 files
```
