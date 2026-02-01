/**
 * Standalone Embedding Generation Script
 * 
 * This script generates embeddings without loading the full server environment.
 * It directly connects to the database and uses the OpenAI API.
 * 
 * Usage: DATABASE_URL=... OPENAI_API_KEY=... pnpm exec tsx scripts/standalone-embedding-gen.ts
 */

import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { eq, sql, isNull } from "drizzle-orm";
import OpenAI from "openai";
import crypto from "crypto";

// Validate required environment variables
const DATABASE_URL = process.env.DATABASE_URL;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL environment variable is required");
  process.exit(1);
}

if (!OPENAI_API_KEY) {
  console.error("❌ OPENAI_API_KEY environment variable is required");
  process.exit(1);
}

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// Database connection
async function getDatabase() {
  const connection = await mysql.createConnection(DATABASE_URL!);
  return drizzle(connection);
}

// Generate embedding using OpenAI
async function generateEmbedding(text: string): Promise<{ embedding: number[]; tokens: number }> {
  const cleanText = text.replace(/\s+/g, " ").trim().slice(0, 8000);
  
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: cleanText,
  });
  
  return {
    embedding: response.data[0].embedding,
    tokens: response.usage.total_tokens,
  };
}

// Generate content hash for deduplication
function hashContent(text: string): string {
  return crypto.createHash("sha256").update(text).digest("hex");
}

interface Stats {
  regulationsProcessed: number;
  regulationsSkipped: number;
  regulationsErrors: number;
  standardsProcessed: number;
  standardsSkipped: number;
  standardsErrors: number;
  knowledgeEmbeddingsCreated: number;
  knowledgeEmbeddingsUpdated: number;
  totalTokens: number;
}

async function main() {
  console.log("=".repeat(60));
  console.log("ISA Standalone Embedding Generation");
  console.log("=".repeat(60));
  console.log();

  const stats: Stats = {
    regulationsProcessed: 0,
    regulationsSkipped: 0,
    regulationsErrors: 0,
    standardsProcessed: 0,
    standardsSkipped: 0,
    standardsErrors: 0,
    knowledgeEmbeddingsCreated: 0,
    knowledgeEmbeddingsUpdated: 0,
    totalTokens: 0,
  };

  const startTime = Date.now();

  try {
    console.log("Connecting to database...");
    const db = await getDatabase();
    console.log("✅ Database connected");

    // Get counts
    const [regulationCount] = await db.execute(sql`SELECT COUNT(*) as count FROM regulations`);
    const [standardCount] = await db.execute(sql`SELECT COUNT(*) as count FROM gs1_standards`);
    const [keCount] = await db.execute(sql`SELECT COUNT(*) as count FROM knowledge_embeddings`);
    
    console.log();
    console.log("Current database state:");
    console.log(`  - Regulations: ${(regulationCount as any)[0]?.count || 0}`);
    console.log(`  - GS1 Standards: ${(standardCount as any)[0]?.count || 0}`);
    console.log(`  - Knowledge Embeddings: ${(keCount as any)[0]?.count || 0}`);
    console.log();

    // Check for NULL embeddings
    const [nullRegulations] = await db.execute(sql`SELECT COUNT(*) as count FROM regulations WHERE embedding IS NULL`);
    const [nullStandards] = await db.execute(sql`SELECT COUNT(*) as count FROM gs1_standards WHERE embedding IS NULL`);
    
    console.log("Records without embeddings:");
    console.log(`  - Regulations: ${(nullRegulations as any)[0]?.count || 0}`);
    console.log(`  - GS1 Standards: ${(nullStandards as any)[0]?.count || 0}`);
    console.log();

    // Process regulations without embeddings
    console.log("Processing regulations...");
    const [regulations] = await db.execute(sql`
      SELECT id, celex_id, title, description, source_url 
      FROM regulations 
      WHERE embedding IS NULL
      LIMIT 100
    `);

    for (const reg of regulations as any[]) {
      try {
        const text = `${reg.title || ""} ${reg.description || ""}`.trim();
        if (!text) {
          stats.regulationsSkipped++;
          continue;
        }

        console.log(`  🔄 Processing regulation ${reg.celex_id}...`);
        const { embedding, tokens } = await generateEmbedding(text);
        stats.totalTokens += tokens;

        // Update regulations table
        await db.execute(sql`
          UPDATE regulations 
          SET embedding = ${JSON.stringify(embedding)}
          WHERE id = ${reg.id}
        `);

        // Upsert to knowledge_embeddings
        const contentHash = hashContent(text);
        const [existing] = await db.execute(sql`
          SELECT id FROM knowledge_embeddings 
          WHERE source_type = 'regulation' AND source_id = ${reg.id}
        `);

        if ((existing as any[]).length > 0) {
          await db.execute(sql`
            UPDATE knowledge_embeddings 
            SET content = ${text}, content_hash = ${contentHash}, 
                embedding = ${JSON.stringify(embedding)}, title = ${reg.title || `Regulation ${reg.id}`},
                url = ${reg.source_url || null}, embedding_model = 'text-embedding-3-small',
                is_deprecated = 0
            WHERE source_type = 'regulation' AND source_id = ${reg.id}
          `);
          stats.knowledgeEmbeddingsUpdated++;
        } else {
          await db.execute(sql`
            INSERT INTO knowledge_embeddings 
            (source_type, source_id, content, content_hash, embedding, embedding_model, title, url, is_deprecated)
            VALUES ('regulation', ${reg.id}, ${text}, ${contentHash}, ${JSON.stringify(embedding)}, 
                    'text-embedding-3-small', ${reg.title || `Regulation ${reg.id}`}, ${reg.source_url || null}, 0)
          `);
          stats.knowledgeEmbeddingsCreated++;
        }

        stats.regulationsProcessed++;
        console.log(`  ✅ Processed ${reg.celex_id} (${tokens} tokens)`);
      } catch (error) {
        stats.regulationsErrors++;
        console.error(`  ❌ Error processing ${reg.celex_id}:`, error);
      }
    }

    // Process GS1 standards without embeddings
    console.log();
    console.log("Processing GS1 standards...");
    const [standards] = await db.execute(sql`
      SELECT id, standard_code, standard_name, description, scope, reference_url 
      FROM gs1_standards 
      WHERE embedding IS NULL
      LIMIT 100
    `);

    for (const std of standards as any[]) {
      try {
        const text = `${std.standard_name || ""} ${std.description || ""} ${std.scope || ""}`.trim();
        if (!text) {
          stats.standardsSkipped++;
          continue;
        }

        console.log(`  🔄 Processing standard ${std.standard_code}...`);
        const { embedding, tokens } = await generateEmbedding(text);
        stats.totalTokens += tokens;

        // Update gs1_standards table
        await db.execute(sql`
          UPDATE gs1_standards 
          SET embedding = ${JSON.stringify(embedding)}
          WHERE id = ${std.id}
        `);

        // Upsert to knowledge_embeddings
        const contentHash = hashContent(text);
        const [existing] = await db.execute(sql`
          SELECT id FROM knowledge_embeddings 
          WHERE source_type = 'standard' AND source_id = ${std.id}
        `);

        if ((existing as any[]).length > 0) {
          await db.execute(sql`
            UPDATE knowledge_embeddings 
            SET content = ${text}, content_hash = ${contentHash}, 
                embedding = ${JSON.stringify(embedding)}, title = ${std.standard_name || `Standard ${std.id}`},
                url = ${std.reference_url || null}, embedding_model = 'text-embedding-3-small',
                is_deprecated = 0
            WHERE source_type = 'standard' AND source_id = ${std.id}
          `);
          stats.knowledgeEmbeddingsUpdated++;
        } else {
          await db.execute(sql`
            INSERT INTO knowledge_embeddings 
            (source_type, source_id, content, content_hash, embedding, embedding_model, title, url, is_deprecated)
            VALUES ('standard', ${std.id}, ${text}, ${contentHash}, ${JSON.stringify(embedding)}, 
                    'text-embedding-3-small', ${std.standard_name || `Standard ${std.id}`}, ${std.reference_url || null}, 0)
          `);
          stats.knowledgeEmbeddingsCreated++;
        }

        stats.standardsProcessed++;
        console.log(`  ✅ Processed ${std.standard_code} (${tokens} tokens)`);
      } catch (error) {
        stats.standardsErrors++;
        console.error(`  ❌ Error processing ${std.standard_code}:`, error);
      }
    }

    // Summary
    const duration = Math.round((Date.now() - startTime) / 1000);
    const estimatedCost = (stats.totalTokens / 1_000_000) * 0.02;

    console.log();
    console.log("=".repeat(60));
    console.log("EMBEDDING GENERATION COMPLETE");
    console.log("=".repeat(60));
    console.log(`Duration: ${duration}s`);
    console.log();
    console.log("Regulations:");
    console.log(`  - Processed: ${stats.regulationsProcessed}`);
    console.log(`  - Skipped: ${stats.regulationsSkipped}`);
    console.log(`  - Errors: ${stats.regulationsErrors}`);
    console.log();
    console.log("GS1 Standards:");
    console.log(`  - Processed: ${stats.standardsProcessed}`);
    console.log(`  - Skipped: ${stats.standardsSkipped}`);
    console.log(`  - Errors: ${stats.standardsErrors}`);
    console.log();
    console.log("Knowledge Embeddings:");
    console.log(`  - Created: ${stats.knowledgeEmbeddingsCreated}`);
    console.log(`  - Updated: ${stats.knowledgeEmbeddingsUpdated}`);
    console.log();
    console.log("API Usage:");
    console.log(`  - Total tokens: ${stats.totalTokens.toLocaleString()}`);
    console.log(`  - Estimated cost: $${estimatedCost.toFixed(4)}`);
    console.log("=".repeat(60));

    const totalErrors = stats.regulationsErrors + stats.standardsErrors;
    process.exit(totalErrors > 0 ? 1 : 0);
  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  }
}

main();
