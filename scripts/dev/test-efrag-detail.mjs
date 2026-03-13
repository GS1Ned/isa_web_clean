import { scrapeEFRAGArticleDetail } from "./server/news-scraper-efrag.js";
import { format as utilFormat } from "node:util";
const cliOut = (...args) => process.stdout.write(`${utilFormat(...args)}\n`);
const cliErr = (...args) => process.stderr.write(`${utilFormat(...args)}\n`);


const url =
  "https://www.efrag.org/en/news-and-calendar/news/efrag-launches-the-esrs-knowledge-hub-a-new-digital-gateway-to-sustainability-reporting";

cliOut("[TEST] Scraping EFRAG article detail...");
cliOut("[TEST] URL:", url);

const content = await scrapeEFRAGArticleDetail(url);

cliOut("[TEST] Content length:", content?.length || 0);
cliOut("[TEST] First 500 chars:", content?.substring(0, 500));
cliOut("[TEST] Last 200 chars:", content?.substring(content.length - 200));

process.exit(0);
