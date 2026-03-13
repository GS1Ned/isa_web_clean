/**
 * RAG Failure Taxonomy
 * 
 * Standardized codes for abstention reasons and error categories.
 * These codes enable systematic analysis of RAG pipeline failures.
 * 
 * @module failure-taxonomy
 */

// ============================================================================
// Abstention Reason Codes
// ============================================================================

/**
 * Standardized reasons why the RAG system may abstain from answering.
 * 
 * Abstention is a deliberate, policy-compliant decision to not answer,
 * distinct from errors which are unexpected failures.
 */
export const AbstentionReasonCode = {
  // Retrieval-related abstentions
  /** No relevant chunks found above similarity threshold */
  NO_RELEVANT_EVIDENCE: 'NO_RELEVANT_EVIDENCE',
  /** Evidence found but below confidence threshold */
  LOW_CONFIDENCE_EVIDENCE: 'LOW_CONFIDENCE_EVIDENCE',
  /** Evidence found but authority level too low for query type */
  INSUFFICIENT_AUTHORITY: 'INSUFFICIENT_AUTHORITY',
  
  // Query-related abstentions
  /** Query is outside the knowledge domain (not about standards/regulations) */
  OUT_OF_SCOPE: 'OUT_OF_SCOPE',
  /** Query is ambiguous and requires clarification */
  AMBIGUOUS_QUERY: 'AMBIGUOUS_QUERY',
  /** Query contains harmful or inappropriate content */
  HARMFUL_QUERY: 'HARMFUL_QUERY',
  /** Query requests personal opinions or speculation */
  OPINION_REQUEST: 'OPINION_REQUEST',
  
  // Conflict-related abstentions
  /** Multiple authoritative sources provide conflicting information */
  CONFLICTING_SOURCES: 'CONFLICTING_SOURCES',
  /** Source information is outdated or superseded */
  OUTDATED_EVIDENCE: 'OUTDATED_EVIDENCE',
  
  // Policy-related abstentions
  /** Answer would require speculation beyond evidence */
  SPECULATION_REQUIRED: 'SPECULATION_REQUIRED',
  /** Query requires real-time data not available in corpus */
  REALTIME_DATA_REQUIRED: 'REALTIME_DATA_REQUIRED',
} as const;

export type AbstentionReasonCode = typeof AbstentionReasonCode[keyof typeof AbstentionReasonCode];

/**
 * Human-readable descriptions for abstention codes
 */
export const AbstentionReasonDescription: Record<AbstentionReasonCode, string> = {
  NO_RELEVANT_EVIDENCE: 'No relevant information found in the knowledge base',
  LOW_CONFIDENCE_EVIDENCE: 'Found information but confidence is too low to provide a reliable answer',
  INSUFFICIENT_AUTHORITY: 'Available sources do not have sufficient authority for this query type',
  OUT_OF_SCOPE: 'Question is outside the scope of EU regulations and GS1 standards',
  AMBIGUOUS_QUERY: 'Question is ambiguous and requires clarification',
  HARMFUL_QUERY: 'Cannot respond to this type of request',
  OPINION_REQUEST: 'Cannot provide personal opinions or speculation',
  CONFLICTING_SOURCES: 'Authoritative sources provide conflicting information',
  OUTDATED_EVIDENCE: 'Available information may be outdated',
  SPECULATION_REQUIRED: 'Answering would require speculation beyond available evidence',
  REALTIME_DATA_REQUIRED: 'Question requires real-time data not available in the knowledge base',
};

// ============================================================================
// Error Category Codes
// ============================================================================

/**
 * Standardized categories for unexpected errors in the RAG pipeline.
 * 
 * Errors are unexpected failures, distinct from abstentions which are
 * deliberate policy-compliant decisions.
 */
export const ErrorCategoryCode = {
  // Infrastructure errors
  /** Database connection or query failure */
  DATABASE_ERROR: 'DATABASE_ERROR',
  /** LLM API call failure */
  LLM_API_ERROR: 'LLM_API_ERROR',
  /** Embedding generation failure */
  EMBEDDING_ERROR: 'EMBEDDING_ERROR',
  /** Network or connectivity issue */
  NETWORK_ERROR: 'NETWORK_ERROR',
  
  // Processing errors
  /** Failed to parse LLM response */
  RESPONSE_PARSE_ERROR: 'RESPONSE_PARSE_ERROR',
  /** Failed to validate response format */
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  /** Timeout during processing */
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  
  // Resource errors
  /** Rate limit exceeded */
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
  /** Insufficient resources (memory, tokens) */
  RESOURCE_EXHAUSTED: 'RESOURCE_EXHAUSTED',
  
  // Unknown
  /** Unclassified error */
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

export type ErrorCategoryCode = typeof ErrorCategoryCode[keyof typeof ErrorCategoryCode];

/**
 * Human-readable descriptions for error codes
 */
export const ErrorCategoryDescription: Record<ErrorCategoryCode, string> = {
  DATABASE_ERROR: 'Database connection or query failed',
  LLM_API_ERROR: 'Language model API call failed',
  EMBEDDING_ERROR: 'Failed to generate embeddings',
  NETWORK_ERROR: 'Network connectivity issue',
  RESPONSE_PARSE_ERROR: 'Failed to parse model response',
  VALIDATION_ERROR: 'Response validation failed',
  TIMEOUT_ERROR: 'Operation timed out',
  RATE_LIMIT_ERROR: 'API rate limit exceeded',
  RESOURCE_EXHAUSTED: 'Insufficient resources',
  UNKNOWN_ERROR: 'An unexpected error occurred',
};

// ============================================================================
// Verification Status Codes
// ============================================================================

/**
 * Standardized verification status for RAG responses
 */
export const VerificationStatusCode = {
  /** All claims verified against sources */
  FULLY_VERIFIED: 'FULLY_VERIFIED',
  /** Most claims verified (>80%) */
  MOSTLY_VERIFIED: 'MOSTLY_VERIFIED',
  /** Some claims verified (50-80%) */
  PARTIALLY_VERIFIED: 'PARTIALLY_VERIFIED',
  /** Few claims verified (<50%) */
  WEAKLY_VERIFIED: 'WEAKLY_VERIFIED',
  /** No claims could be verified */
  UNVERIFIED: 'UNVERIFIED',
  /** Verification not performed (e.g., cache hit) */
  NOT_CHECKED: 'NOT_CHECKED',
} as const;

export type VerificationStatusCode = typeof VerificationStatusCode[keyof typeof VerificationStatusCode];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Classify an error into a standardized category
 */
export function classifyError(error: Error): ErrorCategoryCode {
  const message = error.message.toLowerCase();
  const name = error.name.toLowerCase();
  
  if (message.includes('database') || message.includes('mysql') || message.includes('connection')) {
    return ErrorCategoryCode.DATABASE_ERROR;
  }
  if (message.includes('openai') || message.includes('llm') || message.includes('api')) {
    return ErrorCategoryCode.LLM_API_ERROR;
  }
  if (message.includes('embedding')) {
    return ErrorCategoryCode.EMBEDDING_ERROR;
  }
  if (message.includes('network') || message.includes('fetch') || message.includes('econnrefused')) {
    return ErrorCategoryCode.NETWORK_ERROR;
  }
  if (message.includes('parse') || message.includes('json')) {
    return ErrorCategoryCode.RESPONSE_PARSE_ERROR;
  }
  if (message.includes('valid')) {
    return ErrorCategoryCode.VALIDATION_ERROR;
  }
  if (message.includes('timeout') || name.includes('timeout')) {
    return ErrorCategoryCode.TIMEOUT_ERROR;
  }
  if (message.includes('rate') || message.includes('429')) {
    return ErrorCategoryCode.RATE_LIMIT_ERROR;
  }
  if (message.includes('memory') || message.includes('token')) {
    return ErrorCategoryCode.RESOURCE_EXHAUSTED;
  }
  
  return ErrorCategoryCode.UNKNOWN_ERROR;
}

/**
 * Determine verification status from verification rate
 */
export function getVerificationStatus(verificationRate: number): VerificationStatusCode {
  if (verificationRate >= 1.0) return VerificationStatusCode.FULLY_VERIFIED;
  if (verificationRate >= 0.8) return VerificationStatusCode.MOSTLY_VERIFIED;
  if (verificationRate >= 0.5) return VerificationStatusCode.PARTIALLY_VERIFIED;
  if (verificationRate > 0) return VerificationStatusCode.WEAKLY_VERIFIED;
  return VerificationStatusCode.UNVERIFIED;
}
