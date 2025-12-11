# Batch 02: Next 5 High-Value Tasks

**Context:** Batch 01 focused on foundational utilities (Digital Link, GPC mapping, validation, documentation). Batch 02 focuses on UI components and advanced analysis tools that build on these foundations.

**Delivery Timeline:** All 5 tasks in single response

---

## Task Selection Rationale

| ID | Task | Value | Complexity | Dependencies |
|----|------|-------|------------|--------------|
| CGPT-04 | EPCIS Event Validation | High | Medium | None |
| CGPT-06 | Regulation Comparison Matrix | High | Low | None |
| CGPT-07 | GS1 Impact Analysis Component | High | Low | None |
| CGPT-11 | Sector Filter Component | Medium | Low | None |
| CGPT-12 | Export/Print Utilities | Medium | Low | None |

**Total Estimated Effort:** 24-32 hours development → 2-4 hours integration

---

## CGPT-04: EPCIS Event Validation Library

**Full spec:** See `/tasks/for_chatgpt/CGPT-04_epcis_validation.md` (to be created)

### Context

ISA helps users validate supply chain traceability data against EPCIS 2.0 and CBV standards. Users need to verify that their EPCIS events meet ESG-specific requirements (EUDR, DPP, CSRD).

### Task

Create a TypeScript library that validates EPCIS 2.0 events for:

1. **Schema compliance** - Required fields, correct types
2. **CBV vocabulary compliance** - Valid BizSteps, Dispositions, etc.
3. **ESG-specific requirements** - EUDR traceability, DPP circularity, CSRD Scope 3

### Deliverables

1. `/server/utils/epcis-validator.ts` - Core validation engine
2. `/server/utils/epcis-validator.test.ts` - Test suite (minimum 15 tests)
3. `/shared/epcis-validation-rules.ts` - Validation rule definitions

### Key Requirements

- Validate ObjectEvent, AggregationEvent, TransformationEvent, TransactionEvent
- Check required fields (eventTime, eventTimeZoneOffset, epcList/quantityList)
- Validate BizStep/Disposition against CBV vocabulary
- Validate SGTIN/SSCC/GRAI format
- ESG-specific rules:
  - EUDR: Requires geolocation (readPoint with geo coordinates)
  - DPP: Requires specific BizSteps (commissioning, shipping, receiving, decommissioning)
  - CSRD: Requires carbon footprint sensor data (gs1:MT-CarbonFootprint)

### Success Criteria

```typescript
const result = validateEPCISEvent({
  type: "ObjectEvent",
  eventTime: "2025-12-11T10:00:00Z",
  eventTimeZoneOffset: "+01:00",
  epcList: ["urn:epc:id:sgtin:0614141.107346.2017"],
  action: "OBSERVE",
  bizStep: "urn:epcglobal:cbv:bizstep:shipping",
  disposition: "urn:epcglobal:cbv:disp:in_transit",
  readPoint: { id: "urn:epc:id:sgln:0614141.00777.0" }
}, {
  regulation: "EUDR" // Requires geolocation
});

// Result should include:
// - valid: boolean
// - errors: Array<{field, code, message, severity}>
// - warnings: Array<{field, code, message}>
// - compliance: { EUDR: boolean, DPP: boolean, CSRD: boolean }
```

### Integration Points

- Reuse CBV vocabulary from `/shared/epcis-cbv-types.ts` (already exists)
- Reference REGULATION_EPCIS_MAPPINGS for ESG rules (already exists)

---

## CGPT-06: Regulation Comparison Matrix Component

**Full spec:** See `/tasks/for_chatgpt/CGPT-06_regulation_comparison.md` (to be created)

### Context

Users need to compare multiple regulations side-by-side to understand overlapping requirements, deadlines, and GS1 standard impacts.

### Task

Create a React component that displays a comparison matrix of 2-4 regulations with key attributes:

- Scope (products, sectors, company size)
- Key deadlines
- Required data points
- Applicable GS1 standards
- Compliance complexity score

### Deliverables

1. `/client/src/components/RegulationComparisonMatrix.tsx` - Main component
2. `/client/src/components/RegulationComparisonMatrix.test.tsx` - Component tests (minimum 6 tests)
3. `/client/src/hooks/useRegulationComparison.ts` - Data fetching hook

### Key Requirements

- Support 2-4 regulations in comparison
- Responsive design (stack vertically on mobile)
- Highlight differences and commonalities
- Link to full regulation detail pages
- Export comparison as PDF (placeholder button)
- Use shadcn/ui components (Table, Card, Badge)

### Success Criteria

```tsx
<RegulationComparisonMatrix
  regulationIds={["CSRD", "PPWR", "EUDR"]}
  attributes={[
    "scope",
    "deadlines",
    "dataPoints",
    "gs1Standards",
    "complexity"
  ]}
/>
```

Component should:
- Fetch regulation data via tRPC
- Display comparison table with highlighted cells
- Allow toggling attribute visibility
- Support keyboard navigation

---

## CGPT-07: GS1 Impact Analysis Component

**Full spec:** See `/tasks/for_chatgpt/CGPT-07_gs1_impact_component.md` (to be created)

### Context

When viewing a regulation, users need to quickly understand which GS1 standards are affected and what actions they should take.

### Task

Create a React component that displays GS1 impact analysis for a regulation:

1. **Affected Standards** - List of GS1 standards (GDSN, EPCIS, Digital Link)
2. **Impact Level** - Critical, High, Medium, Low
3. **Required Actions** - Specific steps users should take
4. **Timeline** - When actions are needed
5. **Resources** - Links to GS1 documentation

### Deliverables

1. `/client/src/components/GS1ImpactAnalysis.tsx` - Main component
2. `/client/src/components/GS1ImpactAnalysis.test.tsx` - Component tests (minimum 5 tests)

### Key Requirements

- Display impact level with color coding (red=critical, orange=high, yellow=medium, green=low)
- Show actionable checklist items
- Link to relevant GS1 standard pages
- Support expansion/collapse for detailed view
- Use shadcn/ui components (Accordion, Alert, Badge)

### Success Criteria

```tsx
<GS1ImpactAnalysis
  regulationId="DPP"
  standards={[
    { id: "GDSN", impact: "critical", actions: [...] },
    { id: "DigitalLink", impact: "high", actions: [...] }
  ]}
/>
```

Component should:
- Display standards sorted by impact level
- Show progress indicators for completed actions
- Allow users to mark actions as complete (localStorage)

---

## CGPT-11: Sector Filter Component

**Full spec:** See `/tasks/for_chatgpt/CGPT-11_sector_filter.md` (to be created)

### Context

ISA covers 12 sectors (Food, Fashion, Electronics, etc.). Users need to filter content by their relevant sectors.

### Task

Create a reusable sector filter component that:

1. Displays all 12 sectors with icons
2. Supports multi-select
3. Persists selection in URL params
4. Shows count of items per sector
5. Supports "Select All" / "Clear All"

### Deliverables

1. `/client/src/components/SectorFilter.tsx` - Main component
2. `/client/src/components/SectorFilter.test.tsx` - Component tests (minimum 4 tests)
3. `/shared/sector-definitions.ts` - Sector metadata (name, icon, description)

### Key Requirements

- Use shadcn/ui Checkbox component
- Display sector icons (use Lucide icons)
- Show item count badges
- Support keyboard navigation
- Emit onChange event with selected sectors
- Responsive design (grid layout)

### Success Criteria

```tsx
<SectorFilter
  sectors={SECTOR_DEFINITIONS}
  selectedSectors={["food", "fashion"]}
  itemCounts={{ food: 42, fashion: 18, ... }}
  onChange={(selected) => console.log(selected)}
/>
```

Component should:
- Render 12 sector checkboxes in 3-column grid
- Update URL params on selection change
- Highlight selected sectors
- Show total selected count

---

## CGPT-12: Export/Print Utilities

**Full spec:** See `/tasks/for_chatgpt/CGPT-12_export_utilities.md` (to be created)

### Context

Users need to export ISA content (regulations, comparisons, timelines) as PDF or print-friendly HTML for offline use and reporting.

### Task

Create utility functions and components for:

1. **PDF Export** - Generate PDF from React components
2. **Print Styles** - CSS for print-friendly layouts
3. **Export Button Component** - Reusable button with dropdown (PDF, Print, CSV)

### Deliverables

1. `/client/src/utils/export-pdf.ts` - PDF generation utilities
2. `/client/src/utils/export-csv.ts` - CSV export utilities
3. `/client/src/components/ExportButton.tsx` - Export button component
4. `/client/src/styles/print.css` - Print-specific styles

### Key Requirements

- Use `jsPDF` or `html2pdf.js` for PDF generation
- Support exporting:
  - Regulation detail pages
  - Comparison matrices
  - Timeline views
  - News articles
- Include ISA branding (logo, footer)
- Preserve formatting and colors
- Add page numbers and timestamps

### Success Criteria

```tsx
<ExportButton
  contentRef={regulationDetailRef}
  filename="CSRD_Regulation_Summary"
  formats={["pdf", "print"]}
/>
```

Clicking button should:
- Show dropdown with format options
- Generate PDF with proper layout
- Open print dialog with print-friendly CSS
- Download file with correct filename

---

## Delivery Format

Same as Batch 01 Retry:

```
CGPT-XX: Task Name

Files Created

⸻

File 1: /path/to/file.ts

[COMPLETE FILE CONTENT]

⸻

File 2: /path/to/file.test.ts

[COMPLETE FILE CONTENT]
```

---

## Critical Formatting Rules (Same as Batch 01)

1. **NO visual separator characters** (⸻, ===, ---) inside code files
2. **Use forEach() instead of for...of** for iterators
3. **Import all types** used in function signatures
4. **Test Date inputs** for date fields
5. **Remove implementation notes** from test files
6. **Complete file contents** - no truncation

---

## Integration Notes

### Dependencies Available

- shadcn/ui components (Button, Card, Table, Badge, Accordion, Alert, Checkbox)
- Lucide icons
- tRPC client (`trpc.*` hooks)
- Existing types in `/shared/epcis-cbv-types.ts`
- Existing regulation data model

### Testing Requirements

- Use Vitest for unit tests
- Use React Testing Library for component tests
- Minimum 80% code coverage
- Test happy paths, edge cases, and error scenarios

---

## Timeline

Please deliver all 5 tasks in a single response. Estimated total: ~1500 lines of code + tests.
