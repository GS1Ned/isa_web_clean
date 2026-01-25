import { chromium } from "playwright";

console.log("Debugging GS1.nl page structure...\n");

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
console.log("✅ Screenshot saved to /home/ubuntu/gs1-page-debug.png");

// Get page HTML
const html = await page.content();
console.log("\n📄 Page HTML length:", html.length, "characters");

// Check for news links
const links2025 = await page.$$('a[href*="/nieuws/2025/"]');
const links2024 = await page.$$('a[href*="/nieuws/2024/"]');
console.log(`\n🔗 Found ${links2025.length} links to 2025 articles`);
console.log(`🔗 Found ${links2024.length} links to 2024 articles`);

// Get all links
const allLinks = await page.evaluate(() => {
  const links = Array.from(document.querySelectorAll("a[href]"));
  return links
    .map(link => link.getAttribute("href"))
    .filter(href => href && href.includes("/nieuws/"))
    .slice(0, 20);
});

console.log("\n📋 Sample news links found:");
allLinks.forEach(link => console.log(`  - ${link}`));

await browser.close();
console.log("\n✅ Debug complete");
