# ISA Next-Generation Development Plan

**Date:** February 1, 2026  
**Author:** Manus AI  
**Status:** Proposed Plan

## 1. Executive Summary

Following a comprehensive analysis of the current ISA platform, including its capabilities, roadmap, and underlying data, this document outlines a detailed, two-sprint development plan to address the most critical gaps and unlock the next level of compliance intelligence. The analysis reveals that while the foundational technology is robust, the platform's value is severely limited by incomplete data, particularly the absence of critical mappings between regulations, ESRS datapoints, and GS1 standards.

The highest priority is to achieve **full data ingestion and establish these core data relationships**. This will transform ISA from a collection of siloed information into a true intelligence engine capable of answering complex, multi-hop compliance questions. This plan is designed to be executed with maximum autonomy and productivity, focusing on delivering the highest possible value in the shortest time.

## 2. Current State Analysis

A review of the production database, `ROADMAP.md`, and `ISA_CAPABILITY_MAP.md` identified the following key insights:

| Area | Status | Implication |
| :--- | :--- | :--- |
| **Data Content** | 🔴 **Critical Gap** | Key tables such as `gs1_standards`, `hub_news`, and `dutch_initiatives` are empty. The `regulations` table contains only 3 entries. |
| **Data Mappings** | 🔴 **Critical Gap** | The `regulation_esrs_mappings` and `gs1_esrs_mappings` tables are empty. This is the single biggest blocker to advanced reasoning. |
| **Embeddings** | 🟢 **Healthy** | The `knowledge_embeddings` table is well-populated with 1,001 entries, providing a solid foundation for semantic search. |
| **Roadmap Alignment** | 🟢 **Aligned** | The top priority in the existing `ROADMAP.md` is "Full data ingestion to local database," which perfectly matches our findings. |
| **Capability Vision** | 🟡 **Opportunity** | The `ISA_CAPABILITY_MAP.md` outlines a powerful vision for reasoning and inference, which is currently unachievable due to the data gaps. |

**Conclusion:** The immediate and overriding priority is to build the data foundation. Without comprehensive and connected data, any work on advanced features like UI enhancements or agentic behavior would be premature and deliver minimal value.

## 3. Proposed Development Sprints

This plan is structured into two, two-week sprints designed for rapid, focused execution.

### Sprint 1: Foundational Data & Core Mappings (2 Weeks)

**Goal:** Achieve full data ingestion for all core entities and establish the critical regulation-to-standard mappings. This sprint focuses on building the data backbone of ISA.

| Task ID | Task Description | Priority | Deliverables |
| :--- | :--- | :--- | :--- |
| **S1-T1** | **Implement `gs1_standards` Ingestion** | P0 | A script to fully populate the `gs1_standards` table; at least 60 standards ingested. |
| **S1-T2** | **Expand `regulations` Ingestion** | P0 | Enhance the EUR-Lex pipeline to ingest all 35+ relevant sustainability regulations. |
| **S1-T3** | **Implement `hub_news` Ingestion** | P0 | Scrapers for EU, GS1, and Dutch news sources; at least 100 news articles ingested. |
| **S1-T4** | **Generate `regulation_esrs_mappings`** | P0 | An AI-powered pipeline to generate and populate the mappings between regulations and ESRS datapoints. |
| **S1-T5** | **Generate `gs1_esrs_mappings`** | P0 | An AI-powered pipeline to generate and populate the mappings between GS1 standards and ESRS datapoints. |
| **S1-T6** | **Full Embedding Generation** | P1 | Regenerate all embeddings for the newly ingested and mapped content to ensure data freshness. |

### Sprint 2: UI Enhancements & Reasoning (2 Weeks)

**Goal:** Leverage the new data foundation to deliver a step-change in user experience and answer quality. This sprint focuses on making the new intelligence visible and accessible to the user.

| Task ID | Task Description | Priority | Deliverables |
| :--- | :--- | :--- | :--- |
| **S2-T1** | **Implement Advanced Filtering** | P0 | Enhance the "Ask ISA" UI with filters for `authority_level`, `semantic_layer`, and `source_type`. |
| **S2-T2** | **Implement Reasoning Engine (v1)** | P0 | Implement "Approach 1A: Chain-of-Thought Prompting" from the Capability Map to answer multi-hop questions. |
| **S2-T3** | **Visualize Data Mappings** | P1 | On regulation and standard detail pages, display the newly generated ESRS mappings. |
| **S2-T4** | **Implement Conversation History** | P1 | Add a sidebar to the "Ask ISA" interface to save and resume conversations. |
| **S2-T5** | **Implement "Export to PDF"** | P2 | Add a feature to export Ask ISA answers and their sources to a branded PDF report. |

## 4. Next Steps

Upon your approval, I will immediately begin execution of **Sprint 1, Task 1 (S1-T1): Implement `gs1_standards` Ingestion**. I will operate with full autonomy to maximize progress and will provide a summary report at the conclusion of each sprint.
