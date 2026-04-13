# Repository Tree

Generated on: 2026-04-13T05:31:24Z

```
.
├── .agents
│   └── skills
│       ├── diagram-generator
│       │   ├── SKILL.md
│       │   ├── commands
│       │   │   └── diagram-generator.md
│       │   ├── hooks
│       │   │   ├── post-execute.cjs
│       │   │   └── pre-execute.cjs
│       │   ├── references
│       │   │   └── research-requirements.md
│       │   ├── rules
│       │   │   └── diagram-generator.md
│       │   ├── schemas
│       │   │   ├── input.schema.json
│       │   │   └── output.schema.json
│       │   ├── scripts
│       │   │   └── main.cjs
│       │   └── templates
│       │       └── implementation-template.md
│       ├── find-skills
│       │   └── SKILL.md
│       ├── git-essentials
│       │   └── SKILL.md
│       ├── openrouter-typescript-sdk
│       │   └── SKILL.md
│       ├── proactive-agent
│       │   └── SKILL.md
│       ├── self-improving-agent
│       │   ├── README.md
│       │   ├── SKILL.md
│       │   ├── hooks
│       │   │   ├── post-bash.sh
│       │   │   ├── pre-tool.sh
│       │   │   └── session-end.sh
│       │   ├── memory
│       │   │   └── semantic-patterns.json
│       │   ├── references
│       │   │   └── appendix.md
│       │   └── templates
│       │       ├── correction-template.md
│       │       ├── pattern-template.md
│       │       └── validation-template.md
│       └── skill-creator
│           ├── LICENSE.txt
│           ├── SKILL.md
│           ├── agents
│           │   ├── analyzer.md
│           │   ├── comparator.md
│           │   └── grader.md
│           ├── assets
│           │   └── eval_review.html
│           ├── eval-viewer
│           │   ├── generate_review.py
│           │   └── viewer.html
│           ├── references
│           │   └── schemas.md
│           └── scripts
│               ├── aggregate_benchmark.py
│               ├── generate_report.py
│               ├── improve_description.py
│               ├── package_skill.py
│               ├── quick_validate.py
│               ├── run_eval.py
│               ├── run_loop.py
│               └── utils.py
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
├── .env.supabase.example
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
├── .openclaw
│   ├── OPENCLAW_EXTERNAL_ANALYSIS_EXPORT.redacted.json
│   ├── audit
│   │   ├── 20260302T081629Z
│   │   │   ├── OPENCLAW_CONFIGURATION_AUDIT.md
│   │   │   ├── OPENCLAW_CONFIGURATION_FIELD_INVENTORY.redacted.json
│   │   │   └── OPENCLAW_CONFIGURATION_SNAPSHOT.redacted.json
│   │   ├── 20260302T081702Z
│   │   │   ├── OPENCLAW_UNUSED_CONFLICTING_SHADOWED_REPORT.md
│   │   │   ├── OPENCLAW_UNUSED_CONFLICTING_SHADOWED_SUMMARY.json
│   │   │   ├── OPENCLAW_UNUSED_CONFLICTING_SHADOWED_SUPPORT.redacted.json
│   │   │   └── OPENCLAW_UNUSED_CONFLICTING_SHADOWED_TABLE.json
│   │   └── 20260302T081732Z
│   │       └── OPENCLAW_EXTERNAL_ANALYSIS_EXPORT.redacted.json
│   └── control-plane.json
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
├── GEMINI.md
├── ISA_MAP.md
├── ISA_REPO_MIGRATION_AUDIT.md
├── QUICK_START.md
├── README.md
├── REPO_TREE.md
├── SETUP_COMPLETE.md
├── _golden_gate_roadmaps_move_map.json
├── apply-pg-migrations.mjs
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
│       │   ├── AdvisoryReportPdfExportButton.tsx
│       │   ├── AskISAExpertMode.test.tsx
│       │   ├── AskISAExpertMode.tsx
│       │   ├── AskISAFeedbackButtons.tsx
│       │   ├── AskISAWidget.tsx
│       │   ├── AuthorityBadge.tsx
│       │   ├── Breadcrumbs.tsx
│       │   ├── CompareTimelines.tsx
│       │   ├── ComplianceCoverageChart.tsx
│       │   ├── DashboardLayout.tsx
│       │   ├── DashboardLayoutSkeleton.tsx
│       │   ├── DecisionArtifactCard.test.tsx
│       │   ├── DecisionArtifactCard.tsx
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
│       │   ├── RegulationTimeline.test.tsx
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
│       │   ├── advisory-explorer.test.ts
│       │   ├── advisory-explorer.ts
│       │   ├── advisory-report-ui.test.ts
│       │   ├── advisory-report-ui.ts
│       │   ├── ask-isa-citation.test.ts
│       │   ├── ask-isa-citation.ts
│       │   ├── ask-isa-source-posture.test.ts
│       │   ├── ask-isa-source-posture.ts
│       │   ├── dataset-registry-verification.test.ts
│       │   ├── dataset-registry-verification.ts
│       │   ├── esrs-decision-posture.test.ts
│       │   ├── esrs-decision-posture.ts
│       │   ├── export.ts
│       │   ├── i18n.tsx
│       │   ├── regulation-milestones.ts
│       │   ├── regulation-search.ts
│       │   ├── trpc.ts
│       │   ├── utils.ts
│       │   ├── verification-posture.test.ts
│       │   └── verification-posture.ts
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
│       │   ├── AdvisoryReportDetail.test.tsx
│       │   ├── AdvisoryReportDetail.tsx
│       │   ├── AdvisoryReports.test.tsx
│       │   ├── AdvisoryReports.tsx
│       │   ├── AdvisoryTraceability.tsx
│       │   ├── AskISA.tsx
│       │   ├── AskISAEnhanced.test.tsx
│       │   ├── AskISAEnhanced.tsx
│       │   ├── AttributeRecommender.test.tsx
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
│       │   ├── GapAnalyzer.test.tsx
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
│       │   ├── StandardDetail.test.tsx
│       │   ├── StandardDetail.tsx
│       │   ├── StandardsDirectory.test.tsx
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
│   ├── agent-platform
│   │   ├── capability-delivery.workflow.json
│   │   ├── dependency.inventory.json
│   │   ├── github-label-map.json
│   │   ├── handoff.contract.json
│   │   ├── nonsecret.local.template.env
│   │   ├── permissions.matrix.json
│   │   ├── secret-authority.map.json
│   │   └── task-routing.matrix.json
│   ├── catalogue_sources.json
│   ├── governance
│   │   ├── canonical_docs_allowlist.json
│   │   ├── golden-gate.policy.json
│   │   └── openclaw_policy_envelope.json
│   ├── ide
│   │   ├── codex
│   │   │   └── user-config.template.toml
│   │   └── gemini
│   │       └── settings.template.json
│   ├── isa-catalogue
│   │   └── policy.json
│   ├── mcp
│   │   └── servers.catalog.json
│   ├── openclaw
│   │   ├── browser.policy.json
│   │   ├── cli-command-map.json
│   │   ├── exec-lane.policy.json
│   │   ├── hooks
│   │   │   └── README.md
│   │   ├── model-routing.policy.json
│   │   ├── openclaw.isa-lab.template.json
│   │   ├── openclaw.isa-research.template.json
│   │   ├── skill-routing.policy.json
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
│   │   └── EFRAGIG3ListofESRSDataPoints.xlsx
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
│   │       │   ├── quality_cases_v1.json
│   │       │   ├── quality_cases_v2.json
│   │       │   ├── scenarios_v1.json
│   │       │   └── scenarios_v2.json
│   │       ├── ask_isa
│   │       │   ├── quality_cases_v1.json
│   │       │   ├── quality_cases_v2.json
│   │       │   ├── questions_v1.json
│   │       │   ├── questions_v2.json
│   │       │   └── scenario_cases_v2_live.json
│   │       ├── catalog
│   │       │   ├── records_v1.json
│   │       │   └── records_v2.json
│   │       ├── esrs_mapping
│   │       │   ├── decision_cases_v1.json
│   │       │   ├── decision_cases_v2.json
│   │       │   ├── mappings_v1.jsonl
│   │       │   ├── mappings_v2.jsonl
│   │       │   ├── negative_cases_v1.json
│   │       │   └── negative_cases_v2.json
│   │       ├── knowledge_base
│   │       │   ├── corpus_slice_v1.jsonl
│   │       │   ├── corpus_slice_v2.jsonl
│   │       │   ├── metadata_gold_v1.json
│   │       │   ├── metadata_gold_v2.json
│   │       │   ├── retrieval_cases_v1.json
│   │       │   └── retrieval_cases_v2.json
│   │       ├── news_hub
│   │       │   ├── timeline_v1.json
│   │       │   └── timeline_v2.json
│   │       ├── registry.json
│   │       └── source_authority
│   │           └── gs1_authority_cases_v1.json
│   ├── gdm_combined_models.csv
│   ├── governance
│   │   └── calibrations.manifest.json
│   ├── gs1
│   │   └── gdsn
│   │       └── gdsn_classes.json
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
│   ├── gs1nl
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
│                   ├── common-echo-datamodel_3133.xlsx
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
│   │   ├── GEMINI_CODEX_BOOTSTRAP_PROMPT.md
│   │   ├── GEMINI_RESEARCH_PROMPT_ISA_EXCELLENCE.md
│   │   ├── MANUS_OPENCLAW_COLLABORATION.md
│   │   ├── MCP_POLICY.md
│   │   ├── MCP_RECIPES.md
│   │   ├── OPENCLAW_ISA_MOBILIZATION_GUIDE.md
│   │   ├── OPENCLAW_ISA_MOBILIZATION_PROMPT.md
│   │   ├── OPENCLAW_UI_DEV_PROMPT_STARTER.md
│   │   ├── OPENCLAW_UI_MODEL_QUICK_REFERENCE.md
│   │   ├── OPENCLAW_UI_SKILL_QUICK_REFERENCE.md
│   │   └── _runtime
│   │       ├── HEARTBEAT.md
│   │       ├── WAL.md
│   │       └── WORKING_BUFFER.md
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
│   │   ├── ADR-0001_SUPABASE_POSTGRES_DATA_PLANE.md
│   │   ├── CONFLICTS_PLAN_DECISIONS_2026-02-10.md
│   │   └── DECISION_LOG.md
│   ├── eurlex_research.md
│   ├── evidence
│   │   ├── EXEC_GRAPH.mmd
│   │   ├── isa_user_value_audit.md
│   │   └── isa_user_value_execution.md
│   ├── governance
│   │   ├── CREDENTIALS_VERIFICATION.md
│   │   ├── CRITICAL_FILES_CANDIDATES.md
│   │   ├── DOCUMENT_STATUS_MODEL.md
│   │   ├── DOC_AUTHORITY_MAP.md
│   │   ├── ENTRYPOINTS.md
│   │   ├── EVIDENCE_INDEX.md
│   │   ├── EVIDENCE_LEDGER.md
│   │   ├── GITHUB_WORKFLOW.md
│   │   ├── INDEX.md
│   │   ├── IRON_PROTOCOL.md
│   │   ├── ISA_ACCEPTANCE_CRITERIA_v1.md
│   │   ├── ISA_AGENT_HANDOFF_PROTOCOL.md
│   │   ├── ISA_AGENT_PLATFORM_OPERATING_MODEL.md
│   │   ├── ISA_CAPABILITY_DELIVERY_WORKFLOW.md
│   │   ├── ISA_DEVELOPMENT_PLAYBOOK.md
│   │   ├── ISA_MANUS_PROJECT_GOVERNANCE.md
│   │   ├── ISA_ULTIMATE_VISION.md
│   │   ├── KNOWN_FAILURE_MODES.md
│   │   ├── LARGE_ASSETS.md
│   │   ├── LIVING_DOCUMENTATION_POLICY.md
│   │   ├── LLM_STRUCTURAL_RISK_ASSESSMENT.md
│   │   ├── MANUAL_EXTERNAL_REGISTER.md
│   │   ├── MANUAL_PREFLIGHT.md
│   │   ├── NO_GATES_WINDOW.md
│   │   ├── OPENCLAW_MODEL_ROUTING_POLICY.md
│   │   ├── OPENCLAW_POLICY_ENVELOPE.md
│   │   ├── OPEN_QUESTIONS.md
│   │   ├── PLANNING_POLICY.md
│   │   ├── PLANNING_TRACEABILITY_CANON.md
│   │   ├── PRODUCTION_DEPLOY_RUNBOOK.md
│   │   ├── PROGRAM_PLAN.md
│   │   ├── SCOPE_DECISIONS.md
│   │   ├── SECRET_RISK_FINDINGS.md
│   │   ├── TECHNICAL_DOCUMENTATION_CANON.md
│   │   ├── TEMPORAL_GUARDRAILS.md
│   │   ├── WORK_PRIORITIZATION.md
│   │   ├── _root
│   │   │   └── ISA_GOVERNANCE.md
│   │   ├── agent-prompt-governance.md
│   │   ├── credentials_presence.md
│   │   ├── governance-iron-protocol.md
│   │   ├── openclaw
│   │   │   ├── HP_FIX_REPORT_20260301T205814Z.md
│   │   │   ├── HP_ISSUES_20260301T205814Z.md
│   │   │   └── OPENCLAW_SKILLS_ENABLEMENT_PLAN.md
│   │   └── planning_artifacts
│   │       ├── CAPABILITY_DOCUMENTATION_REFACTOR_PLAN.md
│   │       ├── CAPABILITY_REFACTOR_SUMMARY.md
│   │       ├── ENV_KEY_REGISTRY.json
│   │       ├── PHASE_1_PROGRESS_REPORT.md
│   │       ├── PHASE_2_PROGRESS_SUMMARY.md
│   │       ├── PRE_ARCHITECTURE_REVIEW_PLAN.md
│   │       └── WORK_COMPLETED_SUMMARY.md
│   ├── gsmp_manual.txt
│   ├── isa_research_findings.md
│   ├── misc
│   │   └── _root
│   │       └── README.md
│   ├── ops
│   │   ├── CRON.md
│   │   ├── DEPLOYMENT.md
│   │   ├── RUNBOOK.md
│   │   └── spellcheck
│   │       ├── cspell-gs1-terms.txt
│   │       └── cspell-isa-terms.txt
│   ├── planning
│   │   ├── BACKLOG.csv
│   │   ├── INDEX.md
│   │   ├── NEXT_ACTIONS.json
│   │   ├── PROGRAM_PLAN.md
│   │   ├── agent-handoffs
│   │   │   └── README.md
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
│   │   │   ├── isa-capability-baseline.schema.json
│   │   │   ├── isa-capability-eval.schema.json
│   │   │   ├── isa-drift-report.schema.json
│   │   │   ├── knowledge-verification-posture.schema.json
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
│   │   │   ├── SOURCE_EXPANSION_SLICE.md
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
│   │   ├── ISA_DATA_PLANE_ARCHITECTURE.md
│   │   ├── KNOWLEDGE_BASE
│   │   │   ├── GS1_Attribute_Mapper_Technical_Specification.md
│   │   │   ├── IRON_KNOWLEDGE_MAP.md
│   │   │   ├── ISA_DOCUMENTATION_MAP.md
│   │   │   ├── PROVENANCE_PHASE3_HANDOFF.md
│   │   │   ├── PROVENANCE_REBUILD_SPEC.md
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
│   │   ├── READINESS_CHECKLIST.md
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
│   ├── 0015_groovy_vision.sql
│   ├── 0015_phase3_provenance_bridge.sql
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
│   │   ├── 0015_snapshot.json
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
│   │   ├── 0021_add_advisory_report_decision_artifacts.sql
│   │   ├── 0022_add_advisory_report_version_decision_artifacts.sql
│   │   ├── 0023_add_staleness_and_verification.sql
│   │   ├── 0024_add_advisory_target_join_tables.sql
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
├── drizzle.config.pg.ts
├── drizzle.config.ts
├── drizzle_pg
│   ├── migrations
│   │   ├── 0000_isa_top3_subset.sql
│   │   ├── 0001_top3_subset_parity.sql
│   │   ├── 0002_legacy_retrieval_bridge.sql
│   │   ├── 0003_ask_isa_runtime_tables.sql
│   │   └── 0004_phase3_provenance_bridge.sql
│   └── schema.ts
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
│   │   ├── generate_openclaw_configuration_audit.py
│   │   ├── generate_openclaw_effective_report.py
│   │   ├── generate_openclaw_external_analysis_export.py
│   │   └── repo_assessment.sh
│   ├── check-columns.ts
│   ├── check-db-status.ts
│   ├── check-env.js
│   ├── check-missing-tables.mjs
│   ├── compute_advisory_diff.cjs
│   ├── copilot
│   │   └── automerge_prs.sh
│   ├── coverage-full-execution.mjs
│   ├── coverage-phase2d-3.mjs
│   ├── coverage-strengthening-phase1.mjs
│   ├── coverage-strengthening-phase2a.mjs
│   ├── coverage-strengthening-phase2b.mjs
│   ├── coverage-strengthening-phase2c.mjs
│   ├── create-all-missing-tables.mjs
│   ├── create-dutch-initiatives-tables.sql
│   ├── create-esrs-tables.ts
│   ├── create-missing-tables.mjs
│   ├── cron-generate-embeddings.sh
│   ├── datasets
│   │   ├── build_registry.py
│   │   ├── create_gs1_eu_pcf_tables.sql
│   │   ├── generate_inventory.py
│   │   ├── ingest_gs1_eu_pcf_attributes.sql
│   │   └── ingest_gs1_eu_pcf_code_lists.sql
│   ├── dev
│   │   ├── _agent_fabric_lib.sh
│   │   ├── auto-sync-q-branch.sh
│   │   ├── check-keychain-secrets.sh
│   │   ├── cleanup-local-forbidden-files.sh
│   │   ├── create-agent-handoff.sh
│   │   ├── create-manus-handoff.sh
│   │   ├── get-scope-stats.mjs
│   │   ├── launch-isa-vscode.sh
│   │   ├── local-doctor.sh
│   │   ├── manus-readiness-precheck.py
│   │   ├── migrate-legacy-tidb-to-postgres.sh
│   │   ├── migrate-legacy-tidb-to-postgres.ts
│   │   ├── neo4j-bootstrap-foundation.py
│   │   ├── neo4j-bootstrap-foundation.sh
│   │   ├── neo4j-project-postgres-regulation-mappings.py
│   │   ├── neo4j-project-postgres-regulation-mappings.sh
│   │   ├── pg-rehydrate.sh
│   │   ├── pg-rehydrate.ts
│   │   ├── postgres-apply-migrations.sh
│   │   ├── postgres-apply-migrations.ts
│   │   ├── postgres-bootstrap-foundation.ts
│   │   ├── postgres-local-bootstrap.sh
│   │   ├── postgres-parity-smoke.sh
│   │   ├── postgres-parity-smoke.ts
│   │   ├── provision-agent-fabric-macos.sh
│   │   ├── rebuild-provenance-bridge.ts
│   │   ├── reconcile-branch-main-state.sh
│   │   ├── reconcile-branch-merge-probe.sh
│   │   ├── render-agent-env.sh
│   │   ├── render-codex-user-config.sh
│   │   ├── render-gemini-settings.sh
│   │   ├── resolve-agent-task-routing.sh
│   │   ├── resolve-capability-workflow.sh
│   │   ├── run-pipeline-verbose.mjs
│   │   ├── setup-q-branch.sh
│   │   ├── supabase-local-bootstrap.sh
│   │   ├── sync-keychain-secrets.sh
│   │   ├── test-db-ssl.mjs
│   │   ├── test-efrag-detail.mjs
│   │   ├── test-efrag-pipeline.mjs
│   │   ├── test-xml-parser.mjs
│   │   └── validate-agent-fabric.sh
│   ├── docker-down.sh
│   ├── docker-up.sh
│   ├── docs
│   │   └── ref_index.ts
│   ├── embed-new-products.mjs
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
│   │   ├── probe-ask-isa-v2-runtime.ts
│   │   ├── resolve-baseline-path.cjs
│   │   ├── run-ask-isa-v2-scenario-eval.ts
│   │   ├── run-capability-evals.cjs
│   │   ├── run-doc-governance-check.cjs
│   │   ├── run-provenance-runtime-check.ts
│   │   └── run-source-authority-check.cjs
│   ├── expand-knowledge-embeddings.mjs
│   ├── extract_advisory_v1.py
│   ├── gates
│   │   ├── calibration-manifest-sync.sh
│   │   ├── canonical-contract-drift.sh
│   │   ├── canonical-docs-allowlist.sh
│   │   ├── db-engine-adr-gate.sh
│   │   ├── db-only-scope-guard.sh
│   │   ├── doc-code-validator.sh
│   │   ├── governance-gate.sh
│   │   ├── knowledge-verification-posture.sh
│   │   ├── manifest-ownership-drift.py
│   │   ├── no-console-gate.sh
│   │   ├── observability-contract.sh
│   │   ├── openclaw-browser-policy.sh
│   │   ├── openclaw-exec-policy.sh
│   │   ├── openclaw-model-routing-policy.sh
│   │   ├── openclaw-policy-envelope.sh
│   │   ├── openclaw-skills-allowlist.sh
│   │   ├── parity-eval-structure-gate.sh
│   │   ├── perf-smoke.sh
│   │   ├── postgres-local-bootstrap-contract.sh
│   │   ├── reliability-smoke.sh
│   │   ├── security-gate.sh
│   │   ├── security-secrets-scan.sh
│   │   ├── slo-policy-check.sh
│   │   └── validate-proof-artifacts.sh
│   ├── generate-api-docs.ts
│   ├── generate-knowledge-embeddings.mjs
│   ├── generate-pg-schema-stubs.py
│   ├── generate_embeddings_standalone.ts
│   ├── governance
│   │   └── build_calibration_manifest.ts
│   ├── ingest-off-parallel.py
│   ├── ingest-off-products.mjs
│   ├── ingest-off-robust.mjs
│   ├── ingest-off-v2.mjs
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
│   ├── load-gs1-vocabulary.mjs
│   ├── migrate-embeddings-to-vector.mjs
│   ├── migrate-monitoring-tables.mjs
│   ├── migrate-scraper-health.sql
│   ├── openclaw-bootstrap.sh
│   ├── openclaw-config-apply.sh
│   ├── openclaw-dashboard-url.sh
│   ├── openclaw-doctor.sh
│   ├── openclaw-enable-core-skills.sh
│   ├── openclaw-hp-fix-validate.sh
│   ├── openclaw-isa-autonomy-setup.sh
│   ├── openclaw-isa-autonomy.sh
│   ├── openclaw-isa-dev-start.sh
│   ├── openclaw-model-route.sh
│   ├── openclaw-safe-exec.sh
│   ├── openclaw-skill-admit.sh
│   ├── openclaw-skill-install.sh
│   ├── openclaw-skill-route.sh
│   ├── openclaw-skill-stack-validate.sh
│   ├── openclaw-status.sh
│   ├── openclaw-sync-skills-allowlist.sh
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
│   ├── smoke
│   │   └── isa_router_smoke.sh
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
│   ├── vm
│   │   └── isa_vm_ssh.sh
│   └── vm-run.sh
├── seed-news.mjs
├── seed-supabase.mjs
├── server
│   ├── __fixtures__
│   │   ├── ask-isa-fixture-replay.test.ts
│   │   └── ask-isa-replay.json
│   ├── _core
│   │   ├── context.ts
│   │   ├── cookies.ts
│   │   ├── dataApi.ts
│   │   ├── embedding.ts
│   │   ├── env.ts
│   │   ├── error-tracking.ts
│   │   ├── excel.ts
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
│   │   ├── tracer.ts
│   │   ├── trpc.ts
│   │   ├── types
│   │   │   ├── cookie.d.ts
│   │   │   └── manusTypes.ts
│   │   ├── vite.ts
│   │   └── voiceTranscription.ts
│   ├── admin-analytics.test.ts
│   ├── advisory-compat.test.ts
│   ├── advisory-compat.ts
│   ├── advisory-diff-compat.test.ts
│   ├── advisory-diff-compat.ts
│   ├── advisory-diff-runtime.test.ts
│   ├── advisory-diff-runtime.ts
│   ├── advisory-diff-snapshot.test.ts
│   ├── advisory-diff-snapshot.ts
│   ├── advisory-diff.test.ts
│   ├── advisory-legacy-compat.test.ts
│   ├── advisory-legacy-compat.ts
│   ├── advisory-overview.ts
│   ├── advisory-read-model.test.ts
│   ├── advisory-read-model.ts
│   ├── advisory-report-decision-diff.test.ts
│   ├── advisory-report-decision-diff.ts
│   ├── advisory-report-export.test.ts
│   ├── advisory-report-export.ts
│   ├── advisory-report-versioning.test.ts
│   ├── advisory-report-versioning.ts
│   ├── alert-detection.ts
│   ├── alert-monitoring-cron.ts
│   ├── alert-notification-service.ts
│   ├── alert-system.test.ts
│   ├── ask-isa-cache.test.ts
│   ├── ask-isa-cache.ts
│   ├── ask-isa-guardrails.test.ts
│   ├── ask-isa-guardrails.ts
│   ├── ask-isa-integration.test.ts
│   ├── ask-isa-query-library.ts
│   ├── ask-isa-stage-a.test.ts
│   ├── ask-isa-stage-a.ts
│   ├── attribute-recommender-inventory.test.ts
│   ├── attribute-recommender-inventory.ts
│   ├── attribute-recommender.test.ts
│   ├── attribute-recommender.ts
│   ├── auth.logout.test.ts
│   ├── authority-model.test.ts
│   ├── authority-model.ts
│   ├── batch-epcis-processor.ts
│   ├── batch-generate-esrs-mappings.ts
│   ├── bm25-search.ts
│   ├── build-calibration-manifest.test.ts
│   ├── capability-eval-phase1.test.ts
│   ├── catalog-authority.test.ts
│   ├── catalog-authority.ts
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
│   ├── db-connection-pg.test.ts
│   ├── db-connection-pg.ts
│   ├── db-connection.ts
│   ├── db-coverage-analytics.ts
│   ├── db-coverage-analytics.unit.test.ts
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
│   ├── db-runtime-schema.ts
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
│   ├── esrs-decision-artifacts.test.ts
│   ├── esrs-decision-artifacts.ts
│   ├── esrs-gs1-mapping.test.ts
│   ├── esrs-mapping-capability-eval.test.ts
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
│   ├── hub-platform-stats.test.ts
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
│   ├── isa-capability-drift.test.ts
│   ├── knowledge-provenance.test.ts
│   ├── knowledge-provenance.ts
│   ├── knowledge-vector-search.ts
│   ├── load-gs1-attribute-mappings.ts
│   ├── load-gs1-esrs-mappings.ts
│   ├── mapping-feedback.test.ts
│   ├── mappings
│   │   ├── README.md
│   │   ├── esrs-gs1-calibration-data.ts
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
│   ├── postgres-rehydration.test.ts
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
│   │   │   ├── ask-isa-v2-intent.test.ts
│   │   │   ├── ask-isa-v2-retrieval.test.ts
│   │   │   ├── capability-heartbeat.test.ts
│   │   │   └── news-impact.test.ts
│   │   ├── admin-templates.ts
│   │   ├── advisory-diff.ts
│   │   ├── advisory-reports.test.ts
│   │   ├── advisory-reports.ts
│   │   ├── advisory.test.ts
│   │   ├── advisory.ts
│   │   ├── ask-isa-enhanced-routes.ts
│   │   ├── ask-isa-v2-intelligence.ts
│   │   ├── ask-isa-v2-retrieval.ts
│   │   ├── ask-isa-v2.ts
│   │   ├── ask-isa.ts
│   │   ├── attribute-recommender.test.ts
│   │   ├── attribute-recommender.ts
│   │   ├── citation-admin.test.ts
│   │   ├── citation-admin.ts
│   │   ├── compliance-risks.ts
│   │   ├── coverage-analytics.ts
│   │   ├── cron.ts
│   │   ├── dataset-registry.test.ts
│   │   ├── dataset-registry.ts
│   │   ├── dutch-initiatives.ts
│   │   ├── esg-artefacts.ts
│   │   ├── esrs-gs1-mapping.ts
│   │   ├── esrs-roadmap.test.ts
│   │   ├── esrs-roadmap.ts
│   │   ├── esrs.ts
│   │   ├── evaluation.ts
│   │   ├── executive-analytics.ts
│   │   ├── gap-analyzer.test.ts
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
│   │   │   ├── index.test.ts
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
│   │   │   ├── news-event-processor.ts
│   │   │   └── scrapers
│   │   │       ├── efrag-scraper.ts
│   │   │       ├── eu-commission-scraper.ts
│   │   │       └── eurlex-scraper.ts
│   │   ├── news-impact
│   │   │   └── index.ts
│   │   ├── rag-metrics
│   │   │   ├── index.ts
│   │   │   ├── source-diversity.ts
│   │   │   └── traceability-score.ts
│   │   └── rag-tracing
│   │       ├── failure-taxonomy.ts
│   │       ├── index.ts
│   │       └── metric-definitions.ts
│   ├── source-provenance.ts
│   ├── standards-directory.test.ts
│   ├── storage.ts
│   ├── supabase-connection.test.ts
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
│   │   ├── parse-embedding.ts
│   │   ├── pipeline-logger.ts
│   │   ├── server-logger.test.ts
│   │   └── server-logger.ts
│   ├── verification-posture.test.ts
│   ├── verification-posture.ts
│   ├── webhook-notification-service.test.ts
│   ├── webhook-notification-service.ts
│   └── weekly-cellar-ingestion.ts
├── shared
│   ├── _core
│   │   └── errors.ts
│   ├── ask-isa-confidence.test.ts
│   ├── ask-isa-confidence.ts
│   ├── const.ts
│   ├── epcis-cbv-types.ts
│   ├── gs1-link-types.ts
│   ├── news-tags.ts
│   ├── schemas
│   │   └── advisory-output.schema.json
│   └── types.ts
├── skills-lock.json
├── todo.md
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
└── vitest.setup.ts

234 directories, 1760 files
```
