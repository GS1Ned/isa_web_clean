import { getDb } from '../server/db.ts';
import { hubNews } from '../drizzle/schema.ts';
import { count, sql } from 'drizzle-orm';

async function main() {
  const db = await getDb();
  
  // Total count
  const totalResult = await db.select({ count: count() }).from(hubNews);
  console.log(`Total articles: ${totalResult[0].count}`);
  
  // Count by source type
  const bySourceType = await db.execute(sql`
    SELECT sourceType, COUNT(*) as cnt FROM hub_news GROUP BY sourceType
  `);
  console.log("\n=== By Source Type ===");
  const sourceRows = Array.isArray(bySourceType) ? bySourceType : (bySourceType as any)[0] || [];
  sourceRows.forEach((r: any) => console.log(`  ${r.sourceType}: ${r.cnt}`));
  
  // Count by impact level
  const byImpact = await db.execute(sql`
    SELECT impactLevel, COUNT(*) as cnt FROM hub_news GROUP BY impactLevel
  `);
  console.log("\n=== By Impact Level ===");
  const impactRows = Array.isArray(byImpact) ? byImpact : (byImpact as any)[0] || [];
  impactRows.forEach((r: any) => console.log(`  ${r.impactLevel}: ${r.cnt}`));
  
  // Count by news type
  const byNewsType = await db.execute(sql`
    SELECT newsType, COUNT(*) as cnt FROM hub_news GROUP BY newsType
  `);
  console.log("\n=== By News Type ===");
  const newsTypeRows = Array.isArray(byNewsType) ? byNewsType : (byNewsType as any)[0] || [];
  newsTypeRows.forEach((r: any) => console.log(`  ${r.newsType}: ${r.cnt}`));
  
  // Count by regulatory state
  const byRegState = await db.execute(sql`
    SELECT regulatory_state, COUNT(*) as cnt FROM hub_news GROUP BY regulatory_state
  `);
  console.log("\n=== By Regulatory State ===");
  const regStateRows = Array.isArray(byRegState) ? byRegState : (byRegState as any)[0] || [];
  regStateRows.forEach((r: any) => console.log(`  ${r.regulatory_state || 'NULL'}: ${r.cnt}`));
  
  // Count by confidence level
  const byConfidence = await db.execute(sql`
    SELECT confidence_level, COUNT(*) as cnt FROM hub_news GROUP BY confidence_level
  `);
  console.log("\n=== By Confidence Level ===");
  const confRows = Array.isArray(byConfidence) ? byConfidence : (byConfidence as any)[0] || [];
  confRows.forEach((r: any) => console.log(`  ${r.confidence_level || 'NULL'}: ${r.cnt}`));
  
  // Negative signals
  const negSignals = await db.execute(sql`
    SELECT is_negative_signal, COUNT(*) as cnt FROM hub_news GROUP BY is_negative_signal
  `);
  console.log("\n=== Negative Signals ===");
  const negRows = Array.isArray(negSignals) ? negSignals : (negSignals as any)[0] || [];
  negRows.forEach((r: any) => console.log(`  ${r.is_negative_signal === 1 ? 'Yes' : 'No'}: ${r.cnt}`));
  
  // Articles with GS1 Impact Analysis
  const withAnalysis = await db.execute(sql`
    SELECT COUNT(*) as cnt FROM hub_news WHERE gs1ImpactAnalysis IS NOT NULL AND gs1ImpactAnalysis != ''
  `);
  const analysisRows = Array.isArray(withAnalysis) ? withAnalysis : (withAnalysis as any)[0] || [];
  console.log(`\nArticles with GS1 Impact Analysis: ${analysisRows[0]?.cnt || 0}`);
  
  // Articles with Suggested Actions
  const withActions = await db.execute(sql`
    SELECT COUNT(*) as cnt FROM hub_news WHERE suggestedActions IS NOT NULL AND JSON_LENGTH(suggestedActions) > 0
  `);
  const actionRows = Array.isArray(withActions) ? withActions : (withActions as any)[0] || [];
  console.log(`Articles with Suggested Actions: ${actionRows[0]?.cnt || 0}`);
  
  // Average actions per article
  const avgActions = await db.execute(sql`
    SELECT AVG(JSON_LENGTH(suggestedActions)) as avg_actions FROM hub_news WHERE suggestedActions IS NOT NULL
  `);
  const avgRows = Array.isArray(avgActions) ? avgActions : (avgActions as any)[0] || [];
  console.log(`Average actions per article: ${parseFloat(avgRows[0]?.avg_actions || 0).toFixed(1)}`);
  
  // Credibility score distribution
  const credScores = await db.execute(sql`
    SELECT credibilityScore, COUNT(*) as cnt FROM hub_news GROUP BY credibilityScore
  `);
  console.log("\n=== Credibility Score Distribution ===");
  const credRows = Array.isArray(credScores) ? credScores : (credScores as any)[0] || [];
  credRows.forEach((r: any) => console.log(`  ${r.credibilityScore}: ${r.cnt}`));
  
  process.exit(0);
}

main();
