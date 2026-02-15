# How to Query the Archive2 Index

**Audience:** ChatGPT, Manus, and human developers  
**Purpose:** Practical guide for discovering relevant repositories from Archive2 for specific tasks

---

## Overview

The Archive2 index (`data/metadata/external_repos_archive2.json`) contains 20 GS1/ESG repositories structured for programmatic discovery. This guide shows exactly how to query it for specific development tasks.

---

## Index Structure

Each repository entry has:

```json
{
  "id": "unique-identifier",
  "sourceZip": "Archive 2/repo-name.zip",
  "standards": ["Standard 1", "Standard 2"],
  "regulations": ["Regulation 1"],
  "roles": ["role_1", "role_2"],
  "priority": "high|medium-high|medium|low-medium|low"
}
```

### Available Roles

- `semantic_reference` - Semantic models and vocabularies
- `validation_reference` - Validation logic and rules
- `schema_reference` - Schema definitions
- `parsing_reference` - Parsing patterns and examples
- `generation_reference` - Code generation patterns
- `test_case_source` - Test cases and examples
- `pattern_reference` - Implementation patterns
- `conformance_test_reference` - Conformance test suites
- `architecture_reference` - Architecture patterns
- `ingestion_candidate` - Structured data ready for ingestion
- `traceability_reference` - Traceability patterns
- `esg_reference` - ESG/sustainability patterns
- `technical_reference` - Technical specifications
- `identifier_reference` - Identifier handling patterns
- `historical_reference` - Legacy/historical data
- `low_priority_reference` - Minor references

---

## Query Patterns for Common Tasks

### Task 1: Implementing EPCIS Features

**Goal:** Find repositories with EPCIS examples, patterns, and test cases

**Step 1: Filter by Standard**

```javascript
// Read the index
const repos = require('./data/metadata/external_repos_archive2.json');

// Find EPCIS-related repos
const epcisRepos = repos.filter(repo => 
  repo.standards.some(std => std.includes('EPCIS') || std.includes('CBV'))
);

print(epcisRepos);
```

**Result:**
```json
[
  {
    "id": "epcis",
    "sourceZip": "Archive 2/EPCIS-master.zip",
    "standards": ["EPCIS", "CBV"],
    "regulations": [],
    "roles": ["traceability_reference", "test_case_source"],
    "priority": "high"
  }
]
```

**Step 2: Extract the Repository**

```bash
# Extract EPCIS repo from Archive2
cd /home/ubuntu/isa_web
unzip -q data/external/Archive_2.zip "EPCIS-master.zip" -d /tmp/
unzip -q /tmp/EPCIS-master.zip -d /tmp/epcis_repo/

# Now explore the contents
ls -la /tmp/epcis_repo/EPCIS-master/
```

**Step 3: Use the Content**

The EPCIS repo contains:
- Example EPCIS events (XML/JSON-LD)
- RDF diagrams showing event structure
- XSL transformation tools
- EPCIS 1.2 to 2.0 conversion examples

Use these as:
- Test fixtures for EPCIS ingestion
- Reference for event structure validation
- Patterns for EPCIS-to-database mapping

---

### Task 2: Building Digital Link URI Parser

**Goal:** Find repositories with Digital Link parsing patterns and test cases

**Step 1: Filter by Standard + Role**

```javascript
const repos = require('./data/metadata/external_repos_archive2.json');

// Find Digital Link parsing references
const dlParsingRepos = repos.filter(repo => 
  repo.standards.some(std => std.includes('Digital Link')) &&
  repo.roles.includes('parsing_reference')
);

print(dlParsingRepos);
```

**Result:**
```json
[
  {
    "id": "interpretgs1scan",
    "sourceZip": "Archive 2/interpretGS1scan-master.zip",
    "standards": ["GS1 barcodes", "GS1 Digital Link"],
    "roles": ["parsing_reference", "test_case_source"],
    "priority": "high"
  },
  {
    "id": "gs1-digital-link-uri-simple-parser",
    "sourceZip": "Archive 2/gs1-digital-link-uri-simple-parser-main.zip",
    "standards": ["GS1 Digital Link"],
    "roles": ["parsing_reference", "test_case_source"],
    "priority": "medium"
  }
]
```

**Step 2: Extract and Compare**

```bash
# Extract both parsers
cd /home/ubuntu/isa_web
unzip -q data/external/Archive_2.zip "interpretGS1scan-master.zip" -d /tmp/
unzip -q data/external/Archive_2.zip "gs1-digital-link-uri-simple-parser-main.zip" -d /tmp/

# Compare approaches
ls /tmp/interpretGS1scan-master/
ls /tmp/gs1-digital-link-uri-simple-parser-main/
```

**Step 3: Use as Reference**

- Study parsing logic from both implementations
- Extract test cases (edge cases, malformed URIs)
- Adapt patterns to ISA's TypeScript codebase
- Use test cases to validate ISA's parser

---

### Task 3: Implementing EUDR Compliance

**Goal:** Find repositories related to EUDR regulation

**Step 1: Filter by Regulation**

```javascript
const repos = require('./data/metadata/external_repos_archive2.json');

// Find EUDR-related repos
const eudrRepos = repos.filter(repo => 
  repo.regulations.includes('EUDR')
);

print(eudrRepos);
```

**Result:**
```json
[
  {
    "id": "eudr-tool",
    "sourceZip": "Archive 2/EUDR-tool-main.zip",
    "standards": ["GS1 Web Vocabulary"],
    "regulations": ["EUDR"],
    "roles": ["pattern_reference", "test_case_source"],
    "priority": "high"
  }
]
```

**Step 2: Also Find Related Standards**

```javascript
// EUDR uses GS1 Web Vocabulary, so also find WebVoc
const webvocRepos = repos.filter(repo => 
  repo.standards.includes('GS1 Web Vocabulary')
);

print(webvocRepos);
```

**Result:**
```json
[
  {
    "id": "webvoc",
    "sourceZip": "Archive 2/WebVoc-master.zip",
    "standards": ["GS1 Web Vocabulary", "GS1 Digital Link"],
    "roles": ["semantic_reference"],
    "priority": "high"
  },
  {
    "id": "eudr-tool",
    "sourceZip": "Archive 2/EUDR-tool-main.zip",
    "standards": ["GS1 Web Vocabulary"],
    "regulations": ["EUDR"],
    "roles": ["pattern_reference", "test_case_source"],
    "priority": "high"
  }
]
```

**Step 3: Extract and Study**

```bash
# Extract EUDR tool and WebVoc
cd /home/ubuntu/isa_web
unzip -q data/external/Archive_2.zip "EUDR-tool-main.zip" "WebVoc-master.zip" -d /tmp/
```

**Step 4: Use the Content**

From EUDR-tool:
- See how EUDR notifications are structured
- Study mapping from supply chain data to EUDR requirements
- Extract vocabulary terms used for EUDR

From WebVoc:
- Get canonical GS1 vocabulary definitions
- Map ISA attributes to WebVoc terms
- Use for semantic consistency

---

### Task 4: Adding GS1 AI Validation

**Goal:** Find repositories with GS1 Application Identifier validation logic

**Step 1: Filter by Standard + Role**

```javascript
const repos = require('./data/metadata/external_repos_archive2.json');

// Find AI validation references
const aiValidationRepos = repos.filter(repo => 
  repo.standards.some(std => std.includes('Barcode Syntax')) &&
  (repo.roles.includes('validation_reference') || repo.roles.includes('ingestion_candidate'))
);

print(aiValidationRepos);
```

**Result:**
```json
[
  {
    "id": "gs1-syntax-engine",
    "sourceZip": "Archive 2/gs1-syntax-engine-main.zip",
    "standards": ["GS1 Barcode Syntax"],
    "roles": ["validation_reference"],
    "priority": "high"
  },
  {
    "id": "gs1-syntax-dictionary",
    "sourceZip": "Archive 2/gs1-syntax-dictionary-main.zip",
    "standards": ["GS1 Barcode Syntax"],
    "roles": ["ingestion_candidate", "schema_reference"],
    "priority": "high"
  }
]
```

**Step 2: Decide on Approach**

- **gs1-syntax-dictionary**: Structured JSON data → **INGEST** into ISA database
- **gs1-syntax-engine**: Reference implementation → **STUDY** for validation logic

**Step 3: Create Ingestion Task**

This is a clear ingestion candidate, so create `INGEST-07_GS1_Syntax_Dictionary.md`:

```bash
# Extract syntax dictionary
cd /home/ubuntu/isa_web
unzip -q data/external/Archive_2.zip "gs1-syntax-dictionary-main.zip" -d /tmp/
cd /tmp/gs1-syntax-dictionary-main/

# Inspect structure
ls -la
cat README.md
```

Then create ingestion spec referencing:
- **Source:** `external_repos_archive2.json` entry `gs1-syntax-dictionary`
- **Archive:** `data/external/Archive_2.zip`
- **Target tables:** `gs1_application_identifiers`, `gs1_ai_validation_rules`

---

### Task 5: Finding Test Cases for Feature X

**Goal:** Find all repositories that can provide test cases

**Step 1: Filter by Role**

```javascript
const repos = require('./data/metadata/external_repos_archive2.json');

// Find all test case sources
const testRepos = repos.filter(repo => 
  repo.roles.includes('test_case_source')
);

print(`Found ${testRepos.length} test case sources:`);
testRepos.forEach(repo => {
  print(`- ${repo.id} (${repo.standards.join(', ')})`);
});
```

**Result:**
```
Found 10 test case sources:
- vc-data-model-verifier (GS1 Verifiable Credentials)
- linkset (GS1 Digital Link)
- interpretgs1scan (GS1 barcodes, GS1 Digital Link)
- gs1-digital-link-toolkit-js (GS1 Digital Link)
- gs1-digital-link-uri-simple-parser (GS1 Digital Link)
- gmn-helpers (GS1 GMN)
- eudr-tool (GS1 Web Vocabulary)
- epcis (EPCIS, CBV)
```

**Step 2: Filter by Specific Standard**

```javascript
// Find Digital Link test cases only
const dlTestRepos = testRepos.filter(repo => 
  repo.standards.some(std => std.includes('Digital Link'))
);

print(dlTestRepos);
```

---

## Query Patterns by Priority

### Find All High-Priority Repos

```javascript
const repos = require('./data/metadata/external_repos_archive2.json');

const highPriority = repos.filter(repo => repo.priority === 'high');
print(`${highPriority.length} high-priority repos`);
```

**Result:** 11 repositories

### Find Ingestion Candidates

```javascript
const repos = require('./data/metadata/external_repos_archive2.json');

const ingestCandidates = repos.filter(repo => 
  repo.roles.includes('ingestion_candidate')
);

print(ingestCandidates);
```

**Result:**
```json
[
  {
    "id": "gs1-syntax-dictionary",
    "sourceZip": "Archive 2/gs1-syntax-dictionary-main.zip",
    "standards": ["GS1 Barcode Syntax"],
    "roles": ["ingestion_candidate", "schema_reference"],
    "priority": "high"
  }
]
```

---

## Practical Workflow for ChatGPT

When ChatGPT receives a task like "Implement EPCIS event ingestion":

### Step 1: Query the Index

```javascript
// ChatGPT should mentally execute this query
const repos = require('./data/metadata/external_repos_archive2.json');
const relevant = repos.filter(repo => 
  repo.standards.includes('EPCIS') || 
  repo.standards.includes('CBV')
);
```

### Step 2: Report Findings

"I found 1 relevant repository in Archive2:
- **epcis** (Archive 2/EPCIS-master.zip)
  - Standards: EPCIS, CBV
  - Roles: traceability_reference, test_case_source
  - Priority: HIGH"

### Step 3: Request Extraction (if needed)

"To implement this feature optimally, I recommend extracting the EPCIS repository for reference. Should I:
1. Proceed without it (using general EPCIS knowledge)
2. Wait for you to extract it and provide key files
3. Provide extraction commands for you to run"

### Step 4: Use the Content

Once extracted:
- Study example events
- Extract test fixtures
- Adapt patterns to ISA architecture
- Reference in implementation notes

---

## Python Query Examples

For more complex queries or scripting:

```python
import json

# Load index
with open('data/metadata/external_repos_archive2.json') as f:
    repos = json.load(f)

# Find by multiple criteria
def find_repos(standards=None, regulations=None, roles=None, priority=None):
    results = repos
    
    if standards:
        results = [r for r in results if any(s in r['standards'] for s in standards)]
    
    if regulations:
        results = [r for r in results if any(reg in r['regulations'] for reg in regulations)]
    
    if roles:
        results = [r for r in results if any(role in r['roles'] for role in roles)]
    
    if priority:
        results = [r for r in results if r['priority'] == priority]
    
    return results

# Example: Find high-priority Digital Link resources with test cases
dl_test_repos = find_repos(
    standards=['GS1 Digital Link'],
    roles=['test_case_source'],
    priority='high'
)

for repo in dl_test_repos:
    print(f"- {repo['id']}: {repo['sourceZip']}")
```

---

## Integration with Ingestion Tasks

When creating a new INGEST-XX task spec, reference the Archive2 index:

```markdown
## Source

**Archive2 Reference:** `gs1-syntax-dictionary` (see `data/metadata/external_repos_archive2.json`)

**Location:** `data/external/Archive_2.zip` → `Archive 2/gs1-syntax-dictionary-main.zip`

**Standards:** GS1 Barcode Syntax

**Role:** ingestion_candidate, schema_reference

**Priority:** HIGH
```

This creates traceability from task spec → Archive2 index → physical archive.

---

## Summary

**For ChatGPT:**
1. Always check `data/metadata/external_repos_archive2.json` when starting a task
2. Filter by `standards`, `regulations`, `roles`, or `priority`
3. Report findings and recommend extraction if needed
4. Reference Archive2 repos in implementation notes

**For Manus:**
1. Use same query patterns programmatically
2. Extract repos on-demand (don't extract all upfront)
3. Update index if new repos are added

**For Humans:**
1. Read `docs/datasets/EXTERNAL_GS1_AND_ESG_REPOS_ARCHIVE2.md` for context
2. Use JSON index for programmatic discovery
3. Extract specific repos as needed for development

---

**The Archive2 index is now a living, queryable knowledge base for ISA development!** 🎯
