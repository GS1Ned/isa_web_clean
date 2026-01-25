import { getDb } from "../server/db.ts";
import { regulations, gs1Standards } from "../drizzle/schema.ts";
import { like, or } from "drizzle-orm";

async function queryIdsForSeed() {
  const db = await getDb();
  if (!db) {
    console.error("Failed to connect to database");
    process.exit(1);
  }

  console.log("Querying regulation IDs...\n");

  // Query regulations
  const regs = await db
    .select({
      id: regulations.id,
      title: regulations.title,
      celexId: regulations.celexId,
    })
    .from(regulations)
    .where(
      or(
        like(regulations.title, "%CSRD%"),
        like(regulations.title, "%PPWR%"),
        like(regulations.title, "%ESPR%"),
        like(regulations.title, "%EUDR%"),
        like(regulations.title, "%Waste Framework%"),
        like(regulations.title, "%Packaging%"),
        like(regulations.title, "%Ecodesign%"),
        like(regulations.title, "%Deforestation%")
      )
    );

  console.log("Regulations:");
  regs.forEach(r => console.log(`  ID: ${r.id} | ${r.title} (${r.celexId})`));

  console.log("\nQuerying GS1 standard IDs...\n");

  // Query GS1 standards
  const standards = await db
    .select({ id: gs1Standards.id, standardName: gs1Standards.standardName })
    .from(gs1Standards)
    .where(
      or(
        like(gs1Standards.standardName, "%GDSN%"),
        like(gs1Standards.standardName, "%EPCIS%"),
        like(gs1Standards.standardName, "%Digital Link%"),
        like(gs1Standards.standardName, "%Web Vocabulary%"),
        like(gs1Standards.standardName, "%Healthcare%")
      )
    );

  console.log("GS1 Standards:");
  standards.forEach(s => console.log(`  ID: ${s.id} | ${s.standardName}`));

  process.exit(0);
}

queryIdsForSeed();
