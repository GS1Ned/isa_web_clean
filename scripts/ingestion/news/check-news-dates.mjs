import { getDb } from "./server/db.js";
import { hubNews } from "./drizzle/schema.js";
import { desc } from "drizzle-orm";

const db = await getDb();
const news = await db
  .select({
    id: hubNews.id,
    title: hubNews.title,
    publishedDate: hubNews.publishedDate,
    createdAt: hubNews.createdAt,
    isAutomated: hubNews.isAutomated,
    summary: hubNews.summary,
  })
  .from(hubNews)
  .orderBy(desc(hubNews.createdAt))
  .limit(15);

console.log("=== Recent News Items ===\n");
news.forEach((item, idx) => {
  console.log(`${idx + 1}. [ID: ${item.id}] ${item.title}`);
  console.log(`   Published: ${item.publishedDate}`);
  console.log(`   Created: ${item.createdAt}`);
  console.log(`   Automated: ${item.isAutomated}`);
  console.log(`   Summary: ${item.summary?.substring(0, 100)}...`);
  console.log("");
});
