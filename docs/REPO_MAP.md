# ISA Repository Map

**Version:** 1.0.0  
**Commit:** `bd6e18cabed87201790ede614576e14cb8548de1`  
**Last Updated:** 2026-01-27

---

## 1. Purpose

This document provides a high-level, evidence-bound map of the ISA repository. It is designed to be a **stable, low-maintenance entrypoint** for developers to quickly understand the project structure. Every statement is backed by a concrete file path.

---

## 2. Entrypoints

| Type | Command | Entrypoint File |
|---|---|---|
| **Development** | `pnpm dev` | `server/_core/index.ts` |
| **Production** | `pnpm start` | `dist/index.js` |
| **Frontend** | (Vite) | `client/index.html` → `client/src/main.tsx` |

---

## 3. Critical Files & Directories

### Top-20 Critical Files

| File | Responsibility | Why It Matters |
|---|---|---|
| `package.json` | Defines all dependencies and scripts | The single source of truth for the project's build and runtime environment. |
| `server/_core/index.ts` | Main backend server entrypoint | Initializes Express, tRPC, Vite, and all core middleware. |
| `server/routers.ts` | Root tRPC router | Aggregates all API endpoints into a single, type-safe router. |
| `server/db.ts` | Database connection and schema | Defines the Drizzle ORM instance and the database connection logic. |
| `drizzle/schema.ts` | Canonical database schema | The single source of truth for all database tables, columns, and relations. |
| `client/src/main.tsx` | Main frontend entrypoint | Renders the root React component and sets up the client-side environment. |
| `client/src/App.tsx` | Root React component | Defines the main application layout, routing, and core UI components. |
| `vite.config.ts` | Frontend build configuration | Controls how the React frontend is built, bundled, and served. |
| `server/_core/oauth.ts` | Authentication and authorization | Handles user login, session management, and role-based access control. |
| `server/ask-isa-guardrails.ts` | Ask ISA safety and validation | Implements guardrails to prevent harmful or off-topic queries. |
| `server/hybrid-search.ts` | Core Ask ISA search logic | Combines BM25 and vector search to retrieve relevant documents. |
| `server/ingest/` (directory) | Data ingestion pipelines | Contains all scripts for ingesting regulations, standards, and other data. |
| `server/_core/logger-wiring.ts` | Centralized logging | Configures the `pino` logger for structured, production-grade logging. |
| `server/_core/security-headers.ts` | HTTP security configuration | Defines CSP, CORS, and other security headers to protect against attacks. |
| `.github/workflows/iron-gate.yml.disabled` | IRON Protocol enforcement (disabled) | Legacy CI workflow currently disabled. |
| `docs/planning/NEXT_ACTIONS.json` | Execution queue (canonical) | The single source of what to work on next. |
| `docs/governance/IRON_PROTOCOL.md` | Core governance rules | Defines the rules of engagement for development. |
| `docs/governance/SCOPE_DECISIONS.md` | Persistent scope registry | Prevents scope creep and ensures a clean repository. |
| `README.md` | Project overview and setup | The first document a new developer should read. |
| `docs/spec/ARCHITECTURE.md` | High-level system design | Provides a conceptual overview of how the system fits together. |

### Top-10 Critical Directories

| Directory | Responsibility |
|---|---|
| `server/` | All backend logic, including tRPC, database, and core services. |
| `client/` | All frontend logic, including React components, styles, and assets. |
| `drizzle/` | Database schema and migration files. |
| `scripts/` | Standalone scripts for automation, maintenance, and governance (like IRON). |
| `data/` | Raw and processed data files used for ingestion. |
| `.github/` | CI/CD workflows, PR templates, and other GitHub-specific configuration. |
| `docs/` | All project documentation (deprecated in favor of IRON Knowledge Map). |
| `server/_core/` | The heart of the backend: server setup, auth, security, logging. |
| `server/ingest/` | All data ingestion pipelines and related logic. |
| `server/prompts/` | All LLM prompt templates for Ask ISA and other features. |

---

## 4. Where to Look First

| Topic | Primary Location | Secondary Location |
|---|---|---|
| **Authentication** | `server/_core/oauth.ts` | `server/authority-model.ts` |
| **Database** | `drizzle/schema.ts` | `server/db.ts` |
| **API (tRPC)** | `server/routers.ts` | `server/` (individual router files) |
| **Data Ingestion** | `server/ingest/` | `scripts/` (utility scripts) |
| **Ask ISA** | `server/hybrid-search.ts` | `server/prompts/ask_isa/` |
| **Planning** | `docs/planning/NEXT_ACTIONS.json` | `docs/planning/BACKLOG.csv` |
| **Monitoring** | `server/_core/performance-monitoring.ts` | `server/db-health-guard.test.ts` |

---

## 5. Canonical Documentation

| Document | Purpose |
|---|---|
| `README.md` | Project overview and setup instructions. |
| `docs/spec/ARCHITECTURE.md` | High-level conceptual overview of the system. |
| `docs/governance/_root/ISA_GOVERNANCE.md` | The active governance framework for all development. |
| `docs/governance/IRON_PROTOCOL.md` | The active, binding governance protocol for all development. |
| `docs/governance/IRON_KNOWLEDGE_MAP.md` | The single source of truth for finding all project documentation. |
