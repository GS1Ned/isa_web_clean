import { db } from "../server/db.js";
import { regulations } from "../drizzle/schema.js";
import { like, or } from "drizzle-orm";

const eudrRegulations = await db
  .select()
  .from(regulations)
  .where(
    or(
      like(regulations.title, "%EUDR%"),
      like(regulations.title, "%Deforestation%"),
      like(regulations.title, "%EU Deforestation Regulation%")
    )
  )
  .limit(10);

console.log("=== EUDR Regulations Found ===");
console.log(`Total: ${eudrRegulations.length}\n`);

eudrRegulations.forEach(reg => {
  console.log(`ID: ${reg.id}`);
  console.log(`Title: ${reg.title}`);
  console.log(`Type: ${reg.regulationType}`);
  console.log(`CELEX ID: ${reg.celexId}`);
  console.log(`Effective Date: ${reg.effectiveDate}`);
  console.log(`Description: ${reg.description?.substring(0, 200)}...`);
  console.log("---\n");
});

process.exit(0);
