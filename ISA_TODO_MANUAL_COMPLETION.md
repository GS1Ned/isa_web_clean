# ISA TODOs for Manual Completion

> **Purpose:** Detailed instructions for completing key ISA development tasks without Manus AI.
> **Last Updated:** 2026-01-27

---

## 1. Run Full Data Ingestion

**Goal:** Populate the local TiDB database (`isa_db_fresh`) with all regulations, standards, and other data.

**Why:** The local database is currently empty. This prevents full testing of features like Ask ISA search.

**Steps:**

1.  **Set up environment:**
    -   Ensure you have a `.env` file in `/home/ubuntu/isa_web_clean` with a valid `DATABASE_URL` for TiDB Cloud.

2.  **Run CELLAR sync for regulations:**
    ```bash
    cd /home/ubuntu/isa_web_clean
    NODE_ENV=development pnpm exec tsx server/automated-cellar-sync.ts
    ```
    *This will take ~5-10 minutes and fetch recent EU regulations.*

3.  **Run main ingestion for GS1 data:**
    ```bash
    cd /home/ubuntu/isa_web_clean
    NODE_ENV=development pnpm exec tsx scripts/run-ingestion.ts
    ```
    *This is a long process (~30-60 minutes) that populates GDSN, CTE/KDE, DPP, and other data.*

4.  **Verify data:**
    -   Connect to your TiDB Cloud database.
    -   Check row counts in `regulations`, `gs1_standards`, `gdsn_classes`, etc.

---

## 2. Pre-compute Embeddings for Vector Search

**Goal:** Generate and store vector embeddings for all regulations and standards to enable fast semantic search.

**Why:** The current Ask ISA implementation uses hybrid search (vector + BM25), but vector search is slow without pre-computed embeddings.

**Steps:**

1.  **Ensure data is ingested** (see Task 1).

2.  **Create an embedding generation script:**
    -   Create a new script in `/home/ubuntu/isa_web_clean/scripts/` (e.g., `generate-embeddings.ts`).
    -   This script should:
        -   Fetch all regulations and standards from the database.
        -   For each document, prepare the content for embedding (using `prepareContentForEmbedding` from `server/embedding.ts`).
        -   Call an embedding model (e.g., OpenAI `text-embedding-ada-002`) to generate the vector.
        -   Store the vector in the `knowledge_chunks` table using `storeKnowledgeChunk` from `server/db-knowledge.ts`.

3.  **Run the script:**
    ```bash
    cd /home/ubuntu/isa_web_clean
    NODE_ENV=development pnpm exec tsx scripts/generate-embeddings.ts
    ```

---

## 3. Add Query Caching

**Goal:** Implement a caching layer for frequent Ask ISA queries to improve performance.

**Why:** Many users ask similar questions. Caching responses will reduce LLM calls and latency.

**Steps:**

1.  **Choose a caching solution:**
    -   Redis is a good option for in-memory caching.
    -   You can also use a simple in-memory cache for local development.

2.  **Modify the `ask` router in `server/routers/ask-isa.ts`:**
    -   Before the `hybridSearch` call, check if the user's question exists in the cache.
    -   If a cached response exists, return it immediately.
    -   If not, proceed with the search and LLM call.
    -   After generating a response, store it in the cache with the user's question as the key.

---

## 4. Expand Corpus with More Regulations

**Goal:** Add more key regulations to the `EU_ESG_to_GS1_Mapping_v1.1` artefact set.

**Why:** The current corpus has 12 instruments. Adding more (like Green Claims Directive, Battery Regulation) will improve ISA's coverage.

**Steps:**

1.  **Research the regulation on EUR-Lex:**
    -   Find the CELEX number, ELI URL, and key articles.

2.  **Update `corpus.json`:**
    -   Add a new instrument entry with all required metadata.

3.  **Update `obligations.json`:**
    -   Add new obligations with article-level citations.

4.  **Update `atomic_requirements.json`, `data_requirements.json`, `gs1_mapping.json`, `scoring.json`:**
    -   Create new entries for the new obligations, following the existing structure.

5.  **Update `CHANGELOG.md` and `backlog.json`:**
    -   Document the changes and create a new backlog item if needed.

---

## 5. Implement Missing Hub Pages

**Goal:** Fix the 404 errors for `/hub/standards` and `/hub/esrs`.

**Why:** These pages are linked in the UI but not implemented.

**Steps:**

1.  **Open `client/src/App.tsx`**.

2.  **Add route aliases:**
    ```tsx
    <Route path="/hub/standards" component={StandardsDirectory} />
    <Route path="/hub/esrs" component={ESRSDatapoints} />
    ```

3.  **Verify the fix:**
    -   Run the development server (`pnpm run dev`).
    -   Navigate to `/hub/standards` and `/hub/esrs` to confirm they load correctly.

---

*This document provides a starting point for manual completion. Refer to the `ISA_DEVELOPMENT_PLAYBOOK.md` for more detailed guidance.*
