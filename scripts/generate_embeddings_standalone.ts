import { OpenAI } from 'openai';
import mysql from 'mysql2/promise';
import { format as utilFormat } from "node:util";
const cliOut = (...args) => process.stdout.write(`${utilFormat(...args)}\n`);
const cliErr = (...args) => process.stderr.write(`${utilFormat(...args)}\n`);

const DATABASE_URL = process.env.DATABASE_URL;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!DATABASE_URL) {
  cliErr("❌ DATABASE_URL not found in environment");
  process.exit(1);
}

if (!OPENAI_API_KEY) {
  cliErr("❌ OPENAI_API_KEY not found in environment");
  process.exit(1);
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

async function generateEmbeddings() {
  cliOut("🔌 Connecting to database...");
  const connection = await mysql.createConnection(DATABASE_URL);
  
  try {
    // Get all regulations without embeddings
    cliOut("📊 Fetching regulations...");
    const [regulations] = await connection.execute(
      "SELECT id, title, description FROM regulations WHERE embedding IS NULL LIMIT 50"
    );
    
    cliOut(`✅ Found ${(regulations as any[]).length} regulations to process`);
    
    for (const reg of regulations as any[]) {
      const text = `${reg.title}\n\n${reg.description || ''}`.trim();
      
      cliOut(`🔄 Processing: ${reg.title.substring(0, 50)}...`);
      
      try {
        const response = await openai.embeddings.create({
          model: "text-embedding-3-small",
          input: text,
        });
        
        const embedding = JSON.stringify(response.data[0].embedding);
        
        await connection.execute(
          "UPDATE regulations SET embedding = ? WHERE id = ?",
          [embedding, reg.id]
        );
        
        cliOut(`  ✅ Embedded regulation ${reg.id}`);
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        cliErr(`  ❌ Failed to embed regulation ${reg.id}:`, error);
      }
    }
    
    // Get count of embedded regulations
    const [result] = await connection.execute(
      "SELECT COUNT(*) as count FROM regulations WHERE embedding IS NOT NULL"
    );
    
    cliOut(`\n✅ Total regulations with embeddings: ${(result as any[])[0].count}`);
    
  } finally {
    await connection.end();
  }
}

generateEmbeddings().catch((err) => cliErr(err));
