# Chromium Installation Guide for ISA News Pipeline

This guide explains how to install Chromium for Playwright to enable the GS1.nl news scraper.

---

## Why Chromium is Needed

The ISA news pipeline uses **Playwright** to scrape dynamic websites that require JavaScript rendering, specifically:

- **GS1 Netherlands** (gs1.nl) - Uses JavaScript to load news content
- **Other dynamic sources** - May be added in the future

Without Chromium installed, the Playwright scraper will fail with:
```
Error: browserType.launch: Executable doesn't exist at /home/ubuntu/.cache/ms-playwright/chromium_headless_shell-1200/chrome-headless-shell-linux64/chrome-headless-shell
```

---

## Installation Steps

### Option 1: Using pnpm (Recommended)

From the ISA project directory:

```bash
cd /home/ubuntu/isa_web
pnpm exec playwright install chromium
```

**What this does:**
- Downloads Chromium browser (~165 MB)
- Downloads Chromium Headless Shell (~110 MB)
- Downloads FFMPEG (~2.3 MB)
- Installs to: `/home/ubuntu/.cache/ms-playwright/`

**Expected output:**
```
Downloading Chromium 143.0.7499.4 (playwright build v1200)...
164.7 MiB [====================] 100%
Chromium downloaded to /home/ubuntu/.cache/ms-playwright/chromium-1200

Downloading Chromium Headless Shell...
109.7 MiB [====================] 100%

Downloading FFMPEG...
2.3 MiB [====================] 100%
```

### Option 2: Using npx

```bash
cd /home/ubuntu/isa_web
npx playwright install chromium
```

### Option 3: Install All Browsers (Not Recommended)

```bash
cd /home/ubuntu/isa_web
pnpm exec playwright install
```

This installs Chromium, Firefox, and WebKit (~500 MB total). Only use if you need multiple browsers.

---

## Verification

After installation, test the news pipeline:

1. Navigate to: `/admin/news-pipeline`
2. Click **"Run News Ingestion"**
3. Check results - should see articles fetched from GS1.nl

**Expected results (after Chromium installation):**
- ✅ Fetched: 10-20 articles (depending on available news)
- ✅ Processed: 1-5 articles (new articles only)
- ✅ Inserted: 1-5 articles
- ✅ Skipped: 5-15 articles (duplicates)
- ✅ Duration: 30-60 seconds

**Before Chromium installation:**
- ❌ Fetched: 0 articles
- ❌ Error: "Executable doesn't exist"
- ⚡ Duration: <1 second (fails immediately)

---

## Troubleshooting

### Error: "Executable doesn't exist"

**Cause:** Chromium not installed or installation incomplete

**Solution:**
```bash
cd /home/ubuntu/isa_web
pnpm exec playwright install chromium --force
```

The `--force` flag reinstalls even if Playwright thinks it's already installed.

### Error: "Failed to launch browser"

**Cause:** Missing system dependencies (rare on Ubuntu 22.04)

**Solution:**
```bash
sudo apt-get update
sudo apt-get install -y \
  libnss3 \
  libnspr4 \
  libatk1.0-0 \
  libatk-bridge2.0-0 \
  libcups2 \
  libdrm2 \
  libxkbcommon0 \
  libxcomposite1 \
  libxdamage1 \
  libxfixes3 \
  libxrandr2 \
  libgbm1 \
  libasound2
```

Then reinstall Chromium:
```bash
cd /home/ubuntu/isa_web
pnpm exec playwright install chromium
```

### Error: "Timeout waiting for browser"

**Cause:** Chromium taking too long to start (usually on slow systems)

**Solution:** Increase timeout in `server/news-scraper-playwright.ts`:

```typescript
const browser = await chromium.launch({
  headless: true,
  timeout: 60000, // Increase from 30000 to 60000
});
```

### Pipeline still returns 0 articles

**Cause:** No new articles available (deduplication working correctly)

**Solution:** This is normal! The pipeline:
1. Fetches articles from sources
2. Checks if URL already exists in database
3. Skips duplicates
4. Only inserts genuinely new articles

To test with fresh data:
1. Clear the database: `DELETE FROM hub_news;`
2. Run pipeline again
3. Should see 20-30 articles inserted

---

## Storage Requirements

| Component | Size | Location |
|-----------|------|----------|
| Chromium | ~165 MB | `/home/ubuntu/.cache/ms-playwright/chromium-1200` |
| Headless Shell | ~110 MB | `/home/ubuntu/.cache/ms-playwright/chromium_headless_shell-1200` |
| FFMPEG | ~2.3 MB | `/home/ubuntu/.cache/ms-playwright/ffmpeg-1011` |
| **Total** | **~277 MB** | `/home/ubuntu/.cache/ms-playwright/` |

**Note:** These files persist across ISA restarts and updates. They only need to be downloaded once.

---

## Uninstallation (If Needed)

To remove Chromium and free up space:

```bash
rm -rf /home/ubuntu/.cache/ms-playwright/chromium-1200
rm -rf /home/ubuntu/.cache/ms-playwright/chromium_headless_shell-1200
rm -rf /home/ubuntu/.cache/ms-playwright/ffmpeg-1011
```

**Warning:** This will break the GS1.nl scraper. Only do this if you're not using the news pipeline.

---

## Automatic Installation in Production

To ensure Chromium is installed automatically when deploying ISA:

### Option 1: Add to package.json (Recommended)

Add a postinstall script:

```json
{
  "scripts": {
    "postinstall": "playwright install chromium"
  }
}
```

This runs automatically after `pnpm install`.

### Option 2: Add to Dockerfile

If using Docker:

```dockerfile
RUN pnpm exec playwright install chromium
RUN pnpm exec playwright install-deps chromium
```

### Option 3: Add to CI/CD Pipeline

In your deployment script:

```bash
#!/bin/bash
cd /home/ubuntu/isa_web
pnpm install
pnpm exec playwright install chromium
pnpm run build
```

---

## Performance Notes

**Chromium vs. Simple HTTP Scrapers:**

| Scraper Type | Speed | Memory | Use Case |
|--------------|-------|--------|----------|
| Simple HTTP (axios) | ~100ms | ~10 MB | Static HTML pages (EUR-Lex, EFRAG) |
| Playwright (Chromium) | ~5-10s | ~200 MB | Dynamic JavaScript sites (GS1.nl) |

**Best Practice:** Use simple HTTP scrapers when possible, reserve Playwright for JavaScript-heavy sites.

**Current ISA Configuration:**
- EUR-Lex: HTTP scraper ✅
- EFRAG: HTTP scraper ✅
- EU Commission: HTTP scraper ✅
- GS1 Netherlands: Playwright ✅ (requires Chromium)
- GS1 Global: HTTP scraper ✅
- GS1 Europe: HTTP scraper ✅

---

## Related Files

- **Playwright scraper:** `server/news-scraper-playwright.ts`
- **News pipeline:** `server/news-pipeline.ts`
- **Source config:** `server/news-sources.ts`
- **Admin UI:** `client/src/pages/AdminNewsPipelineManager.tsx`

---

## Support

If you encounter issues not covered in this guide:

1. Check Playwright documentation: https://playwright.dev/docs/browsers
2. Check ISA logs: Look for `[Playwright Scraper]` entries
3. Test Playwright directly:
   ```bash
   cd /home/ubuntu/isa_web
   pnpm exec playwright --version
   ```

---

**Last Updated:** 2025-12-12  
**ISA Version:** 061dbfa5  
**Playwright Version:** 1.49.1  
**Chromium Version:** 143.0.7499.4 (build v1200)
