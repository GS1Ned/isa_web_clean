import { OpenAI } from 'openai';
import mysql from 'mysql2/promise';

const DATABASE_URL = "mysql://dtVAxSKn7P5nF6W.root:qyjk6KJU2cT8Yjkb@gateway01.eu-central-1.prod.aws.tidbcloud.com:4000/isa_db?ssl-mode=REQUIRED";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error("❌ OPENAI_API_KEY not found in environment");
  process.exit(1);
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

async function generateEmbeddings() {
  console.log("🔌 Connecting to database...");
  const connection = await mysql.createConnection(DATABASE_URL);
  
  try {
    // Get all regulations without embeddings
    console.log("📊 Fetching regulations...");
    const [regulations] = await connection.execute(
      "SELECT id, title, description FROM regulations WHERE embedding IS NULL LIMIT 50"
    );
    
    console.log(`✅ Found ${(regulations as any[]).length} regulations to process`);
    
    for (const reg of regulations as any[]) {
      const text = `${reg.title}\n\n${reg.description || ''}`.trim();
      
      console.log(`🔄 Processing: ${reg.title.substring(0, 50)}...`);
      
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
        
        console.log(`  ✅ Embedded regulation ${reg.id}`);
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`  ❌ Failed to embed regulation ${reg.id}:`, error);
      }
    }
    
    // Get count of embedded regulations
    const [result] = await connection.execute(
      "SELECT COUNT(*) as count FROM regulations WHERE embedding IS NOT NULL"
    );
    
    console.log(`\n✅ Total regulations with embeddings: ${(result as any[])[0].count}`);
    
  } finally {
    await connection.end();
  }
}

generateEmbeddings().catch(console.error);
