# ISA Capability Documentation Refactor Plan
## Target State: AI Agent-Ready Technical Documentation

**Created:** 2026-02-12  
**Status:** Planning Phase  
**Owner:** ISA Development Team  
**Goal:** Consolidate all capability documentation into modular, coherent, AI agent-ready technical specifications

---

## Executive Summary

This plan defines the target state for ISA's 6 core capabilities documentation and provides a step-by-step process to refactor all existing technical documentation into a unified, modular, and AI agent-optimized structure. The goal is to enable autonomous AI agents to develop, deploy, and maintain each capability end-to-end using expert technical documentation.

**Current State Problems:**
- Documentation scattered across 200+ files in multiple directories
- Redundant, conflicting, and outdated information
- No clear separation between capability specs, architecture, and implementation guides
- Mixed concerns (product vision, technical specs, historical decisions)
- Difficult for AI agents to locate authoritative technical information

**Target State Benefits:**
- Single source of truth for each capability's technical specification
- Modular documentation enabling independent capability development
- AI agent-optimized structure with clear contracts and interfaces
- Zero conflicts between capability documents
- Complete end-to-end development guidance per capability

---

## Target State Architecture

### Documentation Hierarchy

```
docs/
├── spec/
│   ├── ARCHITECTURE.md                    # System-wide architecture (NEW)
│   ├── INTEGRATION_CONTRACTS.md           # Inter-capability contracts (NEW)
│   ├── DEPLOYMENT_GUIDE.md                # End-to-end deployment (NEW)
│   │
│   ├── ASK_ISA/
│   │   ├── CAPABILITY_SPEC.md             # Complete technical spec (CONSOLIDATED)
│   │   ├── API_REFERENCE.md               # tRPC endpoints, schemas
│   │   ├── IMPLEMENTATION_GUIDE.md        # Step-by-step development
│   │   ├── TESTING_GUIDE.md               # Test strategy, fixtures
│   │   ├── DEPLOYMENT.md                  # Deployment procedures
│   │   └── TROUBLESHOOTING.md             # Common issues, solutions
│   │
│   ├── NEWS_HUB/
│   │   ├── CAPABILITY_SPEC.md
│   │   ├── API_REFERENCE.md
│   │   ├── IMPLEMENTATION_GUIDE.md
│   │   ├── TESTING_GUIDE.md
│   │   ├── DEPLOYMENT.md
│   │   └── TROUBLESHOOTING.md
│   │
│   ├── KNOWLEDGE_BASE/
│   │   ├── CAPABILITY_SPEC.md
│   │   ├── API_REFERENCE.md
│   │   ├── IMPLEMENTATION_GUIDE.md
│   │   ├── TESTING_GUIDE.md
│   │   ├── DEPLOYMENT.md
│   │   └── TROUBLESHOOTING.md
│   │
│   ├── CATALOG/
│   │   ├── CAPABILITY_SPEC.md
│   │   ├── API_REFERENCE.md
│   │   ├── IMPLEMENTATION_GUIDE.md
│   │   ├── TESTING_GUIDE.md
│   │   ├── DEPLOYMENT.md
│   │   └── TROUBLESHOOTING.md
│   │
│   ├── ESRS_MAPPING/
│   │   ├── CAPABILITY_SPEC.md
│   │   ├── API_REFERENCE.md
│   │   ├── IMPLEMENTATION_GUIDE.md
│   │   ├── TESTING_GUIDE.md
│   │   ├── DEPLOYMENT.md
│   │   └── TROUBLESHOOTING.md
│   │
│   └── ADVISORY/
│       ├── CAPABILITY_SPEC.md
│       ├── API_REFERENCE.md
│       ├── IMPLEMENTATION_GUIDE.md
│       ├── TESTING_GUIDE.md
│       ├── DEPLOYMENT.md
│       └── TROUBLESHOOTING.md
│
└── archive/
    └── capability-refactor-2026-02-12/    # Archived old docs
        ├── ASK_ISA/
        ├── NEWS_HUB/
        └── ...
```

### Document Templates

#### CAPABILITY_SPEC.md Template
```markdown
# [CAPABILITY_NAME] Capability Specification

## Metadata
- **Capability ID**: [UNIQUE_ID]
- **Version**: [SEMVER]
- **Status**: [active|deprecated|experimental]
- **Owner**: [TEAM]
- **Last Updated**: [DATE]

## Purpose
[Single paragraph: What problem does this capability solve?]

## Scope
### In Scope
- [Feature 1]
- [Feature 2]

### Out of Scope
- [Non-feature 1]
- [Non-feature 2]

## Architecture
### Components
- [Component 1]: [Purpose]
- [Component 2]: [Purpose]

### Data Flow
[Mermaid diagram showing data flow]

### Dependencies
#### Internal
- [Capability X]: [Why needed]

#### External
- [Service Y]: [Why needed]

## Interfaces
### Public API
[Link to API_REFERENCE.md]

### Events Published
- [Event 1]: [When triggered]

### Events Consumed
- [Event 2]: [How handled]

## Data Model
### Database Tables
- [Table 1]: [Schema summary]

### Data Contracts
[Link to schema definitions]

## Quality Attributes
### Performance
- [Metric 1]: [Target]

### Reliability
- [Metric 2]: [Target]

### Security
- [Requirement 1]

## Operational Requirements
### Monitoring
- [Metric to monitor]

### Alerting
- [Alert condition]

### Backup/Recovery
- [Procedure]

## Development Guide
[Link to IMPLEMENTATION_GUIDE.md]

## Testing Strategy
[Link to TESTING_GUIDE.md]

## Deployment
[Link to DEPLOYMENT.md]

## Troubleshooting
[Link to TROUBLESHOOTING.md]

## Change Log
[Version history]
```

#### API_REFERENCE.md Template
```markdown
# [CAPABILITY_NAME] API Reference

## tRPC Procedures

### [procedureName]
**Type**: query | mutation  
**Auth**: public | protected  
**Rate Limit**: [N] requests/minute

**Input Schema**:
```typescript
z.object({
  field1: z.string(),
  field2: z.number().optional()
})
```

**Output Schema**:
```typescript
{
  result: string,
  metadata: { ... }
}
```

**Example**:
```typescript
const result = await trpc.capability.procedureName.query({
  field1: "value"
});
```

**Error Codes**:
- `ERR_001`: [Description]
- `ERR_002`: [Description]

## Database Schemas

### [tableName]
```sql
CREATE TABLE table_name (
  id INT PRIMARY KEY,
  ...
);
```

## Event Schemas

### [EventName]
```typescript
interface EventName {
  eventId: string;
  timestamp: Date;
  payload: { ... };
}
```
```

#### IMPLEMENTATION_GUIDE.md Template
```markdown
# [CAPABILITY_NAME] Implementation Guide

## Prerequisites
- [Dependency 1]
- [Dependency 2]

## Setup
### 1. Environment Configuration
```bash
# Required environment variables
export VAR1=value1
export VAR2=value2
```

### 2. Database Migration
```bash
pnpm db:push
```

### 3. Seed Data (if applicable)
```bash
pnpm seed:capability
```

## Development Workflow

### Step 1: [Task Name]
**Goal**: [What to achieve]

**Files to Create/Modify**:
- `server/routers/capability.ts`
- `client/src/pages/CapabilityPage.tsx`

**Code Example**:
```typescript
// Implementation example
```

**Verification**:
```bash
# How to verify this step works
pnpm test:capability
```

### Step 2: [Next Task]
[Repeat structure]

## Common Patterns

### Pattern 1: [Name]
**When to Use**: [Scenario]

**Implementation**:
```typescript
// Code example
```

### Pattern 2: [Name]
[Repeat structure]

## Code Organization
```
server/
├── routers/
│   └── capability.ts          # tRPC router
├── services/
│   └── capability/            # Business logic
│       ├── service1.ts
│       └── service2.ts
└── db-capability.ts           # Database helpers

client/
└── src/
    ├── pages/
    │   └── CapabilityPage.tsx # Main UI
    └── components/
        └── capability/        # UI components
```

## Best Practices
- [Practice 1]
- [Practice 2]

## Anti-Patterns
- [Anti-pattern 1]: [Why to avoid]
- [Anti-pattern 2]: [Why to avoid]
```

#### TESTING_GUIDE.md Template
```markdown
# [CAPABILITY_NAME] Testing Guide

## Test Strategy

### Unit Tests
**Coverage Target**: 80%+  
**Location**: `server/**/*.test.ts`

**What to Test**:
- [Component 1] business logic
- [Component 2] edge cases

### Integration Tests
**Coverage Target**: Key workflows  
**Location**: `server/**/*-integration.test.ts`

**What to Test**:
- End-to-end API flows
- Database interactions
- External service mocks

### E2E Tests
**Coverage Target**: Critical user journeys  
**Location**: `e2e/capability.spec.ts`

**What to Test**:
- User workflow 1
- User workflow 2

## Test Fixtures

### Database Fixtures
```typescript
// Example fixture
export const mockRegulation = {
  id: 1,
  title: "Test Regulation",
  ...
};
```

### API Mocks
```typescript
// Example mock
vi.mock('../_core/llm', () => ({
  invokeLLM: vi.fn().mockResolvedValue({...})
}));
```

## Running Tests

### All Tests
```bash
pnpm test
```

### Specific Capability
```bash
pnpm test server/routers/capability.test.ts
```

### Watch Mode
```bash
pnpm test --watch
```

## Test Scenarios

### Scenario 1: [Happy Path]
**Given**: [Preconditions]  
**When**: [Action]  
**Then**: [Expected outcome]

**Test Code**:
```typescript
it('should handle happy path', async () => {
  // Test implementation
});
```

### Scenario 2: [Error Case]
[Repeat structure]

## Debugging Tests
- [Tip 1]
- [Tip 2]
```

#### DEPLOYMENT.md Template
```markdown
# [CAPABILITY_NAME] Deployment Guide

## Prerequisites
- [Requirement 1]
- [Requirement 2]

## Deployment Steps

### 1. Pre-Deployment Checks
```bash
# Run validation
pnpm check
pnpm test
```

### 2. Database Migration
```bash
# Apply migrations
pnpm db:push
```

### 3. Environment Variables
```bash
# Production environment
export VAR1=prod_value1
export VAR2=prod_value2
```

### 4. Build
```bash
pnpm build
```

### 5. Deploy
```bash
# Deployment command
pnpm deploy:capability
```

### 6. Post-Deployment Verification
```bash
# Smoke test
pnpm smoke:capability
```

## Rollback Procedure
1. [Step 1]
2. [Step 2]

## Monitoring
- [Metric 1]: [Dashboard link]
- [Metric 2]: [Dashboard link]

## Alerts
- [Alert 1]: [Response procedure]
- [Alert 2]: [Response procedure]
```

#### TROUBLESHOOTING.md Template
```markdown
# [CAPABILITY_NAME] Troubleshooting

## Common Issues

### Issue 1: [Problem Description]
**Symptoms**:
- [Symptom 1]
- [Symptom 2]

**Diagnosis**:
```bash
# How to diagnose
```

**Solution**:
1. [Step 1]
2. [Step 2]

**Prevention**:
- [How to prevent]

### Issue 2: [Problem Description]
[Repeat structure]

## Error Codes

### ERR_001: [Error Name]
**Cause**: [Why this happens]  
**Solution**: [How to fix]

### ERR_002: [Error Name]
[Repeat structure]

## Debug Procedures

### Procedure 1: [Name]
**When to Use**: [Scenario]

**Steps**:
1. [Step 1]
2. [Step 2]

## Performance Issues

### Slow Query Performance
**Diagnosis**:
```sql
-- Query to identify slow queries
```

**Solution**:
- [Optimization 1]
- [Optimization 2]

## Contact
- **Escalation**: [Team/Person]
- **On-Call**: [Rotation link]
```

---

## Refactoring Process

### Phase 1: Analysis & Inventory (Week 1)

#### Step 1.1: Document Current State
**Goal**: Create complete inventory of existing capability documentation

**Actions**:
1. List all files in `docs/spec/[CAPABILITY]/` for each capability
2. Categorize files by type (spec, guide, historical, decision log)
3. Identify redundant/conflicting content
4. Map content to target document structure

**Output**: `CAPABILITY_DOCS_INVENTORY.json`
```json
{
  "ASK_ISA": {
    "total_files": 51,
    "by_type": {
      "spec": ["RUNTIME_CONTRACT.md", "ASK_ISA_GUARDRAILS.md"],
      "guide": ["TESTING_GUIDE.md", "DEPLOYMENT.md"],
      "historical": ["DEVELOPMENT_PROGRESS_2026-02-01.md"],
      "decision": ["TRUST_RISK_ANALYSIS.md"]
    },
    "conflicts": [
      {
        "files": ["RUNTIME_CONTRACT.md", "ASK_ISA_RUNTIME_CONTRACT.md"],
        "issue": "Duplicate runtime contracts"
      }
    ]
  }
}
```

#### Step 1.2: Extract Canonical Content
**Goal**: Identify authoritative content for each capability

**Actions**:
1. For each capability, identify "golden" documents (most complete, recent, accurate)
2. Extract key sections from golden documents
3. Identify gaps (missing sections per template)
4. Document content sources for traceability

**Output**: `CANONICAL_CONTENT_MAP.md`

#### Step 1.3: Identify Conflicts
**Goal**: Document all conflicting information across capability docs

**Actions**:
1. Compare technical specifications across documents
2. Identify contradictory statements
3. Determine resolution strategy (newest wins, most detailed wins, etc.)
4. Create conflict resolution log

**Output**: `CAPABILITY_CONFLICTS.md`

### Phase 2: Architecture Documentation (Week 2)

#### Step 2.1: Create System Architecture
**Goal**: Document system-wide architecture showing all 6 capabilities

**Actions**:
1. Create `docs/spec/ARCHITECTURE.md` with:
   - System overview diagram
   - Capability interaction map
   - Shared infrastructure (database, auth, LLM)
   - Data flow between capabilities
2. Define architectural principles
3. Document technology stack

**Output**: `docs/spec/ARCHITECTURE.md`

#### Step 2.2: Define Integration Contracts
**Goal**: Document how capabilities interact with each other

**Actions**:
1. Create `docs/spec/INTEGRATION_CONTRACTS.md` with:
   - Inter-capability dependencies
   - Shared data models
   - Event contracts
   - API contracts
2. Define versioning strategy
3. Document breaking change policy

**Output**: `docs/spec/INTEGRATION_CONTRACTS.md`

#### Step 2.3: Create Deployment Guide
**Goal**: Document end-to-end deployment for all capabilities

**Actions**:
1. Create `docs/spec/DEPLOYMENT_GUIDE.md` with:
   - Prerequisites
   - Deployment order (dependencies)
   - Environment configuration
   - Verification procedures
2. Document rollback procedures
3. Create deployment checklist

**Output**: `docs/spec/DEPLOYMENT_GUIDE.md`

### Phase 3: Capability Consolidation (Weeks 3-4)

**Process per Capability** (repeat for all 6):

#### Step 3.1: Create CAPABILITY_SPEC.md
**Goal**: Consolidate all technical specifications into single document

**Actions**:
1. Use template from Target State Architecture
2. Extract content from existing docs:
   - Purpose from RUNTIME_CONTRACT.md
   - Architecture from various design docs
   - Interfaces from API docs
   - Data model from schema files
3. Fill gaps with code analysis
4. Add cross-references to other capabilities
5. Validate completeness against template

**Output**: `docs/spec/[CAPABILITY]/CAPABILITY_SPEC.md`

#### Step 3.2: Create API_REFERENCE.md
**Goal**: Complete API documentation for capability

**Actions**:
1. Extract tRPC procedures from `server/routers/[capability].ts`
2. Document input/output schemas with Zod definitions
3. Add code examples for each endpoint
4. Document error codes and handling
5. Include database schemas
6. Add event schemas (if applicable)

**Output**: `docs/spec/[CAPABILITY]/API_REFERENCE.md`

#### Step 3.3: Create IMPLEMENTATION_GUIDE.md
**Goal**: Step-by-step development guide for capability

**Actions**:
1. Document setup prerequisites
2. Create step-by-step implementation workflow
3. Extract common patterns from existing code
4. Document code organization
5. Add best practices and anti-patterns
6. Include code examples for key patterns

**Output**: `docs/spec/[CAPABILITY]/IMPLEMENTATION_GUIDE.md`

#### Step 3.4: Create TESTING_GUIDE.md
**Goal**: Complete testing documentation

**Actions**:
1. Document test strategy (unit, integration, E2E)
2. Extract test fixtures from existing tests
3. Document test scenarios
4. Add debugging tips
5. Include coverage targets

**Output**: `docs/spec/[CAPABILITY]/TESTING_GUIDE.md`

#### Step 3.5: Create DEPLOYMENT.md
**Goal**: Deployment procedures for capability

**Actions**:
1. Document deployment steps
2. Add pre/post-deployment checks
3. Include rollback procedures
4. Document monitoring and alerting
5. Add troubleshooting quick reference

**Output**: `docs/spec/[CAPABILITY]/DEPLOYMENT.md`

#### Step 3.6: Create TROUBLESHOOTING.md
**Goal**: Common issues and solutions

**Actions**:
1. Extract known issues from existing docs
2. Document error codes from code
3. Add diagnostic procedures
4. Include performance troubleshooting
5. Add escalation contacts

**Output**: `docs/spec/[CAPABILITY]/TROUBLESHOOTING.md`

### Phase 4: Validation & Quality Assurance (Week 5)

#### Step 4.1: Completeness Check
**Goal**: Verify all capabilities have complete documentation

**Actions**:
1. Run automated completeness checker
2. Verify all template sections filled
3. Check cross-references valid
4. Validate code examples compile
5. Test all commands/scripts work

**Output**: `COMPLETENESS_REPORT.md`

#### Step 4.2: Consistency Check
**Goal**: Ensure no conflicts between capability docs

**Actions**:
1. Compare shared concepts across capabilities
2. Verify integration contracts match both sides
3. Check terminology consistency
4. Validate architectural diagrams align
5. Ensure versioning consistent

**Output**: `CONSISTENCY_REPORT.md`

#### Step 4.3: AI Agent Readiness Test
**Goal**: Verify AI agents can use documentation effectively

**Actions**:
1. Test AI agent can locate capability documentation
2. Verify AI agent can extract API contracts
3. Test AI agent can follow implementation guide
4. Validate AI agent can troubleshoot issues
5. Measure time to complete development task

**Output**: `AI_AGENT_READINESS_REPORT.md`

#### Step 4.4: Developer Review
**Goal**: Human validation of documentation quality

**Actions**:
1. Assign each capability to developer for review
2. Developer attempts to implement feature using only docs
3. Collect feedback on clarity, completeness, accuracy
4. Iterate on documentation based on feedback
5. Final approval from capability owner

**Output**: `DEVELOPER_REVIEW_FEEDBACK.md`

### Phase 5: Migration & Cleanup (Week 6)

#### Step 5.1: Archive Old Documentation
**Goal**: Preserve historical docs while cleaning up structure

**Actions**:
1. Create `docs/archive/capability-refactor-2026-02-12/`
2. Move all old capability docs to archive
3. Add README explaining archive purpose
4. Update all links to point to new docs
5. Add redirects for common old paths

**Output**: Archived documentation in `docs/archive/`

#### Step 5.2: Update Cross-References
**Goal**: Fix all broken links after refactor

**Actions**:
1. Scan all markdown files for links to old docs
2. Update links to new documentation structure
3. Verify all links resolve correctly
4. Update README.md with new doc structure
5. Update AGENT_START_HERE.md with new paths

**Output**: Updated cross-references throughout repo

#### Step 5.3: Update CI/CD
**Goal**: Integrate documentation validation into CI

**Actions**:
1. Add doc completeness check to CI
2. Add link validation to CI
3. Add code example compilation check
4. Update PR template to require doc updates
5. Add doc review to merge checklist

**Output**: Updated `.github/workflows/validate-docs.yml`

#### Step 5.4: Update Memory Bank
**Goal**: Ensure AI agents have updated documentation context

**Actions**:
1. Update `.amazonq/rules/memory-bank/structure.md`
2. Add capability documentation paths
3. Update guidelines with new doc structure
4. Test AI agent can find new docs
5. Validate AI agent responses use new docs

**Output**: Updated Memory Bank files

---

## Success Criteria

### Completeness Metrics
- [ ] All 6 capabilities have complete documentation (6/6 files per capability)
- [ ] All template sections filled (100% coverage)
- [ ] All code examples compile and run
- [ ] All commands/scripts verified working
- [ ] All cross-references valid

### Quality Metrics
- [ ] Zero conflicts between capability documents
- [ ] Zero broken links in documentation
- [ ] 100% of API endpoints documented
- [ ] 100% of database tables documented
- [ ] All error codes documented

### AI Agent Readiness Metrics
- [ ] AI agent can locate capability docs in <10s
- [ ] AI agent can extract API contract in <30s
- [ ] AI agent can implement simple feature using docs alone
- [ ] AI agent can troubleshoot common issues using docs
- [ ] AI agent development time reduced by 50%+

### Developer Experience Metrics
- [ ] Developer can find relevant docs in <2 minutes
- [ ] Developer can implement feature using docs alone (no code diving)
- [ ] Developer satisfaction score >4/5
- [ ] Time to onboard new developer reduced by 40%+
- [ ] Documentation maintenance time <2 hours/week

---

## Risk Mitigation

### Risk 1: Content Loss During Consolidation
**Mitigation**:
- Archive all old docs before deletion
- Create content traceability map
- Review archived docs before final cleanup
- Keep archive accessible for 6 months

### Risk 2: Breaking Existing Workflows
**Mitigation**:
- Add redirects for common old paths
- Update all internal links before archiving
- Communicate changes to team in advance
- Provide migration guide for external users

### Risk 3: Incomplete Documentation
**Mitigation**:
- Use automated completeness checker
- Require peer review for each capability
- Test with real development tasks
- Iterate based on developer feedback

### Risk 4: Documentation Drift
**Mitigation**:
- Add doc updates to PR template
- Include doc review in merge checklist
- Add CI checks for doc completeness
- Schedule quarterly doc review

---

## Timeline

| Week | Phase | Deliverables |
|------|-------|--------------|
| 1 | Analysis & Inventory | Inventory, content map, conflicts |
| 2 | Architecture Documentation | ARCHITECTURE.md, INTEGRATION_CONTRACTS.md, DEPLOYMENT_GUIDE.md |
| 3 | Capability Consolidation (ASK_ISA, NEWS_HUB, KNOWLEDGE_BASE) | 18 docs (6 per capability) |
| 4 | Capability Consolidation (CATALOG, ESRS_MAPPING, ADVISORY) | 18 docs (6 per capability) |
| 5 | Validation & QA | Completeness, consistency, AI readiness reports |
| 6 | Migration & Cleanup | Archived docs, updated links, CI integration |

**Total Duration**: 6 weeks  
**Effort**: 1 FTE (full-time equivalent)

---

## Next Steps

1. **Approve Plan**: Review and approve this refactoring plan
2. **Assign Owner**: Designate lead for documentation refactor
3. **Create Tracking**: Set up project board for tracking progress
4. **Begin Phase 1**: Start with analysis and inventory
5. **Weekly Reviews**: Schedule weekly progress reviews

---

## Appendix A: Capability Documentation Inventory

### ASK_ISA (51 files)
**Current Runtime Contract**: `docs/spec/ASK_ISA/RUNTIME_CONTRACT.md`

**Key Documents to Consolidate**:
- `ASK_ISA_GUARDRAILS.md` → CAPABILITY_SPEC.md (guardrails section)
- `ASK_ISA_QUERY_LIBRARY.md` → API_REFERENCE.md (example queries)
- `TESTING_GUIDE.md` → TESTING_GUIDE.md (keep, enhance)
- `DEPLOYMENT.md` → DEPLOYMENT.md (keep, enhance)
- `TRUST_RISK_ANALYSIS.md` → CAPABILITY_SPEC.md (security section)

**Documents to Archive**:
- `DEVELOPMENT_PROGRESS_2026-02-01.md` (historical)
- `DEVELOPMENT_SESSION_2026-02-01.md` (historical)
- `STRATEGIC_EVALUATION_2026-02-01.md` (historical)
- `META_PHASE_STRATEGIC_EXPLORATION_PLAN.md` (historical)

### NEWS_HUB (41 files)
**Current Runtime Contract**: `docs/spec/NEWS_HUB/RUNTIME_CONTRACT.md`

**Key Documents to Consolidate**:
- `NEWS_PIPELINE.md` → CAPABILITY_SPEC.md (architecture section)
- `NEWS_HEALTH_MONITORING.md` → TROUBLESHOOTING.md
- `CRON_SETUP_GUIDE.md` → DEPLOYMENT.md
- `PHASE_3_COMPLETION_REPORT.md` → Archive (historical)

### KNOWLEDGE_BASE (5 files)
**Current Runtime Contract**: `docs/spec/KNOWLEDGE_BASE/RUNTIME_CONTRACT.md`

**Key Documents to Consolidate**:
- `data-knowledge-model.md` → CAPABILITY_SPEC.md (data model section)
- `GS1_Attribute_Mapper_Technical_Specification.md` → API_REFERENCE.md

### CATALOG (10 files)
**Current Runtime Contract**: `docs/spec/CATALOG/RUNTIME_CONTRACT.md`

**Key Documents to Consolidate**:
- `DATASETS_CATALOG.md` → CAPABILITY_SPEC.md (data sources section)
- `GS1_EFRAG_CATALOGUE_INDEX.md` → API_REFERENCE.md

### ESRS_MAPPING (16 files)
**Current Runtime Contract**: `docs/spec/ESRS_MAPPING/RUNTIME_CONTRACT.md`

**Key Documents to Consolidate**:
- `DATA_MODEL.md` → CAPABILITY_SPEC.md (data model section)
- `INGESTION.md` → IMPLEMENTATION_GUIDE.md
- `GS1_DATA_MODELS.md` → API_REFERENCE.md

### ADVISORY (44 files)
**Current Runtime Contract**: `docs/spec/ADVISORY/RUNTIME_CONTRACT.md`

**Key Documents to Consolidate**:
- `ADVISORY_METHOD.md` → CAPABILITY_SPEC.md (methodology section)
- `API_REFERENCE.md` → API_REFERENCE.md (keep, enhance)
- `ARCHITECTURE.md` → CAPABILITY_SPEC.md (architecture section)
- `QUALITY_BAR.md` → TESTING_GUIDE.md

---

## Appendix B: Template Checklist

Use this checklist to verify each capability's documentation is complete:

### CAPABILITY_SPEC.md
- [ ] Metadata section complete
- [ ] Purpose clearly stated
- [ ] Scope (in/out) defined
- [ ] Architecture diagram included
- [ ] Components documented
- [ ] Data flow diagram included
- [ ] Dependencies listed
- [ ] Interfaces documented
- [ ] Data model described
- [ ] Quality attributes defined
- [ ] Operational requirements listed
- [ ] Links to other docs valid

### API_REFERENCE.md
- [ ] All tRPC procedures documented
- [ ] Input schemas with Zod definitions
- [ ] Output schemas documented
- [ ] Code examples for each endpoint
- [ ] Error codes documented
- [ ] Database schemas included
- [ ] Event schemas (if applicable)

### IMPLEMENTATION_GUIDE.md
- [ ] Prerequisites listed
- [ ] Setup steps documented
- [ ] Development workflow defined
- [ ] Common patterns documented
- [ ] Code organization explained
- [ ] Best practices listed
- [ ] Anti-patterns documented

### TESTING_GUIDE.md
- [ ] Test strategy defined
- [ ] Unit test guidance
- [ ] Integration test guidance
- [ ] E2E test guidance
- [ ] Test fixtures documented
- [ ] Test scenarios listed
- [ ] Debugging tips included

### DEPLOYMENT.md
- [ ] Prerequisites listed
- [ ] Deployment steps documented
- [ ] Environment variables listed
- [ ] Rollback procedure documented
- [ ] Monitoring setup explained
- [ ] Alerts configured

### TROUBLESHOOTING.md
- [ ] Common issues documented
- [ ] Error codes explained
- [ ] Debug procedures listed
- [ ] Performance troubleshooting
- [ ] Escalation contacts listed

---

**Document Status**: DRAFT  
**Next Review**: After Phase 1 completion  
**Approval Required**: ISA Development Team Lead
