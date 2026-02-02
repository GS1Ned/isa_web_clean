# ISA Manus Project Governance

**Authoritative Project Context, Secrets & Runtime Governance**

---

## 1. Purpose and Scope

This document defines the **authoritative governance model** for the ISA (Intelligent Standards Assistant) project as executed within the Manus platform.

It establishes:

* A single, stable **control plane** for project-level context
* Canonical handling of **secrets, credentials, and runtime configuration**
* Clear rules for **task inheritance and disposability**
* A binding **registry of all variables and secrets (names-only)**

This document is **normative** for all ISA-related Manus tasks.

---

## 2. Governance Principles

1. **Single Source of Truth**
   Each secret or variable has exactly one canonical definition and storage location.

2. **Task Disposability**
   Any non-root task must be safely discardable without loss of configuration.

3. **No Secret Proliferation**
   Secrets are never duplicated, embedded in prompts, or stored in documents.

4. **Explicit Over Implicit**
   All configuration assumptions must be written down.

5. **Human-in-the-Loop for Trust Barriers**
   CAPTCHA, OAuth logins, admin dashboards, and payments require human action.

---

## 3. Manus Project Model (Authoritative Interpretation)

Manus currently provides:

* Task-scoped secrets
* Implicit inheritance when tasks are continued
* No true project-level secret store

Therefore, **project-level governance is implemented textually** via this document.

---

## 4. Designated Root Runtime Task

### 4.1 Canonical Root Task

**Task ID:** `XsS2SbpYk0TBf9gWDsxsiX`
This task is designated as:

> **ISA_ROOT_RUNTIME_TASK**

### 4.2 Responsibilities

The ISA_ROOT_RUNTIME_TASK is the **only task** that may store:

* Database credentials
* API keys
* OAuth configuration
* Cron secrets
* Application secrets used across tasks

### 4.3 Immutability Rules

The root task:

* MUST NOT be deleted
* MUST NOT be archived
* MUST NOT be duplicated
* MUST NOT be replaced

---

## 5. Secret and Credential Governance

### 5.1 Definition of a Secret

Secrets include:

* Passwords
* API keys
* Tokens
* Signing secrets
* Cron authentication secrets

### 5.2 Storage Rules

* Secrets are stored **only** in ISA_ROOT_RUNTIME_TASK
* Secrets are never committed, logged, or copied into prompts

### 5.3 Discovery Rule

If a required variable is missing:

* Execution stops
* Only the **variable name** is reported
* Values are never requested inline

---

## 6. Task Creation and Continuation Rules

* All ISA tasks MUST be created by **continuing from the root task**
* “Blank” tasks are forbidden for ISA work
* Secrets may never be redefined in child tasks

---

## 7. External Trust Boundaries

The following cannot be automated:

* Cloudflare CAPTCHA
* OAuth consent
* Admin dashboards
* Payments

Manus must pause and report; a human must intervene.

---

## 8. ISA Secret & Variable Registry (Names-Only)

This registry is **authoritative**.
Names only — **never values**.

---

### 8.1 Database & Persistence

| Name         | Type   | Description                            |
| ------------ | ------ | -------------------------------------- |
| DATABASE_URL | Secret | Canonical MySQL/TiDB connection string |

---

### 8.2 Authentication & Authorization

| Name             | Type     | Description                     |
| ---------------- | -------- | ------------------------------- |
| JWT_SECRET       | Secret   | Cookie / session signing secret |
| OAUTH_SERVER_URL | Variable | Manus OAuth backend             |
| OWNER_OPEN_ID    | Variable | Project owner OpenID            |

---

### 8.3 LLM & AI

| Name           | Type   | Description               |
| -------------- | ------ | ------------------------- |
| OPENAI_API_KEY | Secret | OpenAI API authentication |

---

### 8.4 Manus Built-in / Forge APIs

| Name                        | Type     | Description                   |
| --------------------------- | -------- | ----------------------------- |
| BUILT_IN_FORGE_API_URL      | Variable | Manus internal API base       |
| BUILT_IN_FORGE_API_KEY      | Secret   | Manus internal API key        |
| VITE_FRONTEND_FORGE_API_URL | Variable | Frontend-accessible Forge URL |

---

### 8.5 Frontend & App Identity

| Name                  | Type     | Description                 |
| --------------------- | -------- | --------------------------- |
| VITE_APP_ID           | Variable | Manus application ID        |
| VITE_OAUTH_PORTAL_URL | Variable | Manus login portal          |
| VITE_APP_URL          | Variable | Public application base URL |

---

### 8.6 Email & Notifications (Optional)

| Name             | Type     | Description          |
| ---------------- | -------- | -------------------- |
| SENDGRID_API_KEY | Secret   | SendGrid API key     |
| SENDER_EMAIL     | Variable | Sender email address |
| SMTP_HOST        | Variable | SMTP hostname        |
| SMTP_PORT        | Variable | SMTP port            |
| SMTP_USER        | Variable | SMTP username        |
| SMTP_PASSWORD    | Secret   | SMTP password        |
| SMTP_SECURE      | Variable | SMTP TLS flag        |

---

### 8.7 Cron & Automation

| Name        | Type   | Description                    |
| ----------- | ------ | ------------------------------ |
| CRON_SECRET | Secret | Auth secret for scheduled jobs |
| GITHUB_PAT  | Secret | Fine-grained GitHub PAT        |

---

### 8.8 Runtime & Feature Flags

| Name                 | Type     | Description               |
| -------------------- | -------- | ------------------------- |
| NODE_ENV             | Variable | Runtime environment       |
| PORT                 | Variable | HTTP server port          |
| DRY_RUN              | Variable | Dry-run mode              |
| FORCE_REGENERATE     | Variable | Force regeneration        |
| BATCH_SIZE           | Variable | Batch size                |
| CONCURRENCY          | Variable | Parallelism               |
| RATE_LIMIT_MS        | Variable | API delay                 |
| RUN_DB_TESTS         | Variable | Enable DB tests           |
| RUN_CELLAR_TESTS     | Variable | Enable CELLAR tests       |
| ISA_ADVISORY_VERSION | Variable | Advisory feature selector |

---

### 8.9 Legacy / Alternate DB Config (Fallback Only)

These exist **only for backward compatibility**.

| Name        | Type     | Description        |
| ----------- | -------- | ------------------ |
| DB_HOST     | Variable | Legacy DB host     |
| DB_USER     | Secret   | Legacy DB user     |
| DB_PASSWORD | Secret   | Legacy DB password |
| DB_NAME     | Variable | Legacy DB name     |

---

### 8.10 Platform-Injected / Docs-Only

| Name                      | Type     | Description        |
| ------------------------- | -------- | ------------------ |
| OWNER_NAME                | Variable | Owner display name |
| VITE_ANALYTICS_ENDPOINT   | Variable | Analytics endpoint |
| VITE_ANALYTICS_WEBSITE_ID | Variable | Analytics site id  |

---

## 9. Storage & Responsibility Matrix

### 9.1 Storage Locations

| Location              | Purpose                |
| --------------------- | ---------------------- |
| ISA_ROOT_RUNTIME_TASK | Canonical secret store |
| GitHub Secrets        | CI/CD only             |
| Local `.env`          | Local dev only         |
| Governance Doc        | Names & rules only     |

### 9.2 Responsibility Split

| Actor | Responsibility                 |
| ----- | ------------------------------ |
| Human | Create, rotate, revoke secrets |
| Manus | Consume secrets by name        |
| Manus | Report missing variables       |
| CI    | Non-interactive usage          |

---

## 10. Manus Task Document Exports

Documents created inside tasks must be exported to:

`docs/evidence/manus_task_exports/<task_id>/`

They are **not authoritative** until:

1. Committed to repo
2. Reflected in this governance doc

---

## 11. Change Management

* Registry changes require intent
* Code introducing undeclared variables is non-compliant
* Drift is a governance failure

---

## 12. Final Statement

This governance model is deliberate, enforceable, and stable.
All ISA work within Manus is bound by this document.
