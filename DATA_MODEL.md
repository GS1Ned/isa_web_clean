# ISA Data Model Documentation

**Last Updated:** December 10, 2025  
**Database:** TiDB (MySQL-compatible)  
**ORM:** Drizzle

---

## Database Schema Overview

ISA uses 14+ core tables organized into 5 functional domains:

1. **Compliance Data** (regulations, standards, ESRS, Dutch initiatives)
2. **Mappings** (regulation↔standard, regulation↔ESRS, initiative↔regulation)
3. **News & Intelligence** (hub_news, hub_news_history)
4. **Knowledge Base** (embeddings, Q&A conversations)
5. **User Management** (users, sessions)

---

## 1. Compliance Data Tables

### `regulations` (35 records)

EU sustainability regulations with AI-enhanced descriptions.

| Column          | Type         | Description                                                        |
| --------------- | ------------ | ------------------------------------------------------------------ |
| `id`            | INT (PK)     | Auto-increment primary key                                         |
| `name`          | VARCHAR(255) | Official regulation name                                           |
| `acronym`       | VARCHAR(50)  | Short acronym (e.g., "CSRD", "EUDR")                               |
| `category`      | ENUM         | Category: environmental, social, governance, product, supply_chain |
| `status`        | ENUM         | Status: proposed, adopted, in_force, under_review                  |
| `effectiveDate` | DATE         | When regulation takes effect                                       |
| `applicability` | TEXT         | Who must comply (e.g., "Large companies >500 employees")           |
| `description`   | TEXT         | AI-enhanced summary of requirements                                |
| `officialUrl`   | VARCHAR(500) | Link to EUR-Lex or official source                                 |
| `createdAt`     | TIMESTAMP    | Record creation time                                               |
| `updatedAt`     | TIMESTAMP    | Last modification time                                             |

**Indexes:**

- Primary key on `id`
- Index on `acronym` for fast lookups
- Index on `category` for filtering

**Sample Data:**

- CSRD (Corporate Sustainability Reporting Directive)
- EUDR (EU Deforestation Regulation)
- DPP (Digital Product Passport)
- CSDDD (Corporate Sustainability Due Diligence Directive)

---

### `gs1_standards` (60 records)

GS1 supply chain standards and identification systems.

| Column           | Type         | Description                                                                   |
| ---------------- | ------------ | ----------------------------------------------------------------------------- |
| `id`             | INT (PK)     | Auto-increment primary key                                                    |
| `standardName`   | VARCHAR(255) | Official standard name                                                        |
| `acronym`        | VARCHAR(50)  | Short code (e.g., "GTIN", "GLN", "EPCIS")                                     |
| `category`       | ENUM         | Category: identification, data_carrier, data_exchange, location, traceability |
| `description`    | TEXT         | What the standard does                                                        |
| `applicability`  | TEXT         | Use cases and industries                                                      |
| `technicalSpecs` | TEXT         | Technical implementation details                                              |
| `officialUrl`    | VARCHAR(500) | Link to GS1 documentation                                                     |
| `createdAt`      | TIMESTAMP    | Record creation time                                                          |
| `updatedAt`      | TIMESTAMP    | Last modification time                                                        |

**Indexes:**

- Primary key on `id`
- Index on `acronym` for fast lookups
- Index on `category` for filtering

**Sample Data:**

- GTIN (Global Trade Item Number)
- GLN (Global Location Number)
- SSCC (Serial Shipping Container Code)
- Digital Link (GS1 Web URI)
- EPCIS (Electronic Product Code Information Services)

---

### `esrs_datapoints` (1,184 records)

EFRAG European Sustainability Reporting Standards disclosure requirements.

| Column         | Type         | Description                                                        |
| -------------- | ------------ | ------------------------------------------------------------------ |
| `id`           | INT (PK)     | Auto-increment primary key                                         |
| `datapointId`  | VARCHAR(100) | Official EFRAG datapoint ID (e.g., "E1-1_01")                      |
| `esrsStandard` | VARCHAR(50)  | ESRS standard code (E1, E2, S1, G1, etc.)                          |
| `topic`        | VARCHAR(255) | Topic area (e.g., "Climate Change", "Water", "Workers")            |
| `subtopic`     | VARCHAR(255) | Specific subtopic                                                  |
| `name`         | VARCHAR(500) | Datapoint name/question                                            |
| `description`  | TEXT         | What must be disclosed                                             |
| `dataType`     | ENUM         | Type: narrative, monetary, percentage, date, boolean, quantitative |
| `mandatory`    | BOOLEAN      | Is disclosure mandatory?                                           |
| `phase`        | ENUM         | Implementation phase: phase1, phase2, phase3                       |
| `createdAt`    | TIMESTAMP    | Record creation time                                               |
| `updatedAt`    | TIMESTAMP    | Last modification time                                             |

**Indexes:**

- Primary key on `id`
- Unique index on `datapointId`
- Index on `esrsStandard` for filtering
- Index on `mandatory` for filtering

**Sample Data:**

- E1-1_01: "Gross Scope 1 GHG emissions"
- E2-4_12: "Water consumption in water-stressed areas"
- S1-6_03: "Percentage of employees covered by collective bargaining"

---

### `dutch_initiatives` (10 records)

Dutch national compliance programs and industry initiatives.

| Column                   | Type         | Description                                                          |
| ------------------------ | ------------ | -------------------------------------------------------------------- |
| `id`                     | INT (PK)     | Auto-increment primary key                                           |
| `name`                   | VARCHAR(255) | Initiative name                                                      |
| `acronym`                | VARCHAR(50)  | Short code (e.g., "UPV", "DSGO")                                     |
| `sector`                 | ENUM         | Sector: textiles, healthcare, construction, packaging, food, general |
| `status`                 | ENUM         | Status: active, pilot, proposed, completed                           |
| `scope`                  | TEXT         | What the initiative covers                                           |
| `keyTargets`             | TEXT         | Main goals and targets                                               |
| `complianceRequirements` | TEXT         | What participants must do                                            |
| `reportingDeadline`      | DATE         | When reports are due                                                 |
| `officialUrl`            | VARCHAR(500) | Link to initiative website                                           |
| `createdAt`              | TIMESTAMP    | Record creation time                                                 |
| `updatedAt`              | TIMESTAMP    | Last modification time                                               |

**Indexes:**

- Primary key on `id`
- Index on `sector` for filtering
- Index on `status` for filtering

**Sample Data:**

- UPV Textiel (Textile Sustainability Program)
- Green Deal Zorg (Healthcare Sustainability)
- DSGO (Duurzaam Schoon Gebouwde Omgeving - Construction)
- Verpact (Packaging Covenant)

---

## 2. Mapping Tables

### `regulation_gs1_mappings` (Auto-generated)

Links regulations to relevant GS1 standards.

| Column           | Type         | Description                     |
| ---------------- | ------------ | ------------------------------- |
| `id`             | INT (PK)     | Auto-increment primary key      |
| `regulationId`   | INT (FK)     | References `regulations.id`     |
| `gs1StandardId`  | INT (FK)     | References `gs1_standards.id`   |
| `relevanceScore` | DECIMAL(3,2) | AI confidence score (0.00-1.00) |
| `reasoning`      | TEXT         | Why this mapping exists         |
| `createdAt`      | TIMESTAMP    | When mapping was created        |

**Indexes:**

- Primary key on `id`
- Foreign key on `regulationId`
- Foreign key on `gs1StandardId`
- Composite index on `(regulationId, gs1StandardId)` for fast lookups

**Sample Mapping:**

- EUDR → GTIN (0.95 relevance, "Product identification for deforestation tracking")
- CSRD → EPCIS (0.88 relevance, "Supply chain traceability for Scope 3 emissions")

---

### `regulation_esrs_mappings` (449 records)

Links regulations to ESRS datapoints they trigger.

| Column            | Type         | Description                     |
| ----------------- | ------------ | ------------------------------- |
| `id`              | INT (PK)     | Auto-increment primary key      |
| `regulationId`    | INT (FK)     | References `regulations.id`     |
| `esrsDatapointId` | INT (FK)     | References `esrs_datapoints.id` |
| `relevanceScore`  | DECIMAL(3,2) | AI confidence score (0.00-1.00) |
| `reasoning`       | TEXT         | Why this datapoint is triggered |
| `createdAt`       | TIMESTAMP    | When mapping was created        |

**Indexes:**

- Primary key on `id`
- Foreign key on `regulationId`
- Foreign key on `esrsDatapointId`
- Composite index on `(regulationId, esrsDatapointId)`

**Sample Mapping:**

- EUDR → E1-5_03 (0.92 relevance, "Deforestation-related emissions disclosure")
- CSRD → E1-1_01 (0.98 relevance, "Mandatory Scope 1 GHG emissions reporting")

---

## 3. News & Intelligence Tables

### `hub_news` (Growing dataset)

ESG news articles with AI-powered enrichment and regulation tagging.

| Column              | Type          | Description                                                |
| ------------------- | ------------- | ---------------------------------------------------------- |
| `id`                | INT (PK)      | Auto-increment primary key                                 |
| `title`             | VARCHAR(500)  | News article title                                         |
| `summary`           | TEXT          | Article summary/excerpt                                    |
| `content`           | TEXT          | Full article content (markdown)                            |
| `url`               | VARCHAR(1000) | Source URL (unique constraint)                             |
| `publishedDate`     | TIMESTAMP     | Publication date                                           |
| `sourceType`        | ENUM          | EU_OFFICIAL, GS1_STANDARDS, DUTCH_NATIONAL                 |
| `sourceTitle`       | VARCHAR(255)  | Source name (e.g., "EUR-Lex Official Journal")             |
| `regulationTags`    | JSON          | Array of regulation codes ["CSRD", "PPWR"]                 |
| `gs1ImpactTags`     | JSON          | Array of GS1 impact areas ["traceability", "data_quality"] |
| `sectorTags`        | JSON          | Array of sector tags ["retail", "healthcare"]              |
| `impactLevel`       | ENUM          | HIGH, MEDIUM, LOW                                          |
| `gs1ImpactAnalysis` | TEXT          | AI-generated GS1 impact analysis                           |
| `suggestedActions`  | TEXT          | AI-generated action recommendations                        |
| `createdAt`         | TIMESTAMP     | Record creation time                                       |
| `updatedAt`         | TIMESTAMP     | Last modification time                                     |

**Indexes:**

- Primary key on `id`
- Unique index on `url` for deduplication
- Index on `publishedDate` for chronological queries
- Index on `sourceType` for filtering
- Index on `impactLevel` for priority sorting

**Source Types:**

- `EU_OFFICIAL` - EUR-Lex Official Journal, European Commission announcements
- `GS1_STANDARDS` - GS1 Standards News, white papers, guidance documents
- `DUTCH_NATIONAL` - Green Deal Zorg, Zero-Emission Zones, Plastic Pact NL

**Sample Data:**

- "CSRD First Reporting Deadline Approaches" (EU_OFFICIAL, HIGH impact)
- "GS1 Digital Link 1.2 Released" (GS1_STANDARDS, MEDIUM impact)
- "Green Deal Healthcare 2025 Progress Report" (DUTCH_NATIONAL, LOW impact)

---

### `hub_news_history` (Versioning table)

Tracks changes to news articles over time for audit and rollback.

| Column              | Type          | Description                    |
| ------------------- | ------------- | ------------------------------ |
| `id`                | INT (PK)      | Auto-increment primary key     |
| `originalNewsId`    | INT (FK)      | References `hub_news.id`       |
| `title`             | VARCHAR(500)  | Historical title               |
| `summary`           | TEXT          | Historical summary             |
| `content`           | TEXT          | Historical content             |
| `url`               | VARCHAR(1000) | Historical URL                 |
| `publishedDate`     | TIMESTAMP     | Historical publication date    |
| `sourceType`        | ENUM          | Historical source type         |
| `sourceTitle`       | VARCHAR(255)  | Historical source name         |
| `regulationTags`    | JSON          | Historical regulation tags     |
| `gs1ImpactTags`     | JSON          | Historical GS1 impact tags     |
| `sectorTags`        | JSON          | Historical sector tags         |
| `impactLevel`       | ENUM          | Historical impact level        |
| `gs1ImpactAnalysis` | TEXT          | Historical GS1 analysis        |
| `suggestedActions`  | TEXT          | Historical suggested actions   |
| `archivedAt`        | TIMESTAMP     | When this version was archived |

**Indexes:**

- Primary key on `id`
- Foreign key on `originalNewsId`
- Index on `archivedAt` for historical queries

**Purpose:**

- Track content changes when news articles are updated
- Enable rollback to previous versions
- Audit trail for AI enrichment changes
- Analyze how news coverage evolves over time

---

### `dutch_initiative_regulation_mappings` (Auto-generated)

Links Dutch initiatives to EU regulations they help comply with.

| Column              | Type         | Description                       |
| ------------------- | ------------ | --------------------------------- |
| `id`                | INT (PK)     | Auto-increment primary key        |
| `dutchInitiativeId` | INT (FK)     | References `dutch_initiatives.id` |
| `regulationId`      | INT (FK)     | References `regulations.id`       |
| `relevanceScore`    | DECIMAL(3,2) | How strongly related (0.00-1.00)  |
| `notes`             | TEXT         | Explanation of relationship       |
| `createdAt`         | TIMESTAMP    | When mapping was created          |

**Indexes:**

- Primary key on `id`
- Foreign key on `dutchInitiativeId`
- Foreign key on `regulationId`

---

### `dutch_initiative_gs1_mappings` (Auto-generated)

Links Dutch initiatives to GS1 standards they require.

| Column              | Type         | Description                       |
| ------------------- | ------------ | --------------------------------- |
| `id`                | INT (PK)     | Auto-increment primary key        |
| `dutchInitiativeId` | INT (FK)     | References `dutch_initiatives.id` |
| `gs1StandardId`     | INT (FK)     | References `gs1_standards.id`     |
| `relevanceScore`    | DECIMAL(3,2) | How strongly required (0.00-1.00) |
| `notes`             | TEXT         | Implementation details            |
| `createdAt`         | TIMESTAMP    | When mapping was created          |

**Indexes:**

- Primary key on `id`
- Foreign key on `dutchInitiativeId`
- Foreign key on `gs1StandardId`

---

## 3. Knowledge Base Tables

### `knowledge_embeddings` (155 records)

Searchable knowledge chunks for Ask ISA RAG system.

| Column        | Type         | Description                                                  |
| ------------- | ------------ | ------------------------------------------------------------ |
| `id`          | INT (PK)     | Auto-increment primary key                                   |
| `sourceType`  | ENUM         | Type: regulation, standard, esrs_datapoint, dutch_initiative |
| `sourceId`    | INT          | ID of source record                                          |
| `content`     | TEXT         | Searchable text chunk                                        |
| `contentHash` | VARCHAR(64)  | SHA-256 hash for deduplication                               |
| `title`       | VARCHAR(500) | Human-readable title for search results                      |
| `url`         | VARCHAR(500) | Link to detail page                                          |
| `metadata`    | JSON         | Additional context (category, tags, etc.)                    |
| `createdAt`   | TIMESTAMP    | When chunk was created                                       |
| `updatedAt`   | TIMESTAMP    | Last modification time                                       |

**Indexes:**

- Primary key on `id`
- Unique index on `contentHash` (prevents duplicates)
- Index on `sourceType` for filtering
- Composite index on `(sourceType, sourceId)` for lookups

**Deduplication:**
Content hash ensures identical text chunks are stored only once, even if they appear in multiple source records.

**Current Coverage:**

- 35 regulations → 35 chunks
- 60 GS1 standards → 60 chunks
- 1,184 ESRS datapoints → 55 unique chunks (high duplication)
- 10 Dutch initiatives → 5 chunks
- **Total: 155 unique knowledge chunks**

---

### `qa_conversations` (Variable)

User Q&A sessions with Ask ISA.

| Column         | Type               | Description                               |
| -------------- | ------------------ | ----------------------------------------- |
| `id`           | INT (PK)           | Auto-increment primary key                |
| `userId`       | INT (FK, nullable) | References `user.id` (null for anonymous) |
| `title`        | VARCHAR(500)       | Auto-generated from first question        |
| `messageCount` | INT                | Number of messages in conversation        |
| `createdAt`    | TIMESTAMP          | When conversation started                 |
| `updatedAt`    | TIMESTAMP          | Last message time                         |

**Indexes:**

- Primary key on `id`
- Foreign key on `userId`
- Index on `createdAt` for sorting

---

### `qa_messages` (Variable)

Individual messages within Q&A conversations.

| Column            | Type      | Description                                        |
| ----------------- | --------- | -------------------------------------------------- |
| `id`              | INT (PK)  | Auto-increment primary key                         |
| `conversationId`  | INT (FK)  | References `qa_conversations.id`                   |
| `role`            | ENUM      | Role: user, assistant                              |
| `content`         | TEXT      | Message text                                       |
| `sources`         | JSON      | Array of source citations (for assistant messages) |
| `retrievedChunks` | INT       | How many chunks were searched                      |
| `createdAt`       | TIMESTAMP | When message was sent                              |

**Indexes:**

- Primary key on `id`
- Foreign key on `conversationId`
- Index on `createdAt` for ordering

**Sources JSON Format:**

```json
[
  {
    "id": 3,
    "type": "regulation",
    "title": "EU Deforestation Regulation (EUDR)",
    "url": "/hub/regulations/3",
    "similarity": 0.85
  }
]
```

---

## 4. User Management Tables

### `user` (Managed by Manus OAuth)

User accounts and profiles.

| Column      | Type         | Description                |
| ----------- | ------------ | -------------------------- |
| `id`        | INT (PK)     | Auto-increment primary key |
| `openId`    | VARCHAR(255) | Manus OAuth user ID        |
| `name`      | VARCHAR(255) | Display name               |
| `email`     | VARCHAR(255) | Email address              |
| `avatar`    | VARCHAR(500) | Profile picture URL        |
| `role`      | ENUM         | Role: admin, user          |
| `createdAt` | TIMESTAMP    | Account creation time      |
| `updatedAt` | TIMESTAMP    | Last profile update        |

**Indexes:**

- Primary key on `id`
- Unique index on `openId`
- Index on `email`

---

## Data Relationships

```
regulations (35)
    ├─→ regulation_gs1_mappings ─→ gs1_standards (60)
    ├─→ regulation_esrs_mappings ─→ esrs_datapoints (1,184)
    └─→ dutch_initiative_regulation_mappings ←─ dutch_initiatives (10)
                                                    └─→ dutch_initiative_gs1_mappings ─→ gs1_standards

knowledge_embeddings (155)
    ├─→ sourceType = 'regulation' → regulations
    ├─→ sourceType = 'standard' → gs1_standards
    ├─→ sourceType = 'esrs_datapoint' → esrs_datapoints
    └─→ sourceType = 'dutch_initiative' → dutch_initiatives

qa_conversations
    ├─→ userId (nullable) → user
    └─→ qa_messages
            └─→ sources (JSON) → knowledge_embeddings
```

---

## Data Integrity Rules

### Foreign Key Constraints

- All mapping tables enforce referential integrity
- Deleting a regulation cascades to its mappings
- Deleting a user sets `qa_conversations.userId` to NULL

### Unique Constraints

- `esrs_datapoints.datapointId` must be unique
- `knowledge_embeddings.contentHash` must be unique
- `user.openId` must be unique

### Validation Rules

- `relevanceScore` must be between 0.00 and 1.00
- `effectiveDate` must be a valid date
- `mandatory` must be boolean (true/false)

---

## Data Maintenance

### Regular Updates

- **Regulations:** Check EUR-Lex monthly for new regulations
- **ESRS Datapoints:** Sync with EFRAG XBRL taxonomy quarterly
- **GS1 Standards:** Review GS1 documentation annually
- **Dutch Initiatives:** Update status and deadlines quarterly

### Data Quality Checks

- Validate all URLs are accessible
- Check for duplicate content in knowledge base
- Verify AI-generated mappings have reasonable relevance scores
- Ensure all ESRS datapoints have correct mandatory flags

### Backup & Recovery

- Daily automated backups via TiDB Cloud
- Point-in-time recovery available
- Checkpoint-based rollback for schema changes

---

## Migration History

| Date       | Version | Changes                                                   |
| ---------- | ------- | --------------------------------------------------------- |
| 2024-11-15 | Initial | Created regulations, gs1_standards, user tables           |
| 2024-11-20 | v2      | Added esrs_datapoints and regulation_esrs_mappings        |
| 2024-11-25 | v3      | Added dutch_initiatives and related mappings              |
| 2024-12-01 | v4      | Added knowledge_embeddings, qa_conversations, qa_messages |
| 2024-12-02 | v5      | Removed embedding vector column (switched to LLM scoring) |

---

## Performance Considerations

### Indexing Strategy

- All foreign keys have indexes for fast joins
- Frequently filtered columns (category, status, sector) have indexes
- Composite indexes on common query patterns

### Query Optimization

- Use `SELECT` with specific columns instead of `SELECT *`
- Limit result sets with `LIMIT` and pagination
- Use `JOIN` instead of multiple queries
- Cache frequently accessed data in React Query

### Scalability

- Current schema supports 10,000+ regulations without performance issues
- Knowledge base can scale to 100,000+ chunks with proper indexing
- Consider partitioning `qa_messages` if it exceeds 1M records

---

## Contact

**Database Administrator:** Manus Platform  
**Schema Owner:** ISA Development Team  
**Last Schema Update:** December 2, 2025
