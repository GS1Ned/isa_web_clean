/**
 * Ask ISA Router
 *
 * RAG-powered Q&A system using LLM-based semantic matching.
 * No vector embeddings required - uses LLM for relevance scoring.
 */

import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import {
  createQAConversation,
  addQAMessage,
  getQAConversation,
  getUserQAConversations,
  deleteQAConversation,
} from "../db-knowledge";
import {
  storeKnowledgeChunk,
  searchKnowledgeChunks,
  getKnowledgeStats,
} from "../db-knowledge";
import {
  prepareContentForEmbedding,
  generateEmbeddingTitle,
  generateEmbeddingUrl,
} from "../embedding";
import { invokeLLM } from "../_core/llm";
import {
  vectorSearchKnowledge,
  buildContextFromVectorResults,
} from "../db-knowledge-vector";
import {
  classifyQuery,
  generateRefusalMessage,
  validateCitations as validateCitationFormat,
  calculateConfidence,
} from "../ask-isa-guardrails";
import { validateCitations } from "../citation-validation";
import {
  assembleAskISAPrompt,
  validateAskISAResponse,
  verifyAskISAResponse,
  type AskISAContextParams,
} from "../prompts/ask_isa";
import {
  getAllProductionQueries,
  getQueriesByCategory,
  getQueriesBySector,
  searchProductionQueries,
} from "../ask-isa-query-library";

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
        // Step 0: Apply guardrails - classify query type
        const classification = classifyQuery(question);

        if (!classification.allowed) {
          const refusalMessage = generateRefusalMessage(classification);
          return {
            answer: refusalMessage,
            sources: [],
            conversationId: conversationId || null,
            queryType: classification.type,
            confidence: { level: "low" as const, score: 0 },
          };
        }
        // Step 1: Search for relevant content using vector similarity (FAST!)
        const relevantResults = await vectorSearchKnowledge(question, 5);

        if (relevantResults.length === 0) {
          return {
            answer:
              "I couldn't find any relevant information in the knowledge base to answer your question. Please try rephrasing or ask about EU regulations (CSRD, EUDR, DPP) or GS1 standards.",
            sources: [],
            conversationId: conversationId || null,
          };
        }

        // Step 2: Build modular prompt using v2.0 system
        const contextParams: AskISAContextParams = {
          question,
          relevantChunks: relevantResults.map(r => ({
            id: r.id,
            sourceType: r.type as any,
            title: r.title,
            content: r.description || r.title, // Use description as content
            url: r.url,
            similarity: Math.round(r.similarity * 100),
          })),
        };

        const fullPrompt = assembleAskISAPrompt(contextParams, 'v2_modular');

        // Step 3: Generate AI answer using LLM with modular prompt

        const response = await invokeLLM({
          messages: [
            { role: "user", content: fullPrompt },
          ],
        });

        const answerContent = response.choices[0]?.message?.content;
        const answer =
          typeof answerContent === "string"
            ? answerContent
            : "Sorry, I could not generate an answer.";

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
            role: "user",
            content: question,
          });

          await addQAMessage({
            conversationId: finalConversationId,
            role: "assistant",
            content: answer,
            sources: relevantResults.map(result => ({
              id: result.id,
              type: result.type,
              title: result.title,
              url: result.url,
              similarity: result.similarity,
            })),
            retrievedChunks: relevantResults.length,
          });
        }

        // Step 6: Validate citations and calculate confidence
        const citationValidation = validateCitationFormat(answer);
        const confidence = calculateConfidence(relevantResults.length);

        // Step 6.5: Validate citation provenance and deprecation status
        const validatedSources = await validateCitations(
          relevantResults.map(r => ({
            id: r.id,
            title: r.title,
            url: r.url,
            similarity: r.similarity,
          }))
        );

        // Step 7: Programmatic verification (v2.0 modular prompt system)
        const verification = verifyAskISAResponse(
          answer,
          relevantResults,
          confidence.score
        );

        if (!verification.passed) {
          console.warn('[AskISA] Verification failed:', verification.issues);
        }
        if (verification.warnings.length > 0) {
          console.warn('[AskISA] Verification warnings:', verification.warnings);
        }

        return {
          answer,
          sources: validatedSources.map(source => ({
            id: source.id,
            title: source.title,
            url: source.url,
            similarity: Math.round(source.similarity * 100),
            datasetId: source.datasetId,
            datasetVersion: source.datasetVersion,
            lastVerifiedDate: source.lastVerifiedDate,
            isDeprecated: source.isDeprecated,
            needsVerification: source.needsVerification,
            deprecationReason: source.deprecationReason,
          })),
          conversationId: finalConversationId,
          queryType: classification.type,
          confidence,
          citationValid: citationValidation.valid,
          missingCitations: citationValidation.missingElements,
        };
      } catch (error) {
        console.error("[AskISA] Failed to answer question:", error);
        throw new Error("Failed to generate answer. Please try again.");
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
        throw new Error("Conversation not found");
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
      const success = await deleteQAConversation(
        input.conversationId,
        ctx.user.id
      );

      if (!success) {
        throw new Error("Failed to delete conversation or not authorized");
      }

      return { success: true };
    }),

  /**
   * Admin: Generate knowledge chunks for existing content
   */
  generateEmbeddings: protectedProcedure
    .input(
      z.object({
        sourceType: z.enum([
          "regulation",
          "standard",
          "esrs_datapoint",
          "dutch_initiative",
          "esrs_gs1_mapping",
        ]),
        sourceIds: z.array(z.number()).optional(), // If empty, process all
      })
    )
    .mutation(async ({ input }) => {
      const { sourceType, sourceIds } = input;

      try {
        let sources: any[] = [];

        // Fetch sources based on type
        if (sourceType === "regulation") {
          const { getRegulations } = await import("../db");
          sources = await getRegulations();
        } else if (sourceType === "standard") {
          const { getGS1Standards } = await import("../db");
          sources = await getGS1Standards();
        } else if (sourceType === "esrs_datapoint") {
          // ESRS datapoints - fetch from database directly
          const { getDb } = await import("../db");
          const db = await getDb();
          if (db) {
            const { esrsDatapoints } = await import("../../drizzle/schema");
            sources = await db.select().from(esrsDatapoints).limit(10000);
          }
        } else if (sourceType === "dutch_initiative") {
          const { getDutchInitiatives } = await import("../db");
          sources = await getDutchInitiatives();
        } else if (sourceType === "esrs_gs1_mapping") {
          // ESRS-GS1 mappings - fetch from database directly
          const { getAllEsrsGs1Mappings } = await import("../db-esrs-gs1-mapping");
          const mappings = await getAllEsrsGs1Mappings();
          sources = Array.isArray(mappings) ? mappings : [];
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
            const content = prepareContentForEmbedding(sourceType as any, source);
            const title = generateEmbeddingTitle(sourceType as any, source);
            const url = generateEmbeddingUrl(sourceType as any, source.id || source.mapping_id);

            await storeKnowledgeChunk({
              sourceType,
              sourceId: source.id,
              content,
              title,
              url,
            });

            successCount++;
          } catch (error) {
            console.error(
              `[AskISA] Failed to store knowledge chunk for ${sourceType} ${source.id}:`,
              error
            );
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
        console.error("[AskISA] Failed to generate knowledge chunks:", error);
        throw new Error("Failed to generate knowledge chunks");
      }
    }),

  /**
   * Get knowledge base statistics
   */
  getEmbeddingStats: publicProcedure.query(async () => {
    try {
      return await getKnowledgeStats();
    } catch (error) {
      console.error("[AskISA] Failed to get knowledge stats:", error);
      return [];
    }
  }),

  /**
   * Get all production queries for autocomplete
   */
  getProductionQueries: publicProcedure.query(async () => {
    return getAllProductionQueries();
  }),

  /**
   * Get production queries by category
   */
  getQueriesByCategory: publicProcedure
    .input(
      z.object({
        category: z.enum([
          "gap",
          "mapping",
          "version_comparison",
          "dataset_provenance",
          "recommendation",
          "coverage",
        ]),
      })
    )
    .query(async ({ input }) => {
      return getQueriesByCategory(input.category);
    }),

  /**
   * Get production queries by sector
   */
  getQueriesBySector: publicProcedure
    .input(
      z.object({
        sector: z.enum(["DIY", "FMCG", "Healthcare", "All"]),
      })
    )
    .query(async ({ input }) => {
      return getQueriesBySector(input.sector);
    }),

  /**
   * Search production queries
   */
  searchQueries: publicProcedure
    .input(
      z.object({
        searchTerm: z.string().min(1),
      })
    )
    .query(async ({ input }) => {
      return searchProductionQueries(input.searchTerm);
    }),

  /**
   * Submit user feedback for Ask ISA response
   */
  submitFeedback: protectedProcedure
    .input(
      z.object({
        questionId: z.string(),
        questionText: z.string(),
        answerText: z.string(),
        feedbackType: z.enum(["positive", "negative"]),
        feedbackComment: z.string().optional(),
        promptVariant: z.string().optional(),
        confidenceScore: z.number().optional(),
        sourcesCount: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { getDb } = await import("../db");
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { askIsaFeedback } = await import("../../drizzle/schema");

      try {
        await db.insert(askIsaFeedback).values({
          questionId: input.questionId,
          userId: ctx.user.id,
          questionText: input.questionText,
          answerText: input.answerText,
          feedbackType: input.feedbackType,
          feedbackComment: input.feedbackComment,
          promptVariant: input.promptVariant || "v2_modular",
          confidenceScore: input.confidenceScore
            ? input.confidenceScore.toString()
            : null,
          sourcesCount: input.sourcesCount || null,
        });

        return { success: true };
      } catch (error) {
        console.error("[AskISA] Failed to submit feedback:", error);
        throw new Error("Failed to submit feedback");
      }
    }),
});
