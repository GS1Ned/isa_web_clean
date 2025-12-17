/**
 * Ask ISA Output Contracts (Block 4 of 5)
 * Version: 2.0
 * Last Updated: December 17, 2025
 * 
 * Purpose: Define machine-checkable output schemas
 */

import { z } from 'zod';

/**
 * Source citation schema
 */
export const SourceCitationSchema = z.object({
  id: z.number().int().positive().describe('Source number (1-indexed)'),
  title: z.string().min(1).describe('Source title'),
  url: z.string().url().optional().describe('Source URL (if available)'),
  sourceType: z.enum(['regulation', 'standard', 'esrs_datapoint', 'dutch_initiative', 'esrs_gs1_mapping']),
  relevance: z.number().min(0).max(100).describe('Relevance score (0-100%)')
});

export type SourceCitation = z.infer<typeof SourceCitationSchema>;

/**
 * Ask ISA response schema
 */
export const AskISAResponseSchema = z.object({
  answer: z.string().min(10).describe('Natural language answer with [Source N] citations'),
  sources: z.array(SourceCitationSchema).min(1).max(10).describe('List of sources cited in answer'),
  confidence: z.number().min(0).max(1).describe('Confidence level (0-1) in answer accuracy'),
  questionType: z.enum(['definition', 'mapping', 'compliance', 'implementation', 'general']).optional(),
  suggestedFollowUps: z.array(z.string()).max(3).optional().describe('Suggested follow-up questions')
});

export type AskISAResponse = z.infer<typeof AskISAResponseSchema>;

/**
 * Validation error schema
 */
export const ValidationErrorSchema = z.object({
  field: z.string(),
  message: z.string(),
  value: z.any().optional()
});

export type ValidationError = z.infer<typeof ValidationErrorSchema>;

/**
 * Validate Ask ISA response
 * 
 * @param response - Response object to validate
 * @returns Validation result with errors (if any)
 */
export function validateAskISAResponse(response: any): {
  valid: boolean;
  errors: ValidationError[];
  data?: AskISAResponse;
} {
  try {
    const validated = AskISAResponseSchema.parse(response);
    return {
      valid: true,
      errors: [],
      data: validated
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.map((err: any) => ({
        field: err.path.join('.'),
        message: err.message,
        value: err.code
      }));
      return {
        valid: false,
        errors
      };
    }
    return {
      valid: false,
      errors: [{ field: 'unknown', message: 'Unknown validation error' }]
    };
  }
}

/**
 * Check if answer contains proper citations
 * 
 * @param answer - Answer text to check
 * @param sourceCount - Number of sources provided
 * @returns Validation result
 */
export function validateCitations(answer: string, sourceCount: number): {
  valid: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  
  // Extract citation numbers from answer (e.g., [Source 1], [Source 2])
  const citationRegex = /\[Source (\d+)\]/g;
  const citations = new Set<number>();
  let match;
  
  while ((match = citationRegex.exec(answer)) !== null) {
    const sourceNum = parseInt(match[1], 10);
    citations.add(sourceNum);
    
    // Check if citation number is valid
    if (sourceNum < 1 || sourceNum > sourceCount) {
      issues.push(`Invalid citation [Source ${sourceNum}] - only ${sourceCount} sources provided`);
    }
  }
  
  // Check if answer has at least one citation
  if (citations.size === 0) {
    issues.push('Answer contains no citations - all factual claims must be cited');
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
}
