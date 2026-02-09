# Repository Tree

Generated on: 2026-02-09T04:54:34Z

```
.
├── .eslintrc.server.json
├── .github
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── workflows
│       ├── catalogue-checks.yml
│       ├── console-check.yml
│       ├── generate-embeddings-optimized.yml
│       ├── generate-embeddings.yml
│       ├── iron-gate.yml.disabled
│       ├── repo-tree.yml
│       ├── update-gs1-efrag-catalogue.yml
│       └── validate-docs.yml
├── .gitignore
├── .gitkeep
├── .markdownlint.json
├── .pat_test
├── .prettierignore
├── .prettierrc
├── AGENT_START_HERE.md
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
├── README.md
├── REPO_TREE.md
├── _golden_gate_roadmaps_move_map.json
├── artifacts
│   └── archives
│       └── EFRAGIG3ListofESRSDataPoints(1)(1).xlsx
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
│       │   ├── LatestNewsPanel.tsx
│       │   ├── ManusDialog.tsx
│       │   ├── Map.tsx
│       │   ├── NavigationMenu.tsx
│       │   ├── NewsCard.tsx
│       │   ├── NewsCardCompact.tsx
│       │   ├── NewsCardSkeleton.tsx
│       │   ├── NewsRecommendationCard.tsx
│       │   ├── NewsTimeline.test.tsx.disabled
│       │   ├── NewsTimeline.tsx
│       │   ├── NewsTimelineItem.tsx
│       │   ├── NotificationCenter.tsx
│       │   ├── PageLayout.tsx
│       │   ├── PipelineStatusBanner.tsx
│       │   ├── RecommendedResources.tsx
│       │   ├── RegulationTimeline.tsx
│       │   ├── SectorFilter.tsx
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
│       │   ├── AdminCellarIngestion.tsx
│       │   ├── AdminCellarSyncMonitor.tsx
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
├── codemods
│   └── replace-console-with-serverLogger.js
├── components.json
├── config
│   ├── catalogue_sources.json
│   ├── governance
│   │   └── golden-gate.policy.json
│   └── isa-catalogue
│       └── policy.json
├── cspell.json
├── data
│   ├── DATASET_METADATA.md
│   ├── adb_release_2.11.csv
│   ├── advisories
│   │   ├── ISA_ADVISORY_DIFF_v1.0_to_v1.0.json
│   │   ├── ISA_ADVISORY_DIFF_v1.0_to_v1.1.json
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
│   │   ├── benelux-diy-datamodel-3.1.34.1-file1.xlsx
│   │   ├── benelux-diy-datamodel-3.1.34.1-file2.xlsx
│   │   ├── benelux-diy-datamodel-3.1.34.1-file3.xlsx
│   │   ├── benelux-fmcg-datamodel-3.1.34.2.xlsx
│   │   ├── benelux-healthcare-datamodel-3.1.31.xlsx
│   │   ├── diy_datamodel_content.json
│   │   ├── fashion_dpp_guidance_content.json
│   │   ├── fmcg_datamodel_content.json
│   │   ├── healthcare_datamodel_content.json
│   │   ├── sustainability_guidance_content.json
│   │   └── toelichting-op-velden-1.23.pdf
│   ├── metadata
│   │   ├── REGISTRY_LOCK.md
│   │   ├── dataset_registry.json
│   │   ├── dataset_registry.schema.json
│   │   ├── dataset_registry_v1.0.0_BACKUP.json
│   │   ├── dataset_registry_v1.0_FROZEN.json
│   │   ├── dataset_registry_v1.3.0_DRAFT.json
│   │   ├── external_repos_archive2.json
│   │   ├── gs1_ref_bundle_registry.json
│   │   └── gs1_style_guide_registry.json
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
│                   ├── gs1-data-source-datamodel-3133.zip
│                   ├── overview_of_validation_rules_for_the_benelux-31334.xlsx
│                   └── supporting
├── db
│   └── sql
│       └── check_esrs_count.sql
├── docs
│   ├── ADVISORY_DIFF_METRICS.md
│   ├── ADVISORY_METHOD.md
│   ├── ADVISORY_OUTPUTS.md
│   ├── ADVISORY_UI_NOTES.md
│   ├── AGENT_COLLABORATION_SUMMARY.md
│   ├── ALERTING_SYSTEM_DESIGN.md
│   ├── ALIGNMENT_CHECK_2026_01_03.md
│   ├── ALTERNATIVE_FUTURES_EXPLORATION.md
│   ├── API_REFERENCE.md
│   ├── ASK_ISA_GUARDRAILS.md
│   ├── ASK_ISA_QUERY_LIBRARY.md
│   ├── ASK_ISA_QUERY_LIBRARY_v1.md
│   ├── ASK_ISA_TEST_RESULTS.md
│   ├── Autonomous_Development_Plan.md
│   ├── BASELINE_V2_DECISION_GRADE.md
│   ├── CELLAR_INGESTION_DEPLOYMENT.md
│   ├── CGPT-01_INTEGRATION_REPORT.md
│   ├── CHANGELOG.md
│   ├── CHANGELOG_FOR_CHATGPT.md
│   ├── CHANGELOG_SUMMARY.md
│   ├── CHATGPT_COLLABORATION_ANALYSIS.md
│   ├── CHATGPT_INTEGRATION_CONTRACT.md
│   ├── CHATGPT_INTEGRATION_WORKFLOW.md
│   ├── CHATGPT_WORK_PARCEL_02_ASK_ISA_EXPANSION.md
│   ├── CHATGPT_WORK_PARCEL_SUMMARY.md
│   ├── CI_TESTING.md
│   ├── CLEANUP_REPORT.md
│   ├── CODEX_DELEGATION_SPEC.md
│   ├── COMPLETION_SUMMARY.md
│   ├── COORDINATION_WORKFLOW.md
│   ├── CRITICAL_EVENTS_TAXONOMY.md
│   ├── CRON_QUICK_START.md
│   ├── CRON_SETUP_GUIDE.md
│   ├── DATASETS_CATALOG.json
│   ├── DATASETS_CATALOG.md
│   ├── DATASET_CANDIDATES_DETAILED.md
│   ├── DATASET_PRIORITY_ANALYSIS.md
│   ├── DAY1_COMPLETION_REPORT.md
│   ├── DECISION_BRIEF_ESRS_SCHEMA_MISMATCH.md
│   ├── DECISION_CONTEXT_ANALYSIS.md
│   ├── DEMO_NARRATIVES.md
│   ├── DEPLOYMENT.md
│   ├── DEPLOYMENT_GUIDE.md
│   ├── DEVELOPMENT_PROGRESS_2026-02-01.md
│   ├── DEVELOPMENT_SESSION_2026-02-01.md
│   ├── Data_Quality_Updates_Plan.md
│   ├── Dutch_Initiatives_Data_Model.md
│   ├── EMBEDDING_OPTIMIZATION_ANALYSIS.md
│   ├── EMBEDDING_PIPELINE_OPTIMIZATION.md
│   ├── EMBEDDING_QUALITY_IMPROVEMENT_REPORT.md
│   ├── EMBEDDING_WORKFLOW_OPTIMIZATION_REPORT.md
│   ├── ENHANCED_EMBEDDING_SCHEMA.md
│   ├── ESG_Hub_MVP_Polish_Plan.md
│   ├── ESG_INTEGRATION_FINAL_REPORT.md
│   ├── FEATURE_DISCOVERY_REPORT.md
│   ├── FILE_SYSTEM_MEMORY_ARCHITECTURE.md
│   ├── FINAL_ISA_GRADE_RESCORE.md
│   ├── FINAL_RESCORE_POST_PIPELINE.md
│   ├── GATING_QUESTIONS_EVIDENCE_INVENTORY.md
│   ├── GITHUB_PROVISIONING_REPORT.md
│   ├── GITHUB_PUSH_WORKFLOW.md
│   ├── GOVERNANCE_FINAL_SUMMARY.md
│   ├── GOVERNANCE_PHASE_2_3_REPORT.md
│   ├── GOVERNANCE_SELF_CHECK_2025-12-17.md
│   ├── GS1_ARTEFACTS_ALIGNMENT_VALIDATION.md
│   ├── GS1_Attribute_Mapper_Technical_Specification.md
│   ├── GS1_BRAND_RESEARCH_NOTES.md
│   ├── GS1_DATA_MODELS.md
│   ├── GS1_DOCUMENTS_DATASETS_ANALYSIS.md
│   ├── GS1_EU_PCF_EXTRACTION_NOTES.md
│   ├── GS1_EU_PCF_INTEGRATION_SUMMARY.md
│   ├── GS1_EU_PCF_TO_ESRS_E1_MAPPINGS.md
│   ├── GS1_STYLE_COMPLIANCE_FINAL_REPORT.md
│   ├── GS1_STYLE_GUIDE_INGESTION_SUMMARY.md
│   ├── GS1_STYLE_QUICK_REFERENCE.md
│   ├── INDEX.md
│   ├── INGESTION_DELEGATION_SUMMARY.md
│   ├── INGESTION_GUIDE.md
│   ├── INSTRUCTION_EVALUATION_ANALYSIS.md
│   ├── ISA_AGENT_COLLABORATION.md
│   ├── ISA_BRAND_POSITIONING.md
│   ├── ISA_COMPARATIVE_REFACTOR_GATE_PLAN.md
│   ├── ISA_DATA_NEEDS_AND_PRIORITIES.md
│   ├── ISA_DELIVERY_MODEL.md
│   ├── ISA_DEVELOPMENT_STATUS.md
│   ├── ISA_DOCUMENTATION_MAP.md
│   ├── ISA_ESG_GS1_CANONICAL_MODEL.md
│   ├── ISA_FUTURE_DEVELOPMENT_PLAN.md
│   ├── ISA_First_Advisory_Report_GS1NL.md
│   ├── ISA_First_Advisory_Report_GS1NL_v1.1_UPDATE.md
│   ├── ISA_GS1_PRE_EXECUTION_PREPARATION.md
│   ├── ISA_IMPLEMENTATION_EXECUTION_PLAN.md
│   ├── ISA_INFORMATION_ARCHITECTURE.md
│   ├── ISA_NEVER_AGAIN_ARCHITECTURAL_CONTRACT.md
│   ├── ISA_NEWSHUB_EVOLUTION_SUMMARY.md
│   ├── ISA_NEWS_HUB_SELF_CHECK_ASSESSMENT.md
│   ├── ISA_NEXT_PHASE_DEVELOPMENT_PLAN.md
│   ├── ISA_PRODUCT_DIMENSIONS_ANALYSIS.md
│   ├── ISA_PRODUCT_VISION.md
│   ├── ISA_STATUS_SUMMARY_2025-12-19.md
│   ├── ISA_STRATEGIC_CONTEXT_SYNTHESIS.md
│   ├── ISA_STRATEGIC_DISCOVERY_REPORT.md
│   ├── ISA_STRATEGIC_EVALUATION_QUALITY_MAPPING.md
│   ├── ISA_STRATEGIC_PIVOT_REPORT.md
│   ├── ISA_Strategic_Insights_from_Reports.md
│   ├── ISA_UX_STRATEGY.md
│   ├── ISA_V1_CONSISTENCY_FIXES.md
│   ├── ISA_V1_FINAL_DELIVERY.md
│   ├── ISA_V1_FORMALIZATION_COMPLETE.md
│   ├── ISA_V1_FORMALIZATION_TARGETS.md
│   ├── ISA_V1_HARDENING_COMPLETE.md
│   ├── ISA_V1_LOCK_CHECKSUMS.txt
│   ├── ISA_V1_LOCK_RECORD.md
│   ├── ISA_VISUAL_BRANDING_DEVELOPMENT_PLAN.md
│   ├── ISA_WORKFLOW_IMPROVEMENTS.md
│   ├── KNOWN_FAILURE_MODES.md
│   ├── MANUS_BEST_PRACTICES_EXECUTIVE_SUMMARY.md
│   ├── MANUS_BEST_PRACTICES_FOR_ISA.md
│   ├── MANUS_DAY1_EXECUTION_CHECKLIST.md
│   ├── MANUS_EXECUTION_BRIEF.md
│   ├── MANUS_OPTIMIZATION_IMPLEMENTATION_SUMMARY.md
│   ├── META_PHASE_COMPLETION_REPORT.md
│   ├── META_PHASE_STRATEGIC_EXPLORATION_PLAN.md
│   ├── NEWS_HEALTH_MONITORING.md
│   ├── NEWS_HUB_MATURITY_ANALYSIS.md
│   ├── NEWS_PIPELINE.md
│   ├── OPERATIONS_RUNBOOK.md
│   ├── PHASE4_OPERATIONAL_READINESS_REPORT.md
│   ├── PHASE_1_RESCORE.md
│   ├── PHASE_2_ADDENDUM.md
│   ├── PHASE_2_DESIGN_EVALUATION.md
│   ├── PHASE_2_DESIGN_PROPOSAL.md
│   ├── PHASE_2_RESCORE.md
│   ├── PHASE_3_COMPLETION_REPORT.md
│   ├── PHASE_3_STARTDOCUMENT.md
│   ├── PHASE_8.3_INGESTION_WINDOW_COMPLETE.md
│   ├── PHASE_8_1_VERIFICATION.md
│   ├── PHASE_8_COMPLETE_SUMMARY.md
│   ├── PHASE_8_NEWS_HUB_OBSERVABILITY_COMPLETE.md
│   ├── PHASE_AB_UX_SUMMARY.md
│   ├── PIPELINE_OBSERVABILITY_SPEC.md
│   ├── PIPELINE_VALIDATION_REPORT.md
│   ├── PRIORITY_1_COMPLETION_REPORT.md
│   ├── PRIORITY_1_SCHEMA_DEBT.md
│   ├── PRIORITY_2_BLOCKED.md
│   ├── PRIORITY_3_COMPLETION_REPORT.md
│   ├── PRODUCTION_DEPLOYMENT.md
│   ├── PRODUCTION_IMPROVEMENTS_JAN_2026.md
│   ├── PRODUCTION_READINESS.md
│   ├── QUALITY_BAR.md
│   ├── README.md
│   ├── REGULATORY_CHANGE_LOG_ENTRY_GUIDE.md
│   ├── REGULATORY_CHANGE_LOG_TEMPLATES.md
│   ├── REGULATORY_LANDSCAPE_SUMMARIES.md
│   ├── REPO_MAP.md
│   ├── REPO_MAP_AFTER.md
│   ├── REPO_MAP_BEFORE.md
│   ├── REPO_MAP_FINAL.md
│   ├── SELF_CHECK_EVIDENCE.md
│   ├── SERVERLOGGER_INTEGRATION.md
│   ├── STATUS.md
│   ├── STRATEGIC_EVALUATION_2026-02-01.md
│   ├── STRATEGIC_PIVOT_POC.md
│   ├── STYLE_ALIGNMENT_RECOMMENDATIONS.md
│   ├── STYLE_GUIDE_ADOPTION.md
│   ├── TESTING_GUIDE.md
│   ├── TRUST_RISK_ANALYSIS.md
│   ├── UX_PHASE_A_SUMMARY.md
│   ├── WIDE_RESEARCH_USAGE.md
│   ├── _AUDIT_FINDINGS.md
│   ├── _CONSOLIDATION_VALIDATION.md
│   ├── agent_collaboration
│   │   └── MANUS_CHATGPT_PROTOCOL.md
│   ├── archive
│   │   └── root_docs
│   │       ├── _inventory_db_migrations_20260207_212557.json
│   │       ├── _move_manifest_db_migrations_20260207_212557.json
│   │       ├── _move_manifest_evidence_generated_20260207_215427.json
│   │       ├── _move_manifest_ops_config_cleanup_20260207_213615.json
│   │       ├── _move_manifest_root_scripts_20260207_212036.json
│   │       ├── _move_map_db_migrations_20260207_212557.json
│   │       ├── _move_map_evidence_generated_20260207_215427.json
│   │       ├── _move_map_ops_config_cleanup_20260207_213615.json
│   │       └── _move_map_root_scripts_20260207_212036.json
│   ├── autonomous-session-2025-12-17-critical-events.md
│   ├── autonomous-session-2025-12-17.md
│   ├── data
│   │   └── EXTERNAL_ARTEFACTS.md
│   ├── datasets
│   │   ├── EXTERNAL_GS1_AND_ESG_REPOS_ARCHIVE2.md
│   │   └── HOW_TO_QUERY_ARCHIVE2_INDEX.md
│   ├── datasets-catalog.schema.json
│   ├── efrag_xbrl_research.md
│   ├── eurlex_research.md
│   ├── evidence
│   │   ├── CRITICAL_FILES_CANDIDATES.md
│   │   ├── DOC_AUTHORITY_MAP.md
│   │   ├── ENTRYPOINTS.md
│   │   ├── EVIDENCE_INDEX.md
│   │   ├── EXEC_GRAPH.mmd
│   │   ├── ISA_ACCEPTANCE_CRITERIA_v1.md
│   │   ├── ISA_EVIDENCE_PACK_v0.md
│   │   ├── ISA_EXECUTION_MAP.md
│   │   ├── ISA_IRON_DOCSET_AND_CRITICAL_PATH_DECISION_DRAFT_v0.md
│   │   ├── ISA_JOURNEY_TRACES_v0.md
│   │   ├── ISA_JOURNEY_TRACES_v1.md
│   │   ├── ISA_SOURCES_REGISTRY_v0.md
│   │   ├── _benchmarks
│   │   │   ├── ISA_EXTERNAL_BENCHMARK_NOTES_v1.md
│   │   │   └── ISA_EXTERNAL_BENCHMARK_NOTES_v2.md
│   │   ├── _research
│   │   │   ├── ISA_CURRENT_ARCHITECTURE_BRIEF_v0.md
│   │   │   ├── ISA_RESEARCH_PLAN_v1.md
│   │   │   └── ISA_RESEARCH_PLAN_v2.md
│   │   └── generated
│   │       ├── _generated
│   │       │   ├── CATALOGUE_ENTRYPOINTS_STATUS.json
│   │       │   ├── CATALOGUE_ENTRYPOINTS_STATUS.md
│   │       │   ├── CENSUS.json
│   │       │   ├── CENSUS_DIFF.md
│   │       │   ├── DOCSET_MAP.csv
│   │       │   ├── GS1_EFRAG_CATALOGUE.csv
│   │       │   ├── GS1_EFRAG_CATALOGUE.json
│   │       │   ├── GS1_EFRAG_CATALOGUE_INDEX.md
│   │       │   ├── LARGE_ASSETS.md
│   │       │   ├── SUBDIR_SUMMARY.md
│   │       │   └── isa_catalogue_latest
│   │       │       ├── files
│   │       │       ├── index.md
│   │       │       └── summary.json
│   │       └── inventory
│   │           ├── INVENTORY_AFTER.csv
│   │           ├── INVENTORY_BEFORE.csv
│   │           └── INVENTORY_FINAL.csv
│   ├── governance
│   │   ├── AUDIT_EXECUTION_MODE.md
│   │   ├── CLUSTER_REGISTRY.json
│   │   ├── CLUSTER_REGISTRY.md
│   │   ├── DATE_CORRECTION_ACTIONS.md
│   │   ├── DATE_INTEGRITY_AUDIT.md
│   │   ├── INDEX.md
│   │   ├── IRON_KNOWLEDGE_MAP.md
│   │   ├── IRON_PROTOCOL.md
│   │   ├── IRON_VALIDATION_PLAN.md
│   │   ├── ISA_DEVELOPMENT_PLAYBOOK.md
│   │   ├── ISA_MANUS_PROJECT_GOVERNANCE.md
│   │   ├── KNOWN_FAILURE_MODES.md
│   │   ├── LIVING_DOCUMENTATION_POLICY.md
│   │   ├── LLM_STRUCTURAL_RISK_ASSESSMENT.md
│   │   ├── OPEN_QUESTIONS.md
│   │   ├── PHASE4_CLOSEOUT_REPORT.md
│   │   ├── PHASE4_READINESS_REPORT.md
│   │   ├── PLANNING_TRACEABILITY_CANON.md
│   │   ├── SCOPE_DECISIONS.md
│   │   ├── TEMPORAL_GUARDRAILS.md
│   │   ├── VALIDATION_SUMMARY.md
│   │   ├── WORK_PRIORITIZATION.md
│   │   ├── _root
│   │   │   ├── GOVERNANCE.md
│   │   │   └── ISA_GOVERNANCE.md
│   │   ├── agent-prompts
│   │   │   ├── AUTONOMOUS_DEVELOPMENT_SUMMARY.md
│   │   │   ├── CHATGPT_PROMPT_BATCH_INGEST_02_04_05_06.md
│   │   │   ├── CHATGPT_PROMPT_INGEST-03.md
│   │   │   ├── CHATGPT_UPDATE_PROMPT.md
│   │   │   ├── DELEGATION_PACKAGE_INGEST-03.md
│   │   │   └── ORCHESTRATION_PROMPT.md
│   │   └── reviews
│   │       ├── dual-core-poc-evaluation.md
│   │       ├── task1_review.md
│   │       └── task3_review.md
│   ├── gs1_research
│   │   ├── README.md
│   │   ├── README.pdf
│   │   ├── STRATEGIC_FOCUS_SELECTION.md
│   │   ├── decision_support_feasibility.md
│   │   ├── executive_summary.md
│   │   ├── executive_summary.pdf
│   │   ├── feasibility_assessment.md
│   │   ├── feasibility_findings.md
│   │   ├── gs1_process_synthesis.md
│   │   ├── gs1_process_synthesis.pdf
│   │   ├── gsmp_manual_notes.md
│   │   ├── hardest_questions_decision_tensions.md
│   │   ├── hardest_questions_decision_tensions.pdf
│   │   ├── isa_relevance_mapping.md
│   │   ├── isa_relevance_mapping.pdf
│   │   └── research_gs1_standards_development.md
│   ├── gsmp_manual.pdf
│   ├── gsmp_manual.txt
│   ├── isa_architecture.png
│   ├── isa_cicd_pipeline.png
│   ├── isa_data_flow.png
│   ├── isa_implementation_timeline.png
│   ├── isa_research_findings.md
│   ├── legacy
│   │   ├── CHATGPT_DOCS_SHA256SUMS.txt
│   │   ├── CHATGPT_PROMPT_WORK_PARCEL_02.txt
│   │   └── STABILIZATION_REPORT_2026-01-04.md
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
│   │   └── PLANNING_POLICY.md
│   ├── reference
│   │   ├── ISA_DEVELOPMENT_RUBRIC.md
│   │   ├── ISA_REFERENCE_DOSSIER.md
│   │   └── REPO_ASSESSMENT_HOWTO.md
│   ├── references
│   │   └── gs1
│   │       ├── GS1-Style-Guide.pdf
│   │       ├── GS1_STYLE_GUIDE_EXTRACT.md
│   │       └── ISA_TOP_20_STYLE_RULES.md
│   ├── research_findings_poc_pivot.md
│   ├── screenshots
│   │   └── news-hub-enhanced-filters.md
│   ├── spec
│   │   ├── ARCHITECTURE.md
│   │   ├── CONFLICT_REGISTER.md
│   │   ├── DATA_MODEL.md
│   │   ├── DECISION_LOG_PHASE3.md
│   │   ├── DEPRECATION_MAP.md
│   │   ├── EPCIS_CBV_INTEGRATION_SUMMARY.md
│   │   ├── EURLEX_SCRAPER_FIX.md
│   │   ├── EXTERNAL_REFERENCES.md
│   │   ├── GS1_ARTEFACT_PROCESSING.md
│   │   ├── INDEX.md
│   │   ├── INGESTION.md
│   │   ├── INGESTION_DELIVERABLES_INDEX.md
│   │   ├── INGESTION_SUMMARY_REPORT.md
│   │   ├── ISA_CAPABILITY_MAP.md
│   │   ├── ISA_MASTER_SPEC.md
│   │   ├── PRODUCTION_READINESS.md
│   │   ├── QUICK_START_INGESTION.md
│   │   ├── README.md
│   │   ├── RUN_CONFIG.json
│   │   ├── TRACEABILITY_MATRIX.csv
│   │   ├── TYPESCRIPT_FIX_SUMMARY.md
│   │   ├── TYPESCRIPT_NOTES.md
│   │   ├── WEBHOOK_INTEGRATION.md
│   │   ├── agent-prompt-governance.md
│   │   ├── catalogue-source-registry.md
│   │   ├── data-knowledge-model.md
│   │   ├── evaluation-governance-reproducibility.md
│   │   ├── governance-iron-protocol.md
│   │   ├── ingestion-update-lifecycle.md
│   │   ├── isa-core-architecture.md
│   │   ├── newshub
│   │   │   ├── ISA_NEWSHUB_AUDIT_UPDATED.md
│   │   │   ├── ISA_NEWSHUB_TARGET_DESIGN.md
│   │   │   ├── ISA_NEWS_OVERVIEW.md
│   │   │   ├── RESEARCH_FINDINGS_NEWS_SOURCES.md
│   │   │   └── research-dutch-sources.md
│   │   ├── observability-tracing-feedback.md
│   │   ├── ops
│   │   │   ├── CHROMIUM_INSTALLATION_GUIDE.md
│   │   │   ├── CRON_DEPLOYMENT.md
│   │   │   └── HEALTH_MONITORING_ENHANCEMENTS.md
│   │   ├── regulations
│   │   │   └── MULTI_REGULATION_COMPARISON_SUMMARY.md
│   │   ├── repo-change-control-release.md
│   │   ├── retrieval-embeddings-grounding.md
│   │   └── ux-user-journey.md
│   ├── templates
│   │   ├── ADVISORY_REPORT_TEMPLATE.md
│   │   ├── GAP_ANALYSIS_TEMPLATE.md
│   │   └── RECOMMENDATION_TEMPLATE.md
│   ├── test-failure-analysis-2025-12-17.md
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
│   │   └── _journal.json
│   ├── meta_backup_20251219_172648
│   │   ├── 0000_snapshot.json
│   │   ├── 0001_snapshot.json
│   │   ├── 0002_snapshot.json
│   │   └── _journal.json
│   ├── migrations
│   │   ├── .gitkeep
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
│   ├── schema_news_recommendations.ts
│   ├── schema_pipeline_observability.ts
│   ├── schema_regulatory_change_log.ts
│   └── schema_scraper_health.ts
├── drizzle.config.ts
├── isa-archive
│   ├── INDEX.md
│   ├── backlog
│   │   └── 20260206T194201Z
│   │       ├── backlog_export.csv
│   │       ├── backlog_export.json
│   │       └── backlog_export_summary.txt
│   ├── cleanup
│   │   ├── 20260206T190526Z
│   │   │   ├── cleanup_report.json
│   │   │   └── cleanup_report.md
│   │   ├── 20260206T191106Z
│   │   │   ├── move_plan.json
│   │   │   ├── move_plan.md
│   │   │   ├── safe_move_plan.json
│   │   │   ├── safe_move_plan.md
│   │   │   ├── safe_move_plan_v2.json
│   │   │   ├── safe_move_plan_v2.md
│   │   │   ├── safe_move_plan_v3.json
│   │   │   ├── safe_move_plan_v3.md
│   │   │   ├── safe_move_plan_v4.json
│   │   │   └── safe_move_plan_v4.md
│   │   ├── 20260206T191857Z
│   │   │   ├── safe_move_plan_v5.json
│   │   │   └── safe_move_plan_v5.md
│   │   └── 20260206T192047Z
│   │       ├── safe_move_plan_v6.json
│   │       └── safe_move_plan_v6.md
│   ├── manus-tasks
│   │   └── docs__research__manus_research_findings.md
│   ├── next-step-scan
│   │   ├── repo_scan.json
│   │   └── repo_scan_summary.txt
│   ├── phase-reports
│   │   ├── CHATGPT_DELEGATION_PHASE1.md
│   │   ├── CURRENCY_DISCLOSURE.md
│   │   ├── DATASET_INVENTORY.md
│   │   ├── DOCUMENTATION_INVENTORY.md
│   │   ├── ISA_GS1_ARTIFACT_INVENTORY.md
│   │   ├── ISA_TODO_MANUAL_COMPLETION.md
│   │   ├── NEWS_HUB_PHASE4-6_SUMMARY.md
│   │   ├── PHASE_9_CLAIMS_SANITIZATION_REPORT.md
│   │   ├── PHASE_9_COMPLETION_REPORT.md
│   │   ├── PHASE_9_DOCUMENTATION_INVENTORY.md
│   │   ├── PROJECT_INVENTORY.md
│   │   └── todo_phase44_update.txt
│   ├── planning
│   │   ├── _root
│   │   │   └── 20260206T210620Z
│   │   │       └── docs
│   │   │           └── planning
│   │   └── roadmaps
│   │       └── 20260206T202410Z
│   │           └── docs
│   │               └── planning
│   ├── reports
│   │   ├── AUDIT_FINDINGS.md
│   │   ├── DATA_FILE_VERIFICATION_REPORT.md
│   │   ├── DIAGNOSTIC_REPORT.md
│   │   ├── MONITORING_TESTS.md
│   │   ├── NEEDS_USER_UPLOAD.md
│   │   ├── PROJECT_SIZE_CLEANUP.md
│   │   ├── ROOT_CAUSE_DIAGNOSTIC_REPORT.md
│   │   ├── STABILIZATION_REPORT_2026-01-04.md
│   │   ├── TIMELINE_VISUALIZATION_SUMMARY.md
│   │   ├── data__standards__gs1-nl__benelux-datasource__v3.1.33__202311-ld-gs1das-toelichting-op-velden-123_aug25.pdf
│   │   ├── docs__research__GS1_NL_FASHION_SECTOR.md
│   │   ├── research__ASK_ISA_ANALYSIS_REPORT.md
│   │   ├── research__ASK_ISA_CLAIM_VERIFICATION_TEST.md
│   │   ├── research__ASK_ISA_FINAL_TEST_RESULTS.md
│   │   ├── research__ASK_ISA_FRONTEND_TEST_RESULTS.md
│   │   ├── research__ASK_ISA_IMPLEMENTATION_PLAN.md
│   │   ├── research__ASK_ISA_IMPROVED_VERIFICATION_TEST.md
│   │   ├── research__ASK_ISA_OPTIMIZATION_COMPLETENESS_ANALYSIS.md
│   │   ├── research__rag_best_practices_research.md
│   │   ├── tasks__BATCH_01_SUMMARY.md
│   │   ├── tasks__CHATGPT_WORK_PLAN.md
│   │   ├── tasks__INGESTION_MASTER_PROMPT_FOR_CHATGPT.md
│   │   ├── tasks__TASK_SPEC_TEMPLATE.md
│   │   ├── tasks__batch_01__README.md
│   │   ├── tasks__for_chatgpt__CGPT-01_esrs_to_gs1_mapping.md
│   │   ├── tasks__for_chatgpt__CGPT-02_gpc_to_gs1_mapping.md
│   │   ├── tasks__for_chatgpt__CGPT-03_news_timeline_component.md
│   │   ├── tasks__for_chatgpt__CGPT-05_digital_link_utils.md
│   │   ├── tasks__for_chatgpt__CGPT-13_esrs_coverage_gap_analysis.md
│   │   ├── tasks__for_chatgpt__CGPT-15_user_guide.md
│   │   ├── tasks__for_chatgpt__CGPT-17_data_quality_validation.md
│   │   ├── tasks__for_chatgpt__INGEST-01_gdm_attributes.md
│   │   ├── tasks__for_chatgpt__INGEST-02_gdsn_current.md
│   │   ├── tasks__for_chatgpt__INGEST-03_esrs_datapoints.md
│   │   ├── tasks__for_chatgpt__INGEST-04_ctes_kdes.md
│   │   ├── tasks__for_chatgpt__INGEST-05_dpp_identification.md
│   │   ├── tasks__for_chatgpt__INGEST-06_cbv_vocabularies.md
│   │   ├── tasks__for_chatgpt___CHATGPT_INSTRUCTIONS.md
│   │   ├── test-failure-analysis.md
│   │   ├── test-outputs
│   │   │   ├── test-final-run.txt
│   │   │   ├── test-final.txt
│   │   │   ├── test-json-output.txt
│   │   │   ├── test-null-stacktrace-fix.txt
│   │   │   ├── test-output.txt
│   │   │   └── test-simple.txt
│   │   ├── test-results__phase-7-frontend-integration-test.md
│   │   ├── test-results__phase-8-roadmap-generator-test.md
│   │   └── timeline-test-results.md
│   ├── roadmaps
│   │   ├── ISA_AUTONOMOUS_ROADMAP_V1.md
│   │   ├── ISA_DEPLOYMENT_AND_ROADMAP.md
│   │   ├── ISA_DEVELOPMENT_ROADMAP_TO_FINAL_PRODUCT.md
│   │   ├── ISA_Development_Roadmap_2026.md
│   │   ├── ISA_POC_ROADMAP.md
│   │   ├── ISA_Strategic_Roadmap.md
│   │   ├── ISA_VISUAL_BRANDING_ROADMAP.md
│   │   ├── governance
│   │   │   └── ISA_DEVELOPMENT_ROADMAP.md
│   │   └── spec
│   │       └── roadmap-evolution.md
│   └── traceability-clean
│       └── 20260206T194827Z
│           ├── TRACEABILITY_MATRIX.cleaned.csv
│           ├── traceability_clean_report.json
│           └── traceability_clean_report.md
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
│   ├── check-db-status.ts
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
│   │   ├── get-scope-stats.mjs
│   │   ├── manus-readiness-precheck.py
│   │   ├── run-pipeline-verbose.mjs
│   │   ├── test-db-ssl.mjs
│   │   ├── test-efrag-detail.mjs
│   │   ├── test-efrag-pipeline.mjs
│   │   └── test-xml-parser.mjs
│   ├── extract_advisory_v1.py
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
│   ├── parse_gs1nl_datamodel.py
│   ├── phase3_synthesis.py
│   ├── proto_crawl_catalogue.py
│   ├── run-all-ingestion.ts
│   ├── run-ci-tests.sh
│   ├── run-esrs-ingest.ts
│   ├── run-integration-tests.sh
│   ├── run-rag-evaluation.cjs
│   ├── run-unit-tests.sh
│   ├── seed-golden-qa-pairs.cjs
│   ├── seed-regulatory-change-log-sql.txt
│   ├── seed-regulatory-change-log.ts
│   ├── validate_advisory.py
│   ├── validate_advisory_schema.cjs
│   ├── validate_cluster_registry.py
│   ├── validate_gs1_efrag_catalogue.py
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
│   └── verify_catalogue_entrypoints.py
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
│   │   ├── performance-monitoring.ts
│   │   ├── rate-limit.ts
│   │   ├── sdk.ts
│   │   ├── security-headers.ts
│   │   ├── systemRouter.ts
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
│   ├── ask-isa-enhanced.ts
│   ├── ask-isa-guardrails.test.ts
│   ├── ask-isa-guardrails.ts
│   ├── ask-isa-integration.test.ts
│   ├── ask-isa-query-library.ts
│   ├── attribute-recommender.test.ts
│   ├── attribute-recommender.ts
│   ├── auth.logout.test.ts
│   ├── authority-model.test.ts
│   ├── authority-model.ts
│   ├── automated-cellar-sync.ts
│   ├── batch-epcis-processor.ts
│   ├── batch-generate-esrs-mappings.ts
│   ├── bm25-search.ts
│   ├── cellar-connector.test.ts
│   ├── cellar-connector.ts
│   ├── cellar-diagnostic.test.ts
│   ├── cellar-ingestion-integration.test.ts
│   ├── cellar-ingestion-router.ts
│   ├── cellar-ingestion-scheduler.mjs
│   ├── cellar-normalizer.test.ts
│   ├── cellar-normalizer.ts
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
│   ├── epcis-integration.test.ts
│   ├── epcis-router.ts
│   ├── epcis-schema.json
│   ├── epcis-ui.test.ts
│   ├── epcis-xml-parser.ts
│   ├── esrs-gs1-mapping.test.ts
│   ├── esrs.test.ts
│   ├── eudr-analyzer.ts
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
│   ├── generate-all-embeddings-optimized.ts
│   ├── generate-all-embeddings-v2.ts
│   ├── generate-all-embeddings.ts
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
│   │   └── INGEST-06_cbv_digital_link.ts
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
│   │   ├── batch-epcis.ts
│   │   ├── benchmarking.ts
│   │   ├── citation-admin.ts
│   │   ├── collaboration.ts
│   │   ├── compliance-risks.ts
│   │   ├── coverage-analytics.ts
│   │   ├── cron.ts
│   │   ├── dataset-registry.test.ts
│   │   ├── dataset-registry.ts
│   │   ├── esg-artefacts.ts
│   │   ├── esrs-gs1-mapping.ts
│   │   ├── esrs-roadmap.ts
│   │   ├── evaluation.ts
│   │   ├── executive-analytics.ts
│   │   ├── gap-analyzer.ts
│   │   ├── governance-documents.test.ts
│   │   ├── governance-documents.ts
│   │   ├── gs1-attributes-multi-sector.test.ts
│   │   ├── gs1-attributes.test.ts
│   │   ├── gs1-attributes.ts
│   │   ├── gs1nl-attributes.ts
│   │   ├── impact-simulator.ts
│   │   ├── monitoring.ts
│   │   ├── notification-preferences.ts
│   │   ├── observability.ts
│   │   ├── pipeline-observability.ts
│   │   ├── production-monitoring.ts
│   │   ├── realtime.ts
│   │   ├── regulatory-change-log.ts
│   │   ├── remediation.ts
│   │   ├── roadmap-export.ts
│   │   ├── roadmap.ts
│   │   ├── scoring.ts
│   │   ├── scraper-health.test.ts
│   │   ├── scraper-health.ts
│   │   ├── stakeholder-dashboard.ts
│   │   ├── standards-directory.test.ts
│   │   ├── standards-directory.ts
│   │   ├── template-analytics.ts
│   │   └── templates.ts
│   ├── routers-data-quality.ts
│   ├── routers-webhook-config.ts
│   ├── routers.test.ts
│   ├── routers.ts
│   ├── rss-aggregator-db.mjs
│   ├── rss-aggregator-real.mjs
│   ├── rss-aggregator.mjs
│   ├── run-first-ingestion.test.ts
│   ├── run-gs1-mapping.ts
│   ├── seed-demo-data.mjs
│   ├── seed-epcis-events.ts
│   ├── seed-eudr-data.ts
│   ├── seed-gs1-standards.mjs
│   ├── seed-gs1-standards.ts
│   ├── seed-production-regulations.mjs
│   ├── services
│   │   ├── ab-testing
│   │   │   └── index.ts
│   │   ├── authority-scoring
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
│   └── ask-isa-mapping-test.md
├── todo.md
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
└── vitest.setup.ts

161 directories, 1238 files
```
