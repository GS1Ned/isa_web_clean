/**
 * Ask ISA Context Builder (Block 2 of 5)
 * Version: 2.0
 * Last Updated: December 17, 2025
 * 
 * Purpose: Build task-specific context from retrieved knowledge chunks
 */

export interface KnowledgeChunk {
  id: number;
  sourceType: 'regulation' | 'standard' | 'esrs_datapoint' | 'dutch_initiative' | 'esrs_gs1_mapping';
  title: string;
  content: string;
  url?: string;
  similarity: number; // 0-100 relevance score
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface AskISAContextParams {
  question: string;
  relevantChunks: KnowledgeChunk[];
  conversationHistory?: ConversationMessage[];
}

/**
 * Build context block for Ask ISA query
 * 
 * @param params - Question, retrieved chunks, and optional conversation history
 * @returns Formatted context string
 */
export function buildAskISAContext(params: AskISAContextParams): string {
  const { question, relevantChunks, conversationHistory } = params;

  let context = `**User Question:**\n${question}\n\n`;

  // Add retrieved knowledge chunks
  context += `**Relevant Knowledge (Retrieved from ISA Knowledge Base):**\n\n`;
  
  relevantChunks.forEach((chunk, index) => {
    const sourceNum = index + 1;
    context += `[Source ${sourceNum}] **${chunk.sourceType.toUpperCase()}**: ${chunk.title}\n`;
    context += `Relevance: ${chunk.similarity}%\n`;
    if (chunk.url) {
      context += `URL: ${chunk.url}\n`;
    }
    context += `\nContent:\n${chunk.content}\n\n`;
    context += `---\n\n`;
  });

  // Add conversation history if available
  if (conversationHistory && conversationHistory.length > 0) {
    context += `**Previous Conversation:**\n\n`;
    conversationHistory.forEach((msg) => {
      context += `${msg.role.toUpperCase()}: ${msg.content}\n\n`;
    });
  }

  return context;
}

/**
 * Build minimal context (for testing or low-token scenarios)
 */
export function buildMinimalContext(question: string, topChunk: KnowledgeChunk): string {
  return `Question: ${question}\n\nMost Relevant Source:\n${topChunk.content}`;
}
