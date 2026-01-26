import { chromium } from "playwright";
import { expect } from "playwright/test";

const baseUrl = process.env.ISA_BASE_URL || "http://localhost:5173";
const targetUrl = new URL("/", baseUrl).toString();

const run = async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  try {
    await page.goto(targetUrl, { waitUntil: "networkidle" });

    const exploreTrigger = page.getByRole("button", { name: "Explore" });
    await exploreTrigger.hover();

    const esgHubLink = page.getByRole("link", { name: "ESG Hub" });
    await expect(esgHubLink).toBeVisible();

    await esgHubLink.click();

    await page.waitForURL(/\/hub/);
    await expect(page).toHaveURL(/\/hub/);
  } finally {
    await browser.close();
  }
};

run().catch(error => {
  console.error("Navigation dropdown smoke test failed:", error);
  process.exit(1);
});
