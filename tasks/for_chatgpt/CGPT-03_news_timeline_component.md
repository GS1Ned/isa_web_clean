# CGPT-03: News Timeline Visualization Component

**Task ID:** CGPT-03  
**Priority:** ⭐ MEDIUM  
**Risk Level:** Low  
**Estimated Effort:** 6-8 hours  
**Dependencies:** None  
**Status:** Ready

---

## Context

### ISA Mission

ISA provides ESG compliance intelligence by connecting EU regulations with GS1 standards. A key UX feature is showing users **how regulations evolve over time** by displaying regulation milestones (effective dates, deadlines) alongside related news articles on an interactive timeline.

### Relevant Subsystem

This task focuses on creating a **React component** in `/client/src/components/` that will be used on:

- **Regulation detail pages** (`/hub/regulations/:id`) - Show timeline of a single regulation
- **News Hub** (`/news`) - Show timeline of all ESG news
- **Comparison tool** (`/hub/compare`) - Show timelines of multiple regulations side-by-side

### Key Files in Repo

- `/client/src/components/` - Reusable UI components
- `/client/src/pages/HubRegulationDetail.tsx` - Where timeline will be integrated
- `/client/src/lib/trpc.ts` - tRPC client for data fetching
- `/drizzle/schema.ts` - Database schema (regulations, hub_news tables)

---

## Exact Task

### Goal

Build a **responsive, interactive timeline component** that displays regulation milestones and related news articles in chronological order with visual distinction between event types.

### How It Will Be Used

**On Regulation Detail Pages:**

```typescript
// In client/src/pages/HubRegulationDetail.tsx
import { NewsTimeline } from "@/components/NewsTimeline";

<NewsTimeline
  events={[
    {
      id: "milestone-1",
      type: "milestone",
      date: new Date("2024-01-01"),
      title: "CSRD Effective Date",
      description: "Regulation enters into force",
      metadata: { regulationId: 1, milestoneType: "effective_date" },
    },
    {
      id: "news-1",
      type: "news",
      date: new Date("2024-02-15"),
      title: "Commission publishes CSRD guidance",
      description: "New guidance document clarifies reporting requirements...",
      metadata: { newsId: 123, source: "EU Official Journal" },
    },
  ]}
  onEventClick={(event) => {
    if (event.type === "news") {
      navigate(`/news/${event.metadata.newsId}`);
    }
  }}
/>
```

---

## Technical Specification

### 1. File Structure

**Create these files:**

```
/client/src/components/
├── NewsTimeline.tsx              # Main timeline component
├── NewsTimeline.test.tsx         # (Optional) Component tests
└── NewsTimelineEvent.tsx         # Individual event card component
```

### 2. Component Props

**File:** `/client/src/components/NewsTimeline.tsx`

```typescript
export interface TimelineEvent {
  /** Unique identifier */
  id: string;
  /** Event type determines visual styling */
  type: "milestone" | "news" | "deadline" | "amendment";
  /** Event date (used for chronological sorting) */
  date: Date;
  /** Event title (max ~80 chars) */
  title: string;
  /** Event description (optional, max ~200 chars) */
  description?: string;
  /** Additional metadata for event-specific data */
  metadata?: Record<string, any>;
}

export interface NewsTimelineProps {
  /** Array of timeline events (will be sorted by date automatically) */
  events: TimelineEvent[];
  /** Callback when user clicks an event */
  onEventClick?: (event: TimelineEvent) => void;
  /** Show only events within date range (optional) */
  dateRange?: { start: Date; end: Date };
  /** Highlight specific event types (optional) */
  highlightTypes?: Array<"milestone" | "news" | "deadline" | "amendment">;
  /** Compact mode for smaller spaces (optional, default: false) */
  compact?: boolean;
}

export function NewsTimeline(props: NewsTimelineProps): JSX.Element;
```

### 3. Visual Design

**Layout:**

- Vertical timeline with a central line
- Events alternate left/right for visual balance (desktop)
- Events stack vertically on mobile (all on one side)
- Date markers on the timeline line
- Visual connectors from events to the timeline line

**Event Styling by Type:**

| Type        | Icon                       | Color  | Border |
| ----------- | -------------------------- | ------ | ------ |
| `milestone` | 🏁 (or Lucide `Flag`)      | Blue   | Solid  |
| `news`      | 📰 (or Lucide `Newspaper`) | Green  | Dashed |
| `deadline`  | ⏰ (or Lucide `Clock`)     | Red    | Solid  |
| `amendment` | ✏️ (or Lucide `Edit`)      | Orange | Dashed |

**Responsive Behavior:**

- Desktop (>768px): Events alternate left/right
- Mobile (<768px): All events on right side, compact layout
- Touch-friendly click targets (min 44x44px)

**Accessibility:**

- Semantic HTML (`<article>`, `<time>`, `<button>`)
- ARIA labels for screen readers
- Keyboard navigation support (Tab, Enter)
- Focus indicators visible

### 4. Implementation Details

**Sorting Logic:**

```typescript
// Events should be sorted by date (oldest first) automatically
const sortedEvents = [...props.events].sort(
  (a, b) => a.date.getTime() - b.date.getTime()
);
```

**Date Range Filtering:**

```typescript
// If dateRange prop provided, filter events
const filteredEvents = props.dateRange
  ? sortedEvents.filter(
      event =>
        event.date >= props.dateRange.start && event.date <= props.dateRange.end
    )
  : sortedEvents;
```

**Highlight Logic:**

```typescript
// If highlightTypes prop provided, add visual emphasis
const isHighlighted = props.highlightTypes?.includes(event.type);
// Apply highlight styling (e.g., thicker border, shadow)
```

**Click Handling:**

```typescript
const handleEventClick = (event: TimelineEvent) => {
  if (props.onEventClick) {
    props.onEventClick(event);
  }
};
```

### 5. Styling

Use **Tailwind CSS** classes for all styling. Follow ISA's design system:

- Background colors: `bg-card`, `bg-background`
- Text colors: `text-foreground`, `text-muted-foreground`
- Borders: `border-border`
- Shadows: `shadow-sm`, `shadow-md`
- Spacing: Use Tailwind spacing scale (`p-4`, `m-2`, etc.)

**Example Event Card Styling:**

```tsx
<div
  className={`
  rounded-lg border p-4 bg-card shadow-sm
  hover:shadow-md transition-shadow cursor-pointer
  ${isHighlighted ? "ring-2 ring-accent" : ""}
  ${event.type === "milestone" ? "border-blue-500" : ""}
  ${event.type === "news" ? "border-green-500 border-dashed" : ""}
`}
>
  {/* Event content */}
</div>
```

### 6. Example Usage

**Example 1: Single Regulation Timeline**

```typescript
<NewsTimeline
  events={[
    {
      id: "m1",
      type: "milestone",
      date: new Date("2023-01-05"),
      title: "CSRD Adopted",
      description: "Directive (EU) 2022/2464 published in Official Journal",
    },
    {
      id: "n1",
      type: "news",
      date: new Date("2023-06-15"),
      title: "EFRAG publishes first ESRS standards",
      description: "12 ESRS standards adopted by European Commission",
      metadata: { newsId: 456 },
    },
    {
      id: "d1",
      type: "deadline",
      date: new Date("2024-01-01"),
      title: "CSRD Effective Date",
      description: "Regulation enters into force",
    },
  ]}
  onEventClick={(event) => {
    if (event.type === "news") {
      console.log("Navigate to news:", event.metadata.newsId);
    }
  }}
/>
```

**Example 2: Filtered Timeline**

```typescript
<NewsTimeline
  events={allEvents}
  dateRange={{
    start: new Date("2024-01-01"),
    end: new Date("2024-12-31"),
  }}
  highlightTypes={["deadline"]}
  compact={true}
/>
```

**Example 3: Empty State**

```typescript
<NewsTimeline
  events={[]}
  // Should display: "No timeline events to display"
/>
```

---

## Constraints and Conventions

### Coding Standards

- **React 19** - Use functional components with hooks
- **TypeScript strict mode** - All props and state explicitly typed
- **Tailwind CSS** - No inline styles or custom CSS files
- **shadcn/ui** - Use shadcn/ui components where applicable (Card, Badge, etc.)
- **Lucide icons** - Use Lucide React icons (already installed)

### Component Structure

```tsx
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flag, Newspaper, Clock, Edit } from "lucide-react";

export function NewsTimeline(props: NewsTimelineProps) {
  // 1. Sort and filter events
  // 2. Render timeline structure
  // 3. Map events to TimelineEvent components

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-border" />

      {/* Events */}
      {sortedEvents.map((event, index) => (
        <NewsTimelineEvent
          key={event.id}
          event={event}
          position={index % 2 === 0 ? "left" : "right"}
          isHighlighted={isHighlighted(event)}
          onClick={() => handleEventClick(event)}
        />
      ))}
    </div>
  );
}
```

### Performance

- Use `React.memo` for `NewsTimelineEvent` if performance issues arise
- Avoid expensive computations in render (memoize sorted/filtered arrays)
- Limit timeline to ~50 events max (pagination if needed)

---

## Dependency Assumptions

### What Manus Guarantees

**Existing Components:**

- shadcn/ui components are available (`@/components/ui/*`)
- Lucide icons are installed (`lucide-react`)
- Tailwind CSS is configured and working

**No Backend Changes Required:**

- This is a pure frontend component
- Data will be passed via props (no tRPC calls needed in component)

### What You Must NOT Change

- Do NOT modify `/client/src/lib/trpc.ts`
- Do NOT create new API endpoints
- Do NOT modify existing page components (just create the new component)
- Do NOT add new npm dependencies

---

## Acceptance Criteria

### Code Quality

- [ ] TypeScript compiles without errors
- [ ] Component follows React 19 best practices (functional, hooks)
- [ ] All props are explicitly typed with interfaces
- [ ] No console errors or warnings in browser

### Functionality

- [ ] Events are sorted chronologically (oldest first)
- [ ] Date range filtering works correctly
- [ ] Highlight types work correctly
- [ ] Click handler fires with correct event data
- [ ] Empty state displays when no events
- [ ] Compact mode reduces spacing appropriately

### Visual Design

- [ ] Timeline line is visible and centered
- [ ] Events alternate left/right on desktop
- [ ] Events stack vertically on mobile
- [ ] Event type colors match specification
- [ ] Icons display correctly for each event type
- [ ] Hover effects work smoothly
- [ ] Responsive breakpoints work correctly

### Accessibility

- [ ] Semantic HTML elements used
- [ ] ARIA labels present where needed
- [ ] Keyboard navigation works (Tab, Enter)
- [ ] Focus indicators visible
- [ ] Color contrast meets WCAG AA standards

---

## Deliverables

When complete, provide:

1. **Component files:**
   - `/client/src/components/NewsTimeline.tsx`
   - `/client/src/components/NewsTimelineEvent.tsx`

2. **Documentation:**
   - JSDoc comments in component files
   - Usage examples in comments

3. **Notes:**
   - Any design decisions you made
   - Suggestions for future enhancements
   - Known limitations

---

## Future Extensions (Out of Scope)

These are NOT required for this task:

- Zoom/pan controls for long timelines
- Export timeline as image/PDF
- Animation effects for event appearance
- Drag-and-drop event reordering

---

## Questions?

If anything is unclear:

1. Document your assumptions in delivery notes
2. Implement conservatively (choose the simplest approach)
3. Flag ambiguities for future spec improvements

---

**Created:** December 11, 2025  
**Spec Version:** 1.0  
**Changelog Version:** 1.0 (see `/docs/CHANGELOG_FOR_CHATGPT.md`)
