/**
 * Ingestion Modular Prompt System
 * Version: 2.0
 * Last Updated: December 17, 2025
 */

import { INGESTION_SYSTEM_PROMPT } from './system';

export interface IngestionContextParams {
  sourceFile: string;
  sourceType: 'gdsn' | 'esrs' | 'cbv' | 'dpp' | 'digital_link';
  targetSchema: string;
  constraints: string[];
  sampleRecords?: any[];
}

export function buildIngestionContext(params: IngestionContextParams): string {
  let context = `**Ingestion Task:**\n\n`;
  context += `Source File: ${params.sourceFile}\n`;
  context += `Source Type: ${params.sourceType}\n`;
  context += `Target Schema: ${params.targetSchema}\n\n`;
  
  if (params.constraints.length > 0) {
    context += `**Constraints:**\n`;
    params.constraints.forEach(c => {
      context += `- ${c}\n`;
    });
    context += `\n`;
  }
  
  if (params.sampleRecords && params.sampleRecords.length > 0) {
    context += `**Sample Records (for reference):**\n\`\`\`json\n`;
    context += JSON.stringify(params.sampleRecords.slice(0, 3), null, 2);
    context += `\n\`\`\`\n\n`;
  }
  
  return context;
}

export const INGESTION_STEP_POLICY = `**Process:**

1. **ANALYZE** - Understand source file structure
   - Identify file format (Excel, XML, JSON, CSV)
   - Map source columns/fields to target schema
   - Identify data types and validation rules

2. **PLAN** - Design extraction strategy
   - Determine extraction order (sequential, batch, parallel)
   - Identify dependencies (foreign keys, references)
   - Plan error handling approach

3. **ACT** - Extract records one at a time
   - Read one row/record
   - Transform to target schema
   - Validate against schema
   - Log errors if validation fails

4. **OBSERVE** - Track progress and errors
   - Count: total records, successful, failed
   - Log: error details (row, field, value, message)
   - Monitor: schema violations, duplicate IDs

5. **EVALUATE** - Assess quality
   - Check: All records conform to schema
   - Check: No duplicate IDs
   - Check: All foreign keys valid
   - Check: Error log is actionable`;

export const INGESTION_VERIFICATION = `**Before Finalizing:**

✓ **Data Quality**
  - [ ] All records conform to target schema
  - [ ] No duplicate primary keys
  - [ ] All foreign key references are valid
  - [ ] No hallucinated identifiers

✓ **Error Handling**
  - [ ] All errors logged with row number, field name, attempted value
  - [ ] Error messages are actionable (explain what went wrong and how to fix)
  - [ ] Failed records do not block successful records

✓ **Output Format**
  - [ ] JSON output uses deterministic key ordering (sorted keys)
  - [ ] Summary includes: total, success, failed counts
  - [ ] Errors array includes all validation failures`;

export function assembleIngestionPrompt(params: IngestionContextParams): string {
  let prompt = `${INGESTION_SYSTEM_PROMPT}\n\n---\n\n`;
  prompt += buildIngestionContext(params);
  prompt += `\n---\n\n${INGESTION_STEP_POLICY}\n\n---\n\n${INGESTION_VERIFICATION}`;
  return prompt;
}

export { INGESTION_SYSTEM_PROMPT };
