# ISA Data Ingestion Guide (Web / Node.js)

This document standardises how ISA (Intelligent Standards Architect – web stack) ingests external datasets (GS1, ESRS, DPP, CTES/KDEs, CBV, etc.).

## 1. Directory Layout

All source files live under `/data` in the project root:

- `/data/gs1/...` – GS1 machine‑readable resources (GDM, GDSN, Benelux model, etc.)
- `/data/efrag/...` – ESRS / EFRAG related Excel or XBRL resources
- `/data/esg/...` – ESG‑specific JSONs (CTEs, KDEs, DPP rules)
- `/data/cbv/...` – CBV vocabularies
- `/data/digital_link/...` – Digital Link types and helpers
- `/data/other/...` – Other structured datasets

The goal is to keep `/data` focused on **machine‑readable, structured inputs**, not PDFs or large unstructured docs.

## 2. Ingestion Modules (TypeScript)

Each dataset has a dedicated ingestion module under `server/ingest` with this pattern:

- `server/ingest/INGEST-XX_<short_name>.ts`
- `server/ingest/INGEST-XX_<short_name>.test.ts`

Each ingestion module exports exactly one main function:

```ts
export interface IngestOptions {
  dryRun?: boolean;
  limit?: number;
}

export async function ingest<Something>(
  options?: IngestOptions
): Promise<void>;
```

Responsibilities:

- Read only from `/data/...` (never from external URLs at runtime).
- Parse the appropriate format: JSON, CSV, XLSX, or others as specified in the task.
- Map source records into ISA’s database using Drizzle ORM:
  - Raw tables (`raw_...`) to store 1:1 source records.
  - Staging tables (`stg_...`) for normalised structures.
  - Canonical tables (`dim_...`, `fact_...`) for ISA’s domain model (GS1 attributes, ESRS datapoints, CTES/KDEs, etc.).
- Be **idempotent**: safe to re‑run without duplicating canonical records.
- Log a concise summary of what happened (counts inserted/updated/skipped).

## 3. Database Integration (Drizzle ORM)

Ingestion modules must use the existing Drizzle schema in `drizzle/schema.ts` and the helpers in `server/db.ts` whenever possible.

General pattern:

- Define or reuse tables in `drizzle/schema.ts` for:
  - `raw_<source>_*` – raw records as close to source as possible.
  - `stg_<source>_*` – lightly transformed staging.
  - Canonical tables such as:
    - `gs1Attributes`, `gs1AttributeGroups`, `gs1Categories`
    - `esrsDatapoints`, `esrsTopics`
    - `ctes`, `kdes`
    - `dppProductCategories`, `dppIdentifierComponents`, `dppIdRules`
    - `cbvBizSteps`, `cbvDispositions`, etc.
- Use primary keys based on stable identifiers (attribute codes, datapoint IDs, URNs, etc.).
- Use upsert semantics (insert or update) to achieve idempotency.

Any new tables must be added with proper migrations following the project’s standard migration process.

## 4. Testing

Each ingestion module has a corresponding Vitest test file:

- `server/ingest/INGEST-XX_<short_name>.test.ts`

Tests should:

- Use **small fixtures** under `/data/fixtures/INGEST-XX_<short_name>_sample.*` where possible.
- Verify:
  - Happy path ingestion (rows inserted as expected).
  - Idempotency (two consecutive runs do not create duplicates).
  - Error handling (malformed records, missing mandatory fields).
  - Behaviour of `dryRun: true` (no DB writes, only logs).

## 5. Execution

Ingestion is typically executed via Node scripts exposed as `package.json` scripts, for example:

- `"ingest:gdm": "ts-node server/ingest/INGEST-01_gdm_attributes.ts"`
- `"ingest:gdsn": "ts-node server/ingest/INGEST-02_gdsn_current.ts"`
- `"ingest:esrs": "ts-node server/ingest/INGEST-04_esrs_taxonomy.ts"`

Manus (as the primary environment) is responsible for wiring these scripts into scheduled jobs, ad‑hoc CLI runs, or other automation.

## 6. Collaboration with ChatGPT

For each dataset, the detailed ingestion work is delegated to ChatGPT using task specs under:

- `tasks/for_chatgpt/INGEST-XX_<name>.md`

Each spec must include:

- Context and purpose of the dataset.
- Exact file paths under `/data/...`.
- Target tables and field mappings.
- Required function names/signatures.
- Test expectations and acceptance criteria.

ChatGPT then implements the ingestion module and tests following those specs and this guide. Manus integrates and runs the code inside the ISA project.
