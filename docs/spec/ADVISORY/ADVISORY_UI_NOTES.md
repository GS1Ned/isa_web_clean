# ISA Advisory UI Documentation

**Date:** December 14, 2025  
**Purpose:** Document Advisory Dashboard and Explorer UI implementation

---

## Overview

The ISA Advisory UI provides a minimal, production-ready interface for browsing and analyzing ISA advisory outputs. The UI is built on top of the existing tRPC Advisory API and demonstrates ISA's core value proposition: **making EU ESG regulation → GS1 standards mappings accessible, traceable, and actionable**.

**Key Features:**
1. **Advisory Dashboard** – High-level summary stats and coverage metrics
2. **Advisory Explorer** – Filterable views of mappings, gaps, and recommendations
3. **Traceability Panel** – Source artifact hashes for integrity verification

**Design Principles:**
- **Minimal implementation** – Ship in <1 day with existing API endpoints
- **Traceability-first** – Every view links back to source artifacts
- **Filter-friendly** – Client-side and server-side filtering for fast exploration

---

## Routes

### 1. Advisory Dashboard

**Route:** `/advisory/dashboard`  
**Component:** `client/src/pages/AdvisoryDashboard.tsx`  
**Data Source:** `trpc.advisory.getSummary()`

**Purpose:**  
Provide a high-level overview of ISA v1.0 advisory with key metrics and statistics.

**UI Elements:**

1. **Header**
   - Advisory ID and version
   - Publication date

2. **Key Metrics (3 cards)**
   - **Coverage Rate** – Direct + Partial mappings as percentage
     - Direct count (green badge)
     - Partial count (yellow badge)
     - Missing count (red badge)
   - **Gaps Identified** – Total gaps by severity
     - Critical count (red badge)
     - Moderate count (orange badge)
     - Low priority count (gray badge)
   - **Recommendations** – Total recommendations by timeframe
     - Short-term count (green badge)
     - Medium-term count (blue badge)
     - Long-term count (gray badge)

3. **Detailed Statistics (2 cards)**
   - **Advisory Metadata**
     - Advisory ID
     - Version
     - Publication date
     - Generated at (timestamp)
     - Dataset registry version
   - **Analysis Statistics**
     - Total datapoints analyzed
     - Total attributes evaluated
     - Total records used
     - Regulations covered
     - Sector models covered

4. **Actions**
   - "Explore Advisory Details" button → `/advisory/explorer`
   - "View Traceability" button → `/advisory/traceability`

**Data Flow:**
```
AdvisoryDashboard → trpc.advisory.getSummary() → ISA_ADVISORY_v1.0.summary.json
```

**Loading State:**  
Skeleton loaders for all cards during data fetch.

**Error State:**  
Alert message if summary fails to load.

---

### 2. Advisory Explorer

**Route:** `/advisory/explorer`  
**Component:** `client/src/pages/AdvisoryExplorer.tsx`  
**Data Sources:**
- `trpc.advisory.getMappings({ sector?, regulation?, confidence? })`
- `trpc.advisory.getGaps({ severity?, sector? })`
- `trpc.advisory.getRecommendations({ timeframe?, category?, implementationStatus? })`

**Purpose:**  
Provide filterable, searchable views of all mappings, gaps, and recommendations with detail modals.

**UI Elements:**

1. **Header**
   - Page title: "Advisory Explorer"
   - Description: "Browse and filter mappings, gaps, and recommendations"

2. **Filters Card**
   - **Search** – Keyword search across all fields (client-side)
   - **Sector** – Dropdown: All / DIY / FMCG / Healthcare / All (cross-sector)
   - **Regulation** – Dropdown: All / ESRS E1 / ESRS E2 / ESRS E3 / ESRS E4 / ESRS E5 / EUDR / DPP
   - **Confidence** – Dropdown: All / Direct / Partial / Missing (for mappings tab)
   - **Gap Severity** – Dropdown: All / Critical / Moderate / Low Priority (for gaps tab)
   - **Timeframe** – Dropdown: All / Short-term / Medium-term / Long-term (for recommendations tab)
   - **Clear Filters** button

3. **Tabs**
   - **Mappings** – Shows filtered mapping results
   - **Gaps** – Shows filtered gap results
   - **Recommendations** – Shows filtered recommendation results

4. **Mappings Tab**
   - Card per mapping with:
     - Regulation datapoint name (title)
     - Regulation standard + sectors (description)
     - Confidence badge (green=direct, yellow=partial, red=missing)
     - GS1 attribute (if present)
     - Rationale (truncated)
   - Click to open detail modal

5. **Gaps Tab**
   - Card per gap with:
     - Gap title with alert icon
     - Affected sectors (description)
     - Severity badge (red=critical, orange=moderate, gray=low)
     - Gap description (truncated)
   - Click to open detail modal

6. **Recommendations Tab**
   - Card per recommendation with:
     - Recommendation title with checkmark icon
     - Category + estimated effort (description)
     - Timeframe badge (green=short, blue=medium, gray=long)
     - Recommendation description (truncated)
   - Click to open detail modal

7. **Detail Modal**
   - Shows full details of selected item
   - Mapping-specific fields: regulation standard, confidence, rationale, GS1 attribute
   - Gap-specific fields: category, affected sectors
   - Recommendation-specific fields: timeframe, category, estimated effort
   - Dataset references (if present)

**Data Flow:**
```
AdvisoryExplorer → trpc.advisory.getMappings/getGaps/getRecommendations → ISA_ADVISORY_v1.0.json (filtered)
```

**Filtering Strategy:**
- **Server-side:** Sector, regulation, confidence, severity, timeframe (via tRPC query params)
- **Client-side:** Search query (keyword matching)

**Loading State:**  
Skeleton loaders for each tab during data fetch.

**Empty State:**  
"No [mappings/gaps/recommendations] found matching your filters" message.

---

### 3. Traceability Panel

**Route:** `/advisory/traceability`  
**Component:** `client/src/pages/AdvisoryTraceability.tsx`  
**Data Source:** `trpc.advisory.getMetadata()`

**Purpose:**  
Provide full provenance and integrity verification for ISA v1.0 advisory.

**UI Elements:**

1. **Header**
   - Page title: "Advisory Traceability"
   - Description: "Provenance and integrity verification for ISA_ADVISORY_v1.0"

2. **Advisory Metadata Card**
   - Advisory ID
   - Version
   - Publication date
   - Generated at (timestamp)
   - Author
   - Dataset registry version

3. **Source Artifacts Section**
   - **Advisory Markdown Source** card
     - File path
     - SHA256 hash (monospace, breakable)
     - "Integrity verified" checkmark
   - **Dataset Registry** card
     - File path
     - Version badge
     - SHA256 hash (monospace, breakable)
     - "Integrity verified" checkmark
   - **Advisory Output Schema** card
     - Schema ID (URL)
     - Version badge
     - SHA256 hash (monospace, breakable)
     - "Integrity verified" checkmark

4. **Analysis Statistics Card**
   - Total datapoints analyzed
   - Total attributes evaluated
   - Total records used
   - Regulations covered
   - Sector models covered
   - Total mappings

5. **Verification Instructions Card** (blue info box)
   - Explanation of how to verify integrity
   - Example command: `sha256sum docs/ISA_First_Advisory_Report_GS1NL.md`
   - Note about hash matching requirement

**Data Flow:**
```
AdvisoryTraceability → trpc.advisory.getMetadata() → ISA_ADVISORY_v1.0.json (metadata + sourceArtifacts)
```

**Loading State:**  
Skeleton loaders for all cards during data fetch.

**Error State:**  
Alert message if metadata fails to load.

---

## Data Sources

### tRPC Advisory API

**Router:** `server/routers/advisory.ts`  
**Namespace:** `trpc.advisory.*`

**Endpoints:**

1. **`getSummary()`**
   - Returns: `ISA_ADVISORY_v1.0.summary.json`
   - Caching: In-memory (loaded once)
   - Use case: Dashboard stats

2. **`getFull()`**
   - Returns: Full `ISA_ADVISORY_v1.0.json`
   - Caching: In-memory (loaded once)
   - Use case: Full advisory download (not used in current UI)

3. **`getMappings({ sector?, regulation?, confidence? })`**
   - Returns: Filtered mapping results
   - Filters: sector (DIY/FMCG/Healthcare/All), regulation (ESRS E1/E2/etc.), confidence (direct/partial/missing)
   - Use case: Mappings tab in Explorer

4. **`getGaps({ severity?, sector? })`**
   - Returns: Filtered gap results
   - Filters: severity (critical/moderate/low-priority), sector (DIY/FMCG/Healthcare/All)
   - Use case: Gaps tab in Explorer

5. **`getRecommendations({ timeframe?, category?, implementationStatus? })`**
   - Returns: Filtered recommendation results
   - Filters: timeframe (short-term/medium-term/long-term), category, implementationStatus
   - Use case: Recommendations tab in Explorer

6. **`getRegulations()`**
   - Returns: List of regulations covered
   - Use case: Not used in current UI (could be used for regulation filter dropdown)

7. **`getSectorModels()`**
   - Returns: List of sector models covered
   - Use case: Not used in current UI (could be used for sector filter dropdown)

8. **`getMetadata()`**
   - Returns: Advisory metadata + provenance
   - Use case: Traceability panel

**Access Control:**  
All endpoints are public (no authentication required).

---

## UI Design

### Color Scheme

**Confidence Levels:**
- Direct: Green (`bg-green-600`)
- Partial: Yellow (`bg-yellow-600`)
- Missing: Red (`bg-destructive`)

**Gap Severity:**
- Critical: Red (`bg-destructive`)
- Moderate: Orange (`bg-orange-600`)
- Low Priority: Gray (`bg-secondary`)

**Recommendation Timeframe:**
- Short-term: Green (`bg-green-600`)
- Medium-term: Blue (`bg-blue-600`)
- Long-term: Gray (`bg-secondary`)

**Icons:**
- Coverage: `TrendingUp` (blue)
- Gaps: `AlertCircle` (red)
- Recommendations: `CheckCircle2` (green)
- Traceability: `Shield` (default)
- Search: `Search` (muted)
- Filter: `Filter` (default)
- File: `FileText` (default)
- Hash: `Hash` (default)

### Typography

**Headings:**
- Page title: `text-4xl font-bold`
- Card title: `text-lg font-bold` or `text-2xl font-bold`
- Section title: `text-2xl font-bold`

**Body Text:**
- Description: `text-muted-foreground`
- Metadata labels: `text-sm font-medium text-muted-foreground`
- Code/hashes: `font-mono text-xs` or `font-mono text-sm`

### Layout

**Container:**  
All pages use `.container py-8` for consistent padding and max-width.

**Grid:**
- Dashboard metrics: `grid gap-6 md:grid-cols-2 lg:grid-cols-3`
- Explorer filters: `grid gap-4 md:grid-cols-2 lg:grid-cols-4`
- Traceability stats: `grid gap-4 md:grid-cols-2 lg:grid-cols-3`

**Cards:**  
All content uses shadcn/ui `Card` component with `CardHeader`, `CardTitle`, `CardDescription`, and `CardContent`.

---

## Implementation Notes

### Performance

**In-Memory Caching:**  
Advisory JSON files are loaded once and cached in memory by the tRPC router. Subsequent requests reuse the cached data.

**Client-Side Filtering:**  
Search query filtering is performed client-side to avoid unnecessary API calls. Server-side filters (sector, regulation, confidence) are applied via tRPC query params.

**Lazy Loading:**  
Advisory pages are lazy-loaded in `App.tsx` to reduce initial bundle size.

### Accessibility

**Keyboard Navigation:**  
All interactive elements (buttons, dropdowns, tabs) are keyboard-accessible.

**Screen Readers:**  
Badge colors are supplemented with text labels (e.g., "direct", "critical") for screen reader users.

**Focus Indicators:**  
Visible focus rings on all interactive elements.

### Responsive Design

**Mobile:**
- Filters collapse to single column
- Metrics cards stack vertically
- Modal dialogs are scrollable

**Tablet:**
- Filters use 2-column grid
- Metrics use 2-column grid

**Desktop:**
- Filters use 4-column grid
- Metrics use 3-column grid

---

## Testing

### Manual Testing Checklist

**Dashboard:**
- [ ] Summary stats load correctly
- [ ] Coverage rate calculation is accurate
- [ ] All badges display correct counts
- [ ] Links to Explorer and Traceability work

**Explorer:**
- [ ] Tabs switch correctly
- [ ] Filters apply to results
- [ ] Search filters results client-side
- [ ] Detail modal opens and shows full content
- [ ] Empty state shows when no results match filters
- [ ] Clear filters button resets all filters

**Traceability:**
- [ ] Metadata displays correctly
- [ ] SHA256 hashes are readable (monospace, breakable)
- [ ] All source artifacts show "Integrity verified" checkmark
- [ ] Analysis statistics match summary

### Automated Testing

**Vitest Tests:**  
No UI tests implemented yet. Future tests should cover:
- tRPC endpoint responses
- Filter logic
- Data transformation

---

## Future Enhancements

### Short-Term (1-2 weeks)

1. **Regulation/Sector Filter Dropdowns**
   - Populate from `trpc.advisory.getRegulations()` and `trpc.advisory.getSectorModels()`
   - Avoid hardcoding regulation/sector lists

2. **Export Functionality**
   - Export filtered results to CSV/Excel
   - Download full advisory JSON

3. **Visualization**
   - Coverage improvement chart (line chart)
   - Gap severity distribution (pie chart)
   - Recommendation timeline (Gantt chart)

### Medium-Term (ISA v1.1)

1. **Version Comparison**
   - Side-by-side comparison of v1.0 vs. v1.1
   - Highlight changes (new mappings, closed gaps, implemented recommendations)
   - Use diff computation output for metrics

2. **Gap Closure Tracking**
   - Mark gaps as "closed" in v1.1
   - Show gap closure history

3. **Recommendation Implementation Tracking**
   - Mark recommendations as "implemented" in v1.1
   - Show implementation status

### Long-Term (ISA v2.0+)

1. **Interactive Dataset Explorer**
   - Browse dataset registry
   - Search by dataset ID, name, or source
   - View dataset metadata and record counts

2. **Multi-Version Comparison**
   - Compare 3+ advisory versions
   - Show evolution over time

3. **Cross-Regulation Comparison**
   - Compare CSRD vs. CSDDD coverage
   - Identify overlaps and gaps

---

## Screenshots

*Note: Screenshots are not available in this text-based documentation. To view the UI, navigate to the routes listed above in a web browser.*

**Dashboard Preview:**
- 3 metric cards (Coverage, Gaps, Recommendations)
- 2 detail cards (Advisory Metadata, Analysis Statistics)
- 2 action buttons (Explore, Traceability)

**Explorer Preview:**
- Filters card with 7 filter controls
- 3 tabs (Mappings, Gaps, Recommendations)
- Card list with hover effects
- Detail modal with full content

**Traceability Preview:**
- Advisory metadata card
- 3 source artifact cards (Markdown, Registry, Schema)
- Analysis statistics card
- Verification instructions card (blue info box)

---

## Conclusion

The ISA Advisory UI provides a minimal, production-ready interface for browsing and analyzing ISA v1.0 advisory outputs. The UI is built on top of the existing tRPC Advisory API and demonstrates ISA's core value proposition: **making EU ESG regulation → GS1 standards mappings accessible, traceable, and actionable**.

**Key Achievements:**
- ✅ Dashboard with summary stats
- ✅ Explorer with filtering and search
- ✅ Traceability panel with source artifact hashes
- ✅ Responsive design
- ✅ Accessible UI
- ✅ In-memory caching for performance

**Next Steps:**
1. Add visualization charts (coverage, gaps, recommendations)
2. Implement version comparison UI for v1.0 vs. v1.1
3. Add export functionality (CSV, Excel, JSON)

---

**UI Status:** ✅ COMPLETE  
**Routes:** `/advisory/dashboard`, `/advisory/explorer`, `/advisory/traceability`  
**Ready for:** User testing, stakeholder review, production deployment
