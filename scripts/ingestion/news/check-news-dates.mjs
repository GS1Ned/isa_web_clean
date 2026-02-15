import { getDb } from "./server/db.js";
import { hubNews } from "./drizzle/schema.js";
import { desc } from "drizzle-orm";
import { format as utilFormat } from "node:util";
const cliOut = (...args) => process.stdout.write(`${utilFormat(...args)}\n`);
const cliErr = (...args) => process.stderr.write(`${utilFormat(...args)}\n`);


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

cliOut("=== Recent News Items ===\n");
news.forEach((item, idx) => {
  cliOut(`${idx + 1}. [ID: ${item.id}] ${item.title}`);
  cliOut(`   Published: ${item.publishedDate}`);
  cliOut(`   Created: ${item.createdAt}`);
  cliOut(`   Automated: ${item.isAutomated}`);
  cliOut(`   Summary: ${item.summary?.substring(0, 100)}...`);
  cliOut("");
});
