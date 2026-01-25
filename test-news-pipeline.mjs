import { runNewsPipeline } from "./server/news-pipeline.js";

console.log("[TEST] Running news pipeline with ESG filtering...");
const result = await runNewsPipeline();
console.log("[TEST] Pipeline result:", JSON.stringify(result, null, 2));
