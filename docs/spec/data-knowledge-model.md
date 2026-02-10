# Data & Knowledge Model

**Canonical Specification**
**Status:** CURRENT (as-built)

## 1. Identity

- **Name:** Data & Knowledge Model
- **Scope:** CURRENT state of data & knowledge model
- **Marker:** CURRENT (as-built) — not ULTIMATE

## 2. Core Sources

1. `./docs/GS1_Attribute_Mapper_Technical_Specification.md`
2. `./ARCHITECTURE.md`
3. `./docs/ISA_INFORMATION_ARCHITECTURE.md`
4. `./docs/PIPELINE_OBSERVABILITY_SPEC.md`
5. `./CHATGPT_PROMPT_BATCH_INGEST_02_04_05_06.md`
6. `./tasks/for_chatgpt/INGEST-02_gdsn_current.md`
7. `./CHATGPT_UPDATE_PROMPT.md`
8. `./DATA_MODEL.md`
9. `./docs/ADVISORY_OUTPUTS.md`
10. `./docs/CHATGPT_INTEGRATION_CONTRACT.md`

## 3. Definitions

*See ISA_MASTER_SPEC.md*

## 4. Retrieval and Embeddings

*See [Retrieval and Embeddings](./retrieval-and-embeddings.md) for all definitions, rules, and gates related to embedding models and retrieval strategies.*

## 5. Database Governance

*See [Database Governance](./database-governance.md) for all definitions, rules, and gates related to database configuration, schema management, and data access.*

## 6. Datamodeldefinities (Data Model Definitions)

### Tabel: `gs1_attributes`

| Veldnaam | Datatype | Beschrijving |
|---|---|---|
| `id` | `integer` | Primaire sleutel |
| `name` | `string` | Naam van het attribuut |
| `description` | `text` | Beschrijving van het attribuut |
| `format` | `string` | Technisch formaat (bijv. GDSN_XML, EDI_SEGMENT) |
| `required` | `boolean` | Geeft aan of het attribuut verplicht is |

### Tabel: `regulation_attribute_mappings`

| Veldnaam | Datatype | Beschrijving |
|---|---|---|
| `id` | `integer` | Primaire sleutel |
| `regulation_id` | `integer` | Foreign key naar de `regulations` tabel |
| `attribute_id` | `integer` | Foreign key naar de `gs1_attributes` tabel |
| `requirement_level` | `enum` | Niveau van vereiste (MANDATORY, RECOMMENDED, CONDITIONAL) |
| `rationale` | `text` | Uitleg waarom dit attribuut vereist is |

## 7. Validatieregels (Validation Rules)

| Regel-ID | Regel | Logica |
|---|---|---|
| VAL-001 | Het `rationale` veld in de `regulation_attribute_mappings` tabel mag niet leeg zijn als `requirement_level` 'MANDATORY' is. | `CASE WHEN requirement_level = 'MANDATORY' THEN rationale IS NOT NULL ELSE TRUE END` |
| VAL-002 | Het `requirement_level` veld in de `regulation_attribute_mappings` tabel moet een van de volgende waarden hebben: 'MANDATORY', 'RECOMMENDED', 'CONDITIONAL'. | `requirement_level IN ('MANDATORY', 'RECOMMENDED', 'CONDITIONAL')` |

## 8. Kwaliteitspoorten (Gate Definitions)

| Poort-ID | Poortnaam | Trigger | Invoercriteria | Validatiestappen | Uitvoercriteria |
|---|---|---|---|---|---|
| DG-001 | GS1 Navigator Data Curation Gate | Na de geautomatiseerde scraping van de GS1 Navigator. | Een set van nieuw gescrapete GS1-attributen. | Verifieer dat alle verplichte velden (bijv. `name`, `required`) aanwezig en correct zijn voor elk attribuut. | Succes als alle validatiestappen slagen; anders, falen. |
| DG-002 | Regulation-to-Attribute Mapping Gate | Na het handmatig of geautomatiseerd toevoegen van nieuwe mappings. | Een set van nieuwe `regulation_attribute_mappings`. | Verifieer dat alle mappings voldoen aan de gedefinieerde validatieregels (VAL-001, VAL-002). | Succes als alle mappings geldig zijn; anders, falen. |

## 9. Interfaces / Pipelines

*See source documents.*

## 10. Governance & Change Control

1. Review source documents
2. Update TRACEABILITY_MATRIX.csv
3. Follow governance rules

## 11. Observability

**OPEN ISSUE:** Define observability hooks.

## 12. Acceptance Criteria

- AC-1: 3. **Validate:** Cross-reference with GS1 official documentation to ensure accuracy
- AC-2: it("should retrieve attributes by standard", async () => {
- AC-3: it("should retrieve attributes by technical format", async () => {
- AC-4: it("should search attributes by keyword", async () => {
- AC-5: it("should create regulation-attribute mapping", async () => {

## 13. Traceability Annex

*This section will be updated after the finalization of the new data model definitions, rules, and gates.*
