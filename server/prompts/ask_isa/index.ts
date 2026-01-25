/**
 * Ask ISA Modular Prompt System
 * Version: 2.0
 * Last Updated: December 17, 2025
 * 
 * Purpose: Assemble 5-block modular prompts for Ask ISA RAG system
 * 
 * Architecture:
 * - Block 1 (System): Role definition and hard guardrails
 * - Block 2 (Context): Task brief, retrieved knowledge, conversation history
 * - Block 3 (Step Policy): Reasoning process and decision framework
 * - Block 4 (Output Contracts): JSON schemas for structured responses
 * - Block 5 (Verification): Post-conditions and self-checks
 * 
 * Benefits:
 * - Easier tuning (modify individual blocks without destabilizing others)
 * - Version control (track changes per block)
 * - A/B testing (compare different system prompts, step policies, etc.)
 * - KV-cache optimization (stable block structure improves cache hit rate)
 */

import { ASK_ISA_SYSTEM_PROMPT, ASK_ISA_SYSTEM_PROMPT_V1, ASK_ISA_SYSTEM_PROMPT_V2 } from './system';
import { buildAskISAContext, buildMinimalContext, type AskISAContextParams } from './context';
import { ASK_ISA_STEP_POLICY, ASK_ISA_STEP_POLICY_COMPACT } from './step_policy';
import { ASK_ISA_VERIFICATION_CHECKLIST, verifyAskISAResponse } from './verification';
import {
  AskISAResponseSchema,
  validateAskISAResponse,
  validateCitations,
  type AskISAResponse,
  type SourceCitation,
} from './output_contracts';

/**
 * Prompt variant configuration
 */
export interface PromptVariant {
  name: string;
  version: string;
  systemPrompt: string;
  stepPolicy: string;
  includeVerification: boolean;
}

/**
 * Available prompt variants for A/B testing
 */
export const PROMPT_VARIANTS: Record<string, PromptVariant> = {
  v1_legacy: {
    name: 'Legacy (v1.0)',
    version: '1.0',
    systemPrompt: ASK_ISA_SYSTEM_PROMPT_V1,
    stepPolicy: ASK_ISA_STEP_POLICY_COMPACT,
    includeVerification: false,
  },
  v2_modular: {
    name: 'Modular (v2.0)',
    version: '2.0',
    systemPrompt: ASK_ISA_SYSTEM_PROMPT_V2,
    stepPolicy: ASK_ISA_STEP_POLICY,
    includeVerification: true,
  },
  v2_compact: {
    name: 'Modular Compact (v2.0)',
    version: '2.0',
    systemPrompt: ASK_ISA_SYSTEM_PROMPT_V2,
    stepPolicy: ASK_ISA_STEP_POLICY_COMPACT,
    includeVerification: false,
  },
};

/**
 * Assemble full prompt from modular blocks
 * 
 * @param contextParams - Context parameters (question, chunks, history)
 * @param variant - Prompt variant to use (default: v2_modular)
 * @returns Assembled prompt string
 */
export function assembleAskISAPrompt(
  contextParams: AskISAContextParams,
  variant: keyof typeof PROMPT_VARIANTS = 'v2_modular'
): string {
  const config = PROMPT_VARIANTS[variant];
  
  let prompt = '';
  
  // Block 1: System
  prompt += `${config.systemPrompt}\n\n`;
  prompt += `---\n\n`;
  
  // Block 2: Context
  prompt += buildAskISAContext(contextParams);
  prompt += `\n---\n\n`;
  
  // Block 3: Step Policy
  prompt += `${config.stepPolicy}\n\n`;
  prompt += `---\n\n`;
  
  // Block 4: Output Contracts (implicit - schema validation happens post-generation)
  prompt += `**Output Format:**\n\n`;
  prompt += `Provide your answer as natural language text with [Source N] citations.\n\n`;
  
  // Block 5: Verification (optional)
  if (config.includeVerification) {
    prompt += `${ASK_ISA_VERIFICATION_CHECKLIST}\n\n`;
  }
  
  return prompt;
}

/**
 * Assemble minimal prompt (for testing or low-token scenarios)
 */
export function assembleMinimalPrompt(
  question: string,
  topChunk: any
): string {
  return `${ASK_ISA_SYSTEM_PROMPT_V2}\n\n${buildMinimalContext(question, topChunk)}`;
}

// Export all components for direct access
export {
  ASK_ISA_SYSTEM_PROMPT,
  ASK_ISA_SYSTEM_PROMPT_V1,
  ASK_ISA_SYSTEM_PROMPT_V2,
  buildAskISAContext,
  buildMinimalContext,
  ASK_ISA_STEP_POLICY,
  ASK_ISA_STEP_POLICY_COMPACT,
  ASK_ISA_VERIFICATION_CHECKLIST,
  verifyAskISAResponse,
  AskISAResponseSchema,
  validateAskISAResponse,
  validateCitations,
  type AskISAResponse,
  type SourceCitation,
  type AskISAContextParams,
};
