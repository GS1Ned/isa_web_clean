/**
 * News Event Processor (B5 — ISA2-0007)
 *
 * Derives a typed NewsChangeEvent from a hub_news record.
 * Extracts deadline/urgency and maps to a standard change-intelligence shape
 * that drives compliance cockpit surfaces and downstream advisory triggers.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type RegulatoryEventType =
  | "ADOPTION"
  | "AMENDMENT"
  | "ENFORCEMENT_ACTION"
  | "DELEGATED_ACT"
  | "GUIDANCE_PUBLICATION"
  | "PROPOSAL"
  | "POSTPONEMENT"
  | "CONSULTATION"
  | "UNKNOWN";

export type UrgencyLevel = "HIGH" | "MEDIUM" | "LOW";

export interface NewsChangeEvent {
  /** Source hub_news.id */
  hubNewsId: number;
  /** Derived event classification */
  eventType: RegulatoryEventType;
  /** e.g. "CSRD", "EUDR", "ESPR", "DPP" */
  primaryRegulation: string | null;
  /** ISO date string of the extracted deadline, if any */
  complianceDeadline: string | null;
  /** Months until deadline (null if no deadline or past) */
  monthsToDeadline: number | null;
  /** Signal urgency combining eventType + credibility + deadline proximity */
  urgencyLevel: UrgencyLevel;
  /** Why this urgency was assigned */
  urgencyReason: string;
  /** Whether this event should trigger downstream advisory re-generation */
  triggersAdvisoryUpdate: boolean;
  /** Whether this event should trigger downstream roadmap re-prioritization */
  triggersRoadmapUpdate: boolean;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

const REGULATION_PATTERNS: Array<{ code: string; pattern: RegExp }> = [
  { code: "CSRD", pattern: /\bCSRD\b/i },
  { code: "ESRS", pattern: /\bESRS\b/i },
  { code: "EUDR", pattern: /\bEUDR\b/i },
  { code: "DPP", pattern: /\bDPP\b|\bdigital product passport/i },
  { code: "ESPR", pattern: /\bESPR\b/i },
  { code: "PPWR", pattern: /\bPPWR\b|\bpackaging.*regulation/i },
  { code: "CSDDD", pattern: /\bCSDDD\b/i },
  { code: "EU_TAXONOMY", pattern: /\bEU\s+taxonomy\b/i },
];

/** Deadline extraction: looks for year + optionally month/quarter */
const DEADLINE_PATTERNS: RegExp[] = [
  // "by 1 January 2026" / "by January 2026" / "by Q1 2026"
  /by\s+(?:\d{1,2}\s+)?(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{4})/i,
  /by\s+Q[1-4]\s+(\d{4})/i,
  // "from 2026", "from 1 January 2026", "applicabl(?:e|ity) (?:from|as of|starting)"
  /applicabl(?:e|ity)\s+(?:from|as\s+of|starting).*?(\b20\d{2}\b)/i,
  // "deadline of" / "deadline:" / "implementation deadline"
  /(?:compliance|implementation|reporting)\s+deadline\D{0,20}(\b20\d{2}\b)/i,
  // "enters into force" / "entry into force"
  /entr(?:y|ies)\s+into\s+force.*?(\b20\d{2}\b)/i,
  // Plain year at boundary after trigger phrase
  /(?:effective|mandatory|required|obligat\w+)\s+(?:from\s+)?(\b20\d{2}\b)/i,
];

function extractDeadlineYear(text: string): string | null {
  for (const pattern of DEADLINE_PATTERNS) {
    const match = pattern.exec(text);
    if (match) {
      const year = parseInt(match[1], 10);
      if (year >= 2024 && year <= 2032) {
        return `${year}-01-01`;
      }
    }
  }
  return null;
}

function monthsUntil(isoDate: string, refDate: Date): number | null {
  const target = new Date(isoDate);
  if (isNaN(target.getTime())) return null;
  const diffMs = target.getTime() - refDate.getTime();
  if (diffMs < 0) return null; // past
  return Math.round(diffMs / (1000 * 60 * 60 * 24 * 30));
}

function extractPrimaryRegulation(text: string): string | null {
  for (const { code, pattern } of REGULATION_PATTERNS) {
    if (pattern.test(text)) return code;
  }
  return null;
}

/**
 * Maps `hub_news.regulatory_state` enum values to a typed event classification.
 */
function classifyEventType(regulatoryState: string | null | undefined): RegulatoryEventType {
  switch (regulatoryState) {
    case "ADOPTED": return "ADOPTION";
    case "AMENDMENT": return "AMENDMENT";
    case "ENFORCEMENT_SIGNAL": return "ENFORCEMENT_ACTION";
    case "DELEGATED_ACT_DRAFT":
    case "DELEGATED_ACT_ADOPTED": return "DELEGATED_ACT";
    case "GUIDANCE": return "GUIDANCE_PUBLICATION";
    case "PROPOSAL":
    case "POLITICAL_AGREEMENT": return "PROPOSAL";
    case "POSTPONED_OR_SOFTENED": return "POSTPONEMENT";
    default: return "UNKNOWN";
  }
}

/** Advisory triggers: states that require downstream re-generation */
const ADVISORY_TRIGGER_STATES = new Set<RegulatoryEventType>([
  "ADOPTION",
  "AMENDMENT",
  "ENFORCEMENT_ACTION",
  "DELEGATED_ACT",
]);

/** Roadmap triggers: states that require re-prioritization */
const ROADMAP_TRIGGER_STATES = new Set<RegulatoryEventType>([
  "ADOPTION",
  "AMENDMENT",
  "PROPOSAL",
  "POSTPONEMENT",
  "DELEGATED_ACT",
]);

function computeUrgency(
  eventType: RegulatoryEventType,
  credibilityScore: number,
  monthsToDeadline: number | null,
  isNegativeSignal: boolean
): { urgencyLevel: UrgencyLevel; urgencyReason: string } {
  const reasons: string[] = [];

  // High-credibility enforcement or adoption is always HIGH
  if (credibilityScore >= 0.8 && (eventType === "ADOPTION" || eventType === "ENFORCEMENT_ACTION")) {
    reasons.push(`high_credibility_${eventType.toLowerCase()}`);
    return { urgencyLevel: "HIGH", urgencyReason: reasons.join(", ") };
  }

  // Deadline imminent: ≤ 6 months
  if (monthsToDeadline !== null && monthsToDeadline <= 6) {
    reasons.push(`deadline_within_6_months`);
    return { urgencyLevel: "HIGH", urgencyReason: reasons.join(", ") };
  }

  // Deadline soon: 7–18 months
  if (monthsToDeadline !== null && monthsToDeadline <= 18) {
    reasons.push(`deadline_within_18_months`);
    if (credibilityScore >= 0.7) {
      return { urgencyLevel: "HIGH", urgencyReason: reasons.join(", ") };
    }
    return { urgencyLevel: "MEDIUM", urgencyReason: reasons.join(", ") };
  }

  // Positive credibility + actionable state
  if (credibilityScore >= 0.7 && ADVISORY_TRIGGER_STATES.has(eventType)) {
    reasons.push(`credible_advisory_trigger`);
    return { urgencyLevel: "MEDIUM", urgencyReason: reasons.join(", ") };
  }

  // Negative signal (softening/postponement) — notable but lower urgency
  if (isNegativeSignal) {
    reasons.push("negative_signal_postponement");
    return { urgencyLevel: "MEDIUM", urgencyReason: reasons.join(", ") };
  }

  reasons.push("default_low");
  return { urgencyLevel: "LOW", urgencyReason: reasons.join(", ") };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Derives a typed NewsChangeEvent from a hub_news record.
 *
 * @param hubNewsId   hub_news.id
 * @param title       hub_news.title
 * @param content     hub_news.content (nullable)
 * @param summary     hub_news.summary (nullable)
 * @param regulatoryState hub_news.regulatory_state enum value
 * @param credibilityScore hub_news.credibility_score (0–1)
 * @param isNegativeSignal hub_news.is_negative_signal
 * @param refDate     Reference date for deadline distance (defaults to now)
 */
export function processNewsEvent(
  hubNewsId: number,
  title: string,
  content: string | null | undefined,
  summary: string | null | undefined,
  regulatoryState: string | null | undefined,
  credibilityScore: number,
  isNegativeSignal: boolean,
  refDate: Date = new Date()
): NewsChangeEvent {
  const fullText = [title, summary, content].filter(Boolean).join(" ");

  const eventType = classifyEventType(regulatoryState);
  const primaryRegulation = extractPrimaryRegulation(fullText);
  const complianceDeadline = extractDeadlineYear(fullText);
  const monthsToDeadline = complianceDeadline ? monthsUntil(complianceDeadline, refDate) : null;

  const { urgencyLevel, urgencyReason } = computeUrgency(
    eventType,
    credibilityScore,
    monthsToDeadline,
    isNegativeSignal
  );

  return {
    hubNewsId,
    eventType,
    primaryRegulation,
    complianceDeadline,
    monthsToDeadline,
    urgencyLevel,
    urgencyReason,
    triggersAdvisoryUpdate: ADVISORY_TRIGGER_STATES.has(eventType),
    triggersRoadmapUpdate: ROADMAP_TRIGGER_STATES.has(eventType),
  };
}
