import { chromium } from "playwright";
import { format as utilFormat } from "node:util";
const cliOut = (...args) => process.stdout.write(`${utilFormat(...args)}\n`);
const cliErr = (...args) => process.stderr.write(`${utilFormat(...args)}\n`);


cliOut("Debugging GS1.nl page structure...\n");

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();

await page.goto(
  "https://www.gs1.nl/gs1-in-actie/nieuws-en-events/nieuws/?sector=Duurzaamheid",
  {
    waitUntil: "networkidle",
    timeout: 30000,
  }
);

await page.waitForLoadState("domcontentloaded");
await page.waitForTimeout(3000);

// Take screenshot
await page.screenshot({
  path: "/home/ubuntu/gs1-page-debug.png",
  fullPage: true,
});
cliOut("✅ Screenshot saved to /home/ubuntu/gs1-page-debug.png");

// Get page HTML
const html = await page.content();
cliOut("\n📄 Page HTML length:", html.length, "characters");

// Check for news links
const links2025 = await page.$$('a[href*="/nieuws/2025/"]');
const links2024 = await page.$$('a[href*="/nieuws/2024/"]');
cliOut(`\n🔗 Found ${links2025.length} links to 2025 articles`);
cliOut(`🔗 Found ${links2024.length} links to 2024 articles`);

// Get all links
const allLinks = await page.evaluate(() => {
  const links = Array.from(document.querySelectorAll("a[href]"));
  return links
    .map(link => link.getAttribute("href"))
    .filter(href => href && href.includes("/nieuws/"))
    .slice(0, 20);
});

cliOut("\n📋 Sample news links found:");
allLinks.forEach(link => cliOut(`  - ${link}`));

await browser.close();
cliOut("\n✅ Debug complete");
