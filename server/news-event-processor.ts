/**
 * Regulatory Event Processor
 * 
 * Phase 2: Hard-Gate Closure Implementation
 * - Check 5: Event-Based Aggregation
 * - Check 6: Delta Analysis
 * 
 * This module handles:
 * 1. Event detection from news articles
 * 2. Quarter-based deduplication
 * 3. Delta validation with completeness scoring
 * 4. Article-to-event linking
 */

import { getDb } from './db';
import { regulatoryEvents, hubNews, type RegulatoryEvent, type InsertRegulatoryEvent } from '../drizzle/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { invokeLLM } from './_core/llm';
import { serverLogger } from './utils/server-logger';

// ============================================================================
// TYPES
// ============================================================================

export interface EventDetectionResult {
  eventType: RegulatoryEvent['eventType'];
  primaryRegulation: string;
  affectedRegulations: string[];
  lifecycleState: RegulatoryEvent['lifecycleState'];
  eventTitle: string;
  eventSummary: string;
  eventDate: Date | null;
  // Delta Analysis fields
  previousAssumption: string;
  newInformation: string;
  whatChanged: string;
  whatDidNotChange: string;
  decisionImpact: string;
  // Confidence
  confidenceLevel: RegulatoryEvent['confidenceLevel'];
}

export interface DeltaValidationResult {
  isValid: boolean;
  completenessScore: number;
  missingFields: string[];
  forbiddenPlaceholders: string[];
}

// ============================================================================
// CONSTANTS
// ============================================================================

// Event type keywords for detection
const EVENT_TYPE_KEYWORDS: Record<string, string[]> = {
  PROPOSAL: ['proposal', 'proposed', 'draft proposal', 'legislative proposal', 'commission proposal'],
  POLITICAL_AGREEMENT: ['political agreement', 'trilogue', 'provisional agreement', 'council agreement'],
  ADOPTION: ['adopted', 'adoption', 'final adoption', 'formally adopted', 'entered into force'],
  DELEGATED_ACT_DRAFT: ['delegated act draft', 'draft delegated', 'delegated regulation draft'],
  DELEGATED_ACT_ADOPTION: ['delegated act adopted', 'delegated regulation adopted', 'delegated act enters'],
  IMPLEMENTING_ACT: ['implementing act', 'implementing regulation', 'technical standards'],
  GUIDANCE_PUBLICATION: ['guidance', 'guidelines', 'faq', 'interpretation', 'q&a', 'clarification'],
  ENFORCEMENT_START: ['enforcement', 'comes into effect', 'applicable from', 'compliance deadline'],
  DEADLINE_MILESTONE: ['deadline', 'milestone', 'reporting period', 'first report due'],
  POSTPONEMENT: ['postponed', 'delayed', 'extended', 'deferred', 'pushed back', 'uitstel'],
  AMENDMENT: ['amended', 'amendment', 'modification', 'revised', 'updated']
};

// Lifecycle state mapping from event type
const EVENT_TO_LIFECYCLE: Record<string, RegulatoryEvent['lifecycleState']> = {
  PROPOSAL: 'PROPOSAL',
  POLITICAL_AGREEMENT: 'POLITICAL_AGREEMENT',
  ADOPTION: 'ADOPTED',
  DELEGATED_ACT_DRAFT: 'DELEGATED_ACT_DRAFT',
  DELEGATED_ACT_ADOPTION: 'DELEGATED_ACT_ADOPTED',
  IMPLEMENTING_ACT: 'DELEGATED_ACT_ADOPTED',
  GUIDANCE_PUBLICATION: 'GUIDANCE',
  ENFORCEMENT_START: 'ENFORCEMENT_SIGNAL',
  DEADLINE_MILESTONE: 'ENFORCEMENT_SIGNAL',
  POSTPONEMENT: 'POSTPONED_OR_SOFTENED',
  AMENDMENT: 'ADOPTED'
};

// Minimum character thresholds for delta fields
const DELTA_MIN_CHARS: Record<string, number> = {
  previousAssumption: 50,
  newInformation: 50,
  whatChanged: 50,
  whatDidNotChange: 30,
  decisionImpact: 50
};

// Forbidden placeholder patterns
const FORBIDDEN_PLACEHOLDERS = [
  'to be determined',
  'tbd',
  'n/a',
  'not applicable',
  'unknown',
  'pending',
  'see above',
  'as mentioned',
  'no change',
  'same as before',
  '[placeholder]',
  '...',
  'xxx'
];

// Regulation codes for detection
const REGULATION_CODES = [
  'CSRD', 'ESRS', 'CSDDD', 'CS3D', 'EUDR', 'ESPR', 'DPP', 'PPWR', 
  'EU_TAXONOMY', 'SFDR', 'GREEN_CLAIMS', 'BATTERY_REGULATION', 'REACH',
  'CBAM', 'ETS', 'RED_III', 'EPBD', 'EED'
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get quarter string from date (e.g., "2025-Q1")
 */
export function getQuarter(date: Date): string {
  const year = date.getUTCFullYear();
  const quarter = Math.floor(date.getUTCMonth() / 3) + 1;
  return `${year}-Q${quarter}`;
}

/**
 * Generate dedup key for event
 */
export function generateDedupKey(primaryRegulation: string, eventType: string, quarter: string): string {
  return `${primaryRegulation}_${eventType}_${quarter}`.toUpperCase();
}

/**
 * Detect event type from text content
 */
export function detectEventType(text: string): RegulatoryEvent['eventType'] | null {
  const lowerText = text.toLowerCase();
  
  // Check each event type's keywords
  for (const [eventType, keywords] of Object.entries(EVENT_TYPE_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        return eventType as RegulatoryEvent['eventType'];
      }
    }
  }
  
  return null;
}

/**
 * Detect primary regulation from text
 */
export function detectPrimaryRegulation(text: string, regulationTags?: string[]): string | null {
  // First check regulation tags if available
  if (regulationTags && regulationTags.length > 0) {
    return regulationTags[0];
  }
  
  // Otherwise scan text for regulation codes
  const upperText = text.toUpperCase();
  for (const code of REGULATION_CODES) {
    if (upperText.includes(code)) {
      return code;
    }
  }
  
  return null;
}

/**
 * Detect all affected regulations from text
 */
export function detectAffectedRegulations(text: string, regulationTags?: string[]): string[] {
  const found = new Set<string>();
  
  // Add from regulation tags
  if (regulationTags) {
    regulationTags.forEach(tag => found.add(tag));
  }
  
  // Scan text for additional codes
  const upperText = text.toUpperCase();
  for (const code of REGULATION_CODES) {
    if (upperText.includes(code)) {
      found.add(code);
    }
  }
  
  return Array.from(found);
}

// ============================================================================
// DELTA VALIDATION
// ============================================================================

/**
 * Validate delta analysis fields for completeness
 */
export function validateDelta(delta: {
  previousAssumption?: string | null;
  newInformation?: string | null;
  whatChanged?: string | null;
  whatDidNotChange?: string | null;
  decisionImpact?: string | null;
}): DeltaValidationResult {
  const missingFields: string[] = [];
  const forbiddenPlaceholders: string[] = [];
  let totalScore = 0;
  const maxScore = 100;
  const fieldWeight = maxScore / 5; // 20 points per field
  
  const fields = [
    { name: 'previousAssumption', value: delta.previousAssumption },
    { name: 'newInformation', value: delta.newInformation },
    { name: 'whatChanged', value: delta.whatChanged },
    { name: 'whatDidNotChange', value: delta.whatDidNotChange },
    { name: 'decisionImpact', value: delta.decisionImpact }
  ];
  
  for (const field of fields) {
    const value = field.value?.trim() || '';
    const minChars = DELTA_MIN_CHARS[field.name] || 50;
    
    // Check if field is empty or too short
    if (!value || value.length < minChars) {
      missingFields.push(field.name);
      continue;
    }
    
    // Check for forbidden placeholders
    const lowerValue = value.toLowerCase();
    let hasForbidden = false;
    for (const placeholder of FORBIDDEN_PLACEHOLDERS) {
      if (lowerValue.includes(placeholder)) {
        forbiddenPlaceholders.push(`${field.name}: "${placeholder}"`);
        hasForbidden = true;
        break;
      }
    }
    
    if (hasForbidden) {
      totalScore += fieldWeight * 0.5; // Half credit for placeholder content
    } else {
      totalScore += fieldWeight; // Full credit
    }
  }
  
  const completenessScore = Math.round(totalScore);
  const isValid = completenessScore >= 80 && missingFields.length === 0;
  
  return {
    isValid,
    completenessScore,
    missingFields,
    forbiddenPlaceholders
  };
}

// ============================================================================
// EVENT DETECTION (AI-POWERED)
// ============================================================================

/**
 * Use LLM to extract event details and delta analysis from article
 */
export async function detectEventFromArticle(article: {
  id: number;
  title: string;
  summary?: string | null;
  content?: string | null;
  regulationTags?: string[] | null;
  sourceType?: string | null;
  publishedDate?: string | null;
}): Promise<EventDetectionResult | null> {
  const fullText = `${article.title}\n\n${article.summary || ''}\n\n${article.content || ''}`;
  
  // First, detect event type and regulation using heuristics
  const eventType = detectEventType(fullText);
  const primaryRegulation = detectPrimaryRegulation(fullText, article.regulationTags as string[] | undefined);
  
  // If we can't detect basic event info, skip
  if (!eventType || !primaryRegulation) {
    return null;
  }
  
  const affectedRegulations = detectAffectedRegulations(fullText, article.regulationTags as string[] | undefined);
  const lifecycleState = EVENT_TO_LIFECYCLE[eventType] || 'ADOPTED';
  
  // Use LLM for delta analysis
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: `You are a regulatory intelligence analyst. Your task is to extract decision-grade delta analysis from regulatory news.

For each article, you must provide:
1. A concise event title (max 100 chars)
2. A brief event summary (2-3 sentences)
3. Delta analysis with 5 required fields:
   - previous_assumption: What was the market/industry assumption before this event? (min 50 chars)
   - new_information: What does this event reveal that wasn't known before? (min 50 chars)
   - what_changed: What is explicitly different now compared to before? (min 50 chars)
   - what_did_not_change: What remains stable or unchanged? (min 30 chars)
   - decision_impact: Why does this matter for business decisions? What should stakeholders do? (min 50 chars)

CRITICAL: 
- Do NOT use placeholders like "TBD", "N/A", "unknown", "pending"
- Each field must contain substantive, specific information
- If you cannot determine something, make a reasonable inference based on context
- Focus on GS1 data standards impact where relevant`
        },
        {
          role: 'user',
          content: `Analyze this regulatory news article about ${primaryRegulation}:

Title: ${article.title}

Content:
${fullText.substring(0, 4000)}

Event Type Detected: ${eventType}
Primary Regulation: ${primaryRegulation}

Provide your analysis in JSON format:
{
  "event_title": "...",
  "event_summary": "...",
  "previous_assumption": "...",
  "new_information": "...",
  "what_changed": "...",
  "what_did_not_change": "...",
  "decision_impact": "...",
  "confidence_level": "CONFIRMED_LAW" | "DRAFT_PROPOSAL" | "GUIDANCE_INTERPRETATION" | "MARKET_PRACTICE"
}`
        }
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'event_delta_analysis',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              event_title: { type: 'string' },
              event_summary: { type: 'string' },
              previous_assumption: { type: 'string' },
              new_information: { type: 'string' },
              what_changed: { type: 'string' },
              what_did_not_change: { type: 'string' },
              decision_impact: { type: 'string' },
              confidence_level: { 
                type: 'string',
                enum: ['CONFIRMED_LAW', 'DRAFT_PROPOSAL', 'GUIDANCE_INTERPRETATION', 'MARKET_PRACTICE']
              }
            },
            required: ['event_title', 'event_summary', 'previous_assumption', 'new_information', 'what_changed', 'what_did_not_change', 'decision_impact', 'confidence_level'],
            additionalProperties: false
          }
        }
      }
    });
    
    const messageContent = response.choices?.[0]?.message?.content;
    const content = typeof messageContent === 'string' ? messageContent : null;
    if (!content) {
      return createFallbackEvent(article, eventType, primaryRegulation, affectedRegulations, lifecycleState);
    }
    
    const parsed = JSON.parse(content);
    
    return {
      eventType,
      primaryRegulation,
      affectedRegulations,
      lifecycleState,
      eventTitle: parsed.event_title || article.title,
      eventSummary: parsed.event_summary || article.summary || '',
      eventDate: article.publishedDate ? new Date(article.publishedDate) : null,
      previousAssumption: parsed.previous_assumption || '',
      newInformation: parsed.new_information || '',
      whatChanged: parsed.what_changed || '',
      whatDidNotChange: parsed.what_did_not_change || '',
      decisionImpact: parsed.decision_impact || '',
      confidenceLevel: parsed.confidence_level || 'GUIDANCE_INTERPRETATION'
    };
  } catch (error) {
    serverLogger.error('[EventProcessor] LLM error:', error);
    return createFallbackEvent(article, eventType, primaryRegulation, affectedRegulations, lifecycleState);
  }
}

/**
 * Create fallback event when LLM fails
 */
function createFallbackEvent(
  article: { id: number; title: string; summary?: string | null; publishedDate?: string | null },
  eventType: RegulatoryEvent['eventType'],
  primaryRegulation: string,
  affectedRegulations: string[],
  lifecycleState: RegulatoryEvent['lifecycleState']
): EventDetectionResult {
  return {
    eventType,
    primaryRegulation,
    affectedRegulations,
    lifecycleState,
    eventTitle: article.title,
    eventSummary: article.summary || '',
    eventDate: article.publishedDate ? new Date(article.publishedDate) : null,
    // Fallback delta - will be marked as INCOMPLETE
    previousAssumption: `Prior to this ${eventType.toLowerCase().replace(/_/g, ' ')}, the status of ${primaryRegulation} was in an earlier stage.`,
    newInformation: `This article reports a ${eventType.toLowerCase().replace(/_/g, ' ')} event for ${primaryRegulation}.`,
    whatChanged: `The ${primaryRegulation} regulation has progressed to ${lifecycleState.toLowerCase().replace(/_/g, ' ')} stage.`,
    whatDidNotChange: 'Core regulatory objectives remain unchanged.',
    decisionImpact: `Organizations affected by ${primaryRegulation} should review their compliance timelines and data requirements.`,
    confidenceLevel: 'GUIDANCE_INTERPRETATION'
  };
}

// ============================================================================
// EVENT CREATION AND DEDUPLICATION
// ============================================================================

/**
 * Find existing event by dedup key
 */
export async function findExistingEvent(dedupKey: string): Promise<RegulatoryEvent | null> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const results = await db
    .select()
    .from(regulatoryEvents)
    .where(eq(regulatoryEvents.dedupKey, dedupKey))
    .limit(1);
  
  return results[0] || null;
}

/**
 * Create or update regulatory event from article
 */
export async function createOrUpdateEvent(
  articleId: number,
  detection: EventDetectionResult
): Promise<{ eventId: number; isNew: boolean; status: 'COMPLETE' | 'INCOMPLETE' | 'DRAFT' }> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  // Generate dedup key
  const eventDate = detection.eventDate || new Date();
  const quarter = getQuarter(eventDate);
  const dedupKey = generateDedupKey(detection.primaryRegulation, detection.eventType, quarter);
  
  // Check for existing event
  const existing = await findExistingEvent(dedupKey);
  
  // Validate delta
  const deltaValidation = validateDelta({
    previousAssumption: detection.previousAssumption,
    newInformation: detection.newInformation,
    whatChanged: detection.whatChanged,
    whatDidNotChange: detection.whatDidNotChange,
    decisionImpact: detection.decisionImpact
  });
  
  const status: 'COMPLETE' | 'INCOMPLETE' | 'DRAFT' = deltaValidation.isValid ? 'COMPLETE' : 'INCOMPLETE';
  
  if (existing) {
    // Update existing event - add article to source_article_ids
    const existingArticleIds = (existing.sourceArticleIds as number[]) || [];
    if (!existingArticleIds.includes(articleId)) {
      existingArticleIds.push(articleId);
      
      // Update event date range
      const newEarliest = detection.eventDate && existing.eventDateEarliest
        ? new Date(Math.min(new Date(existing.eventDateEarliest).getTime(), detection.eventDate.getTime()))
        : detection.eventDate || (existing.eventDateEarliest ? new Date(existing.eventDateEarliest) : null);
      
      const newLatest = detection.eventDate && existing.eventDateLatest
        ? new Date(Math.max(new Date(existing.eventDateLatest).getTime(), detection.eventDate.getTime()))
        : detection.eventDate || (existing.eventDateLatest ? new Date(existing.eventDateLatest) : null);
      
      await db
        .update(regulatoryEvents)
        .set({
          sourceArticleIds: existingArticleIds,
          eventDateEarliest: newEarliest?.toISOString().slice(0, 19).replace('T', ' ') || null,
          eventDateLatest: newLatest?.toISOString().slice(0, 19).replace('T', ' ') || null,
          // Keep better delta if existing is COMPLETE
          ...(existing.status !== 'COMPLETE' && status === 'COMPLETE' ? {
            previousAssumption: detection.previousAssumption,
            newInformation: detection.newInformation,
            whatChanged: detection.whatChanged,
            whatDidNotChange: detection.whatDidNotChange,
            decisionImpact: detection.decisionImpact,
            completenessScore: deltaValidation.completenessScore,
            deltaValidationPassed: deltaValidation.isValid ? 1 : 0,
            missingDeltaFields: deltaValidation.missingFields.length > 0 ? deltaValidation.missingFields : null,
            status
          } : {})
        })
        .where(eq(regulatoryEvents.id, existing.id));
      
      // Link article to event
      await db
        .update(hubNews)
        .set({ regulatoryEventId: existing.id })
        .where(eq(hubNews.id, articleId));
    }
    
    return { eventId: existing.id, isNew: false, status: existing.status as 'COMPLETE' | 'INCOMPLETE' | 'DRAFT' };
  }
  
  // Create new event
  const eventDateStr = eventDate.toISOString().slice(0, 19).replace('T', ' ');
  
  const insertData: InsertRegulatoryEvent = {
    dedupKey,
    eventType: detection.eventType,
    primaryRegulation: detection.primaryRegulation,
    affectedRegulations: detection.affectedRegulations,
    lifecycleState: detection.lifecycleState,
    eventDateEarliest: eventDateStr,
    eventDateLatest: eventDateStr,
    eventQuarter: quarter,
    eventTitle: detection.eventTitle,
    eventSummary: detection.eventSummary,
    sourceArticleIds: [articleId],
    previousAssumption: detection.previousAssumption,
    newInformation: detection.newInformation,
    whatChanged: detection.whatChanged,
    whatDidNotChange: detection.whatDidNotChange,
    decisionImpact: detection.decisionImpact,
    confidenceLevel: detection.confidenceLevel,
    confidenceSource: null, // Will be set based on highest authority source
    status,
    completenessScore: deltaValidation.completenessScore,
    deltaValidationPassed: deltaValidation.isValid ? 1 : 0,
    missingDeltaFields: deltaValidation.missingFields.length > 0 ? deltaValidation.missingFields : null
  };
  
  const result = await db.insert(regulatoryEvents).values(insertData);
  const eventId = Number(result[0].insertId);
  
  // Link article to event
  await db
    .update(hubNews)
    .set({ regulatoryEventId: eventId })
    .where(eq(hubNews.id, articleId));
  
  return { eventId, isNew: true, status };
}

// ============================================================================
// BATCH PROCESSING
// ============================================================================

/**
 * Process all unlinked articles and create/update events
 */
export async function processUnlinkedArticles(): Promise<{
  processed: number;
  eventsCreated: number;
  eventsUpdated: number;
  complete: number;
  incomplete: number;
  skipped: number;
}> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  // Get all articles without event links
  const unlinkedArticles = await db
    .select()
    .from(hubNews)
    .where(sql`${hubNews.regulatoryEventId} IS NULL`)
    .orderBy(desc(hubNews.publishedDate));
  
  let processed = 0;
  let eventsCreated = 0;
  let eventsUpdated = 0;
  let complete = 0;
  let incomplete = 0;
  let skipped = 0;
  
  for (const article of unlinkedArticles) {
    try {
      const detection = await detectEventFromArticle({
        id: article.id,
        title: article.title,
        summary: article.summary,
        content: article.content,
        regulationTags: article.regulationTags as string[] | null,
        sourceType: article.sourceType,
        publishedDate: article.publishedDate
      });
      
      if (!detection) {
        skipped++;
        continue;
      }
      
      const result = await createOrUpdateEvent(article.id, detection);
      processed++;
      
      if (result.isNew) {
        eventsCreated++;
      } else {
        eventsUpdated++;
      }
      
      if (result.status === 'COMPLETE') {
        complete++;
      } else {
        incomplete++;
      }
    } catch (error) {
      serverLogger.error(`[EventProcessor] Error processing article ${article.id}:`, error);
      skipped++;
    }
  }
  
  return { processed, eventsCreated, eventsUpdated, complete, incomplete, skipped };
}

/**
 * Get event statistics
 */
export async function getEventStats(): Promise<{
  total: number;
  complete: number;
  incomplete: number;
  draft: number;
  byRegulation: Record<string, number>;
  byEventType: Record<string, number>;
}> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  const events = await db.select().from(regulatoryEvents);
  
  const stats = {
    total: events.length,
    complete: 0,
    incomplete: 0,
    draft: 0,
    byRegulation: {} as Record<string, number>,
    byEventType: {} as Record<string, number>
  };
  
  for (const event of events) {
    // Count by status
    if (event.status === 'COMPLETE') stats.complete++;
    else if (event.status === 'INCOMPLETE') stats.incomplete++;
    else stats.draft++;
    
    // Count by regulation
    const reg = event.primaryRegulation;
    stats.byRegulation[reg] = (stats.byRegulation[reg] || 0) + 1;
    
    // Count by event type
    const type = event.eventType;
    stats.byEventType[type] = (stats.byEventType[type] || 0) + 1;
  }
  
  return stats;
}
