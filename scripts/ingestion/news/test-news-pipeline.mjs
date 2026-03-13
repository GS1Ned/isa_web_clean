import { runNewsPipeline } from "./server/news-pipeline.js";
import { format as utilFormat } from "node:util";
const cliOut = (...args) => process.stdout.write(`${utilFormat(...args)}\n`);
const cliErr = (...args) => process.stderr.write(`${utilFormat(...args)}\n`);


cliOut("[TEST] Running news pipeline with ESG filtering...");
const result = await runNewsPipeline();
cliOut("[TEST] Pipeline result:", JSON.stringify(result, null, 2));
