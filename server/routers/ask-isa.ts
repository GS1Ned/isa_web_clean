/**
 * Ask ISA Router
 * 
 * RAG-powered Q&A system using LLM-based semantic matching.
 * No vector embeddings required - uses LLM for relevance scoring.
 */

import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import {
  createQAConversation,
  addQAMessage,
  getQAConversation,
  getUserQAConversations,
  deleteQAConversation,
} from '../db-knowledge';
import {
  storeKnowledgeChunk,
  searchKnowledgeChunks,
  getKnowledgeStats,
} from '../db-knowledge';
import {
  prepareContentForEmbedding,
  generateEmbeddingTitle,
  generateEmbeddingUrl,
} from '../embedding';
import { invokeLLM } from '../_core/llm';

export const askISARouter = router({
  /**
   * Ask a question and get AI-generated answer with sources
   */
  ask: publicProcedure
    .input(
      z.object({
        question: z.string().min(3).max(1000),
        conversationId: z.number().optional(),
        userId: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { question, conversationId, userId } = input;

      try {
        // Step 1: Search for relevant knowledge chunks using LLM scoring
        const relevantChunks = await searchKnowledgeChunks(question, 5);

        if (relevantChunks.length === 0) {
          return {
            answer: "I couldn't find any relevant information in the knowledge base to answer your question. Please try rephrasing or ask about EU regulations (CSRD, EUDR, DPP) or GS1 standards.",
            sources: [],
            conversationId: conversationId || null,
          };
        }

        // Step 2: Build context from retrieved chunks
        const context = relevantChunks
          .map(
            (chunk, idx) =>
              `[Source ${idx + 1}: ${chunk.title}]\n${chunk.content}\n`
          )
          .join('\n---\n\n');

        // Step 3: Generate AI answer using LLM
        const systemPrompt = `You are ISA (Intelligent Standards Architect), an AI assistant specialized in EU sustainability regulations and GS1 standards.

Your knowledge base includes:
- EU regulations: CSRD, EUDR, Digital Product Passport (DPP), ESRS
- GS1 standards: GTIN, GLN, Digital Link, EPCIS
- ESRS datapoints from EFRAG
- Dutch compliance initiatives

Guidelines:
1. Answer based ONLY on the provided context
2. Cite sources using [Source N] notation
3. Be specific and technical when discussing regulations or standards
4. If the context doesn't contain the answer, say so clearly
5. Use bullet points for lists and structured information
6. Include relevant article numbers, CELEX IDs, or standard codes when available

Context:
${context}`;

        const response = await invokeLLM({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: question },
          ],
        });

        const answerContent = response.choices[0]?.message?.content;
        const answer = typeof answerContent === 'string' 
          ? answerContent 
          : 'Sorry, I could not generate an answer.';

        // Step 4: Store conversation if needed
        let finalConversationId: number | undefined = conversationId;

        if (!finalConversationId) {
          // Create new conversation
          const conversation = await createQAConversation(
            userId,
            question.slice(0, 100) // Use first 100 chars as title
          );
          finalConversationId = conversation?.id || undefined;
        }

        // Step 5: Store messages
        if (finalConversationId) {
          await addQAMessage({
            conversationId: finalConversationId,
            role: 'user',
            content: question,
          });

          await addQAMessage({
            conversationId: finalConversationId,
            role: 'assistant',
            content: answer,
            sources: relevantChunks.map(chunk => ({
              id: chunk.id,
              type: chunk.sourceType,
              title: chunk.title,
              url: chunk.url,
              similarity: chunk.similarity,
            })),
            retrievedChunks: relevantChunks.length,
          });
        }

        return {
          answer,
          sources: relevantChunks.map(chunk => ({
            id: chunk.id,
            type: chunk.sourceType,
            title: chunk.title,
            url: chunk.url,
            similarity: Math.round(chunk.similarity * 100),
          })),
          conversationId: finalConversationId,
        };
      } catch (error) {
        console.error('[AskISA] Failed to answer question:', error);
        throw new Error('Failed to generate answer. Please try again.');
      }
    }),

  /**
   * Get conversation history
   */
  getConversation: publicProcedure
    .input(z.object({ conversationId: z.number() }))
    .query(async ({ input }) => {
      const conversation = await getQAConversation(input.conversationId);
      
      if (!conversation) {
        throw new Error('Conversation not found');
      }

      return conversation;
    }),

  /**
   * Get user's conversations
   */
  getMyConversations: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(50).default(20) }))
    .query(async ({ ctx, input }) => {
      return await getUserQAConversations(ctx.user.id, input.limit);
    }),

  /**
   * Delete conversation
   */
  deleteConversation: protectedProcedure
    .input(z.object({ conversationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const success = await deleteQAConversation(input.conversationId, ctx.user.id);
      
      if (!success) {
        throw new Error('Failed to delete conversation or not authorized');
      }

      return { success: true };
    }),

  /**
   * Admin: Generate knowledge chunks for existing content
   */
  generateEmbeddings: protectedProcedure
    .input(
      z.object({
        sourceType: z.enum(['regulation', 'standard', 'esrs_datapoint', 'dutch_initiative']),
        sourceIds: z.array(z.number()).optional(), // If empty, process all
      })
    )
    .mutation(async ({ input }) => {
      const { sourceType, sourceIds } = input;

      try {
        let sources: any[] = [];

        // Fetch sources based on type
        if (sourceType === 'regulation') {
          const { getRegulations } = await import('../db');
          sources = await getRegulations();
        } else if (sourceType === 'standard') {
          const { getGS1Standards } = await import('../db');
          sources = await getGS1Standards();
        } else if (sourceType === 'esrs_datapoint') {
          // ESRS datapoints - fetch from database directly
          const { getDb } = await import('../db');
          const db = await getDb();
          if (db) {
            const { esrsDatapoints } = await import('../../drizzle/schema');
            sources = await db.select().from(esrsDatapoints).limit(10000);
          }
        } else if (sourceType === 'dutch_initiative') {
          const { getDutchInitiatives } = await import('../db');
          sources = await getDutchInitiatives();
        }

        // Filter by IDs if provided
        if (sourceIds && sourceIds.length > 0) {
          sources = sources.filter(s => sourceIds.includes(s.id));
        }

        let successCount = 0;
        let errorCount = 0;

        // Process each source
        for (const source of sources) {
          try {
            const content = prepareContentForEmbedding(sourceType, source);
            const title = generateEmbeddingTitle(sourceType, source);
            const url = generateEmbeddingUrl(sourceType, source.id);

            await storeKnowledgeChunk({
              sourceType,
              sourceId: source.id,
              content,
              title,
              url,
            });

            successCount++;
          } catch (error) {
            console.error(`[AskISA] Failed to store knowledge chunk for ${sourceType} ${source.id}:`, error);
            errorCount++;
          }
        }

        return {
          success: true,
          processed: sources.length,
          successCount,
          errorCount,
        };
      } catch (error) {
        console.error('[AskISA] Failed to generate knowledge chunks:', error);
        throw new Error('Failed to generate knowledge chunks');
      }
    }),

  /**
   * Get knowledge base statistics
   */
  getEmbeddingStats: publicProcedure.query(async () => {
    try {
      return await getKnowledgeStats();
    } catch (error) {
      console.error('[AskISA] Failed to get knowledge stats:', error);
      return [];
    }
  }),
});
