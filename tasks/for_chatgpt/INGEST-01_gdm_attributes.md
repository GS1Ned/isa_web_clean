# INGEST-01: GDM Core Canonical Attributes

## 1. Context

We have GS1 Global Data Model (GDM) machine‑readable resources available to ISA. These files describe GS1 attributes, attribute groups, categories, and validation rules.

Source files **must** be placed under `/data/gs1/gdm/` in the project root, for example:

- `/data/gs1/gdm/gdm_attributes.json`
- `/data/gs1/gdm/gdm_attributeGroups.json`
- `/data/gs1/gdm/gdm_categories.json`
- `/data/gs1/gdm/gdm_avps.json`
- `/data/gs1/gdm/gdm_codeValues.json`
- `/data/gs1/gdm/gdm_validationRules.json`

(If these files are not yet present, the user will add them from their local copies of the GS1 GDM packages.)

This ingestion builds ISA’s canonical GS1 attribute layer used by ESRS mappings, regulation coverage, and future recommendation engines.

## 2. Exact Task

Implement a TypeScript ingestion module that:

1. Reads the above JSON files from `/data/gs1/gdm/`.
2. Loads the records into ISA’s database via Drizzle ORM.
3. Populates both raw and canonical tables:

   - Raw staging tables preserving 1:1 source records (e.g. `raw_gdm_attributes`).
   - Canonical entities such as `gs1Attributes`, `gs1AttributeGroups`, `gs1Categories` (or equivalent existing tables).

4. Is idempotent (safe to re‑run without duplicating canonical records).
5. Exposes the following interface:

```ts
export interface IngestOptions {
  dryRun?: boolean;
  limit?: number;
}

export async function ingestGdmAttributes(
  options?: IngestOptions
): Promise<void>;
```

## 3. Files to Create

- `server/ingest/INGEST-01_gdm_attributes.ts`
- `server/ingest/INGEST-01_gdm_attributes.test.ts`
- Optional: small fixture file(s) under `/data/fixtures/INGEST-01_gdm_attributes_sample.json` if you need compact test inputs.

## 4. Source Format

The GDM JSON files are arrays/collections of objects describing attributes, groups, categories, AVPs, code lists, and rules. Use the real structures from the uploaded GDM JSON; do not assume any shape beyond what you see.

In the code, you may define TypeScript interfaces that match the shapes actually observed in the files. Focus first on attributes, attribute groups, and categories; AVPs and code values can be staged for later use if needed.

## 5. Target Tables and Mappings

Use the existing schema in `drizzle/schema.ts` where suitable. If required tables do not exist yet, propose reasonable new ones.

Example canonical tables (names are indicative; use actual schema names if they already exist):

- `gs1Attributes`

  - `id` (PK)
  - `code` (e.g. `netContent`)
  - `name`
  - `description`
  - `dataType`
  - `unitOfMeasure`
  - `groupId` (FK to attribute groups)
  - `sourceVersion` (e.g. `GDM_2.16`)
  - `sourceSystem` (e.g. `GDM`)
  - `createdAt`, `updatedAt`

- `gs1AttributeGroups`

  - `id`
  - `code`
  - `name`
  - `description`

- `gs1Categories`

  - `id`
  - `code`
  - `name`
  - `parentCode` (if available)

Raw tables should store the full original JSON payload (e.g. `rawJson` column) plus stable IDs for join/navigation.

## 6. Behaviour & Constraints

- Do not delete existing rows unless a task explicitly instructs you to.
- Use upsert logic keyed on stable identifiers (attribute code, group code, category code).
- On `dryRun: true`, perform all parsing and mapping but skip DB writes; log what would be inserted/updated.
- Design the module to handle partial datasets gracefully (e.g. if AVP or code list files are not present yet).

## 7. Testing Requirements

Implement `server/ingest/INGEST-01_gdm_attributes.test.ts` with Vitest:

- Use a small fixture sample (either from `/data/fixtures/INGEST-01_gdm_attributes_sample.json` or by mocking the file loader).
- Test happy path ingestion:
  - Attributes, groups, and categories are inserted as expected.
- Test idempotency:
  - Calling ` ingestGdmAttributes` twice does not duplicate canonical rows.
- Test `dryRun: true`:
  - No DB writes occur; verify via row counts.
- Test basic error handling for malformed records (e.g. missing required fields).

## 8. Acceptance Criteria

- Code compiles without TypeScript errors.
- All tests pass.
- The ingestion is idempotent and safe to re‑run.
- The canonical GS1 attribute tables are populated and can be reused by other ISA modules (e.g. ESRS mapping, recommendation engines).
