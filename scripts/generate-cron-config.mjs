#!/usr/bin/env node
/**
 * Cron Configuration Generator
 * Generates ready-to-use configuration for various cron services
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get environment variables
const CRON_SECRET = process.env.CRON_SECRET || "NOT_SET";
const APP_URL = process.env.VITE_APP_URL || "https://your-domain.manus.space";

if (CRON_SECRET === "NOT_SET") {
  console.error("❌ ERROR: CRON_SECRET environment variable is not set!");
  console.error("Please set CRON_SECRET in your Manus project secrets.");
  process.exit(1);
}

// Configuration templates
const configs = {
  "cron-job.org": {
    name: "cron-job.org Configuration",
    instructions: `
# cron-job.org Setup Instructions

1. Go to https://cron-job.org and sign up for a free account
2. Click "Create cronjob" button
3. Configure the following jobs:

## Daily News Ingestion Job

- **Title:** ISA Daily News Ingestion
- **URL:** ${APP_URL}/cron/daily-news-ingestion
- **Schedule:** Every day at 2:00 AM (or your preferred time)
- **Request method:** GET
- **Headers:**
  - Name: Authorization
  - Value: Bearer ${CRON_SECRET}
- **Enabled:** ✓ Yes

## Weekly News Archival Job

- **Title:** ISA Weekly News Archival
- **URL:** ${APP_URL}/cron/weekly-news-archival
- **Schedule:** Every Sunday at 3:00 AM
- **Request method:** GET
- **Headers:**
  - Name: Authorization
  - Value: Bearer ${CRON_SECRET}
- **Enabled:** ✓ Yes

4. Save both jobs and verify they appear in your dashboard
5. Test manually by clicking "Run now" button
`,
  },

  easycron: {
    name: "EasyCron Configuration",
    instructions: `
# EasyCron Setup Instructions

1. Go to https://www.easycron.com and sign up
2. Click "Add Cron Job" button
3. Configure the following jobs:

## Daily News Ingestion Job

- **Cron Job Name:** ISA Daily News Ingestion
- **URL:** ${APP_URL}/cron/daily-news-ingestion
- **Cron Expression:** 0 2 * * * (Every day at 2:00 AM)
- **HTTP Method:** GET
- **HTTP Headers:** Authorization: Bearer ${CRON_SECRET}
- **Status:** Enabled

## Weekly News Archival Job

- **Cron Job Name:** ISA Weekly News Archival
- **URL:** ${APP_URL}/cron/weekly-news-archival
- **Cron Expression:** 0 3 * * 0 (Every Sunday at 3:00 AM)
- **HTTP Method:** GET
- **HTTP Headers:** Authorization: Bearer ${CRON_SECRET}
- **Status:** Enabled

4. Save both jobs
5. Test by clicking "Run Now" button
`,
  },

  "github-actions": {
    name: "GitHub Actions Workflow",
    filename: ".github/workflows/isa-news-cron.yml",
    content: `name: ISA News Collection

on:
  schedule:
    # Daily at 2:00 AM UTC
    - cron: '0 2 * * *'
    # Weekly on Sunday at 3:00 AM UTC
    - cron: '0 3 * * 0'
  workflow_dispatch: # Allow manual trigger

jobs:
  daily-news-ingestion:
    runs-on: ubuntu-latest
    # Only run on daily schedule
    if: github.event.schedule == '0 2 * * *' || github.event_name == 'workflow_dispatch'
    steps:
      - name: Trigger Daily News Ingestion
        run: |
          response=$(curl -s -w "\\n%{http_code}" -X GET \\
            -H "Authorization: Bearer \${{ secrets.CRON_SECRET }}" \\
            ${APP_URL}/cron/daily-news-ingestion)
          
          http_code=$(echo "$response" | tail -n1)
          body=$(echo "$response" | sed '$d')
          
          echo "HTTP Status: $http_code"
          echo "Response: $body"
          
          if [ "$http_code" != "200" ]; then
            echo "❌ Daily news ingestion failed!"
            exit 1
          fi
          
          echo "✅ Daily news ingestion completed successfully"

  weekly-news-archival:
    runs-on: ubuntu-latest
    # Only run on weekly schedule (Sunday)
    if: github.event.schedule == '0 3 * * 0' || github.event_name == 'workflow_dispatch'
    steps:
      - name: Trigger Weekly News Archival
        run: |
          response=$(curl -s -w "\\n%{http_code}" -X GET \\
            -H "Authorization: Bearer \${{ secrets.CRON_SECRET }}" \\
            ${APP_URL}/cron/weekly-news-archival)
          
          http_code=$(echo "$response" | tail -n1)
          body=$(echo "$response" | sed '$d')
          
          echo "HTTP Status: $http_code"
          echo "Response: $body"
          
          if [ "$http_code" != "200" ]; then
            echo "❌ Weekly news archival failed!"
            exit 1
          fi
          
          echo "✅ Weekly news archival completed successfully"
`,
    instructions: `
# GitHub Actions Setup Instructions

1. Add CRON_SECRET to your GitHub repository secrets:
   - Go to your repository → Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: CRON_SECRET
   - Value: ${CRON_SECRET}
   - Click "Add secret"

2. Create the workflow file:
   - Copy the generated workflow file to: .github/workflows/isa-news-cron.yml
   - Commit and push to your repository

3. GitHub will automatically run the workflow on schedule
4. You can also trigger manually from Actions tab → "ISA News Collection" → "Run workflow"
`,
  },

  "curl-test": {
    name: "cURL Test Commands",
    content: `#!/bin/bash
# Test commands for ISA News Cron Endpoints

echo "Testing ISA News Cron Endpoints..."
echo "=================================="
echo ""

# Test health endpoint
echo "1. Testing health endpoint (no auth required)..."
curl -s ${APP_URL}/cron/health | jq
echo ""

# Test with invalid auth
echo "2. Testing with invalid authorization (should fail)..."
curl -s -X GET ${APP_URL}/cron/daily-news-ingestion \\
  -H "Authorization: Bearer wrong-secret" | jq
echo ""

# Test daily news ingestion
echo "3. Testing daily news ingestion (with valid auth)..."
curl -s -X GET ${APP_URL}/cron/daily-news-ingestion \\
  -H "Authorization: Bearer ${CRON_SECRET}" | jq
echo ""

echo "✅ All tests completed!"
`,
    instructions: `
# cURL Test Commands

Save the generated script as test-cron-endpoints.sh and run:

\`\`\`bash
chmod +x test-cron-endpoints.sh
./test-cron-endpoints.sh
\`\`\`

Or run commands individually:

\`\`\`bash
# Test health endpoint
curl ${APP_URL}/cron/health

# Test daily news ingestion
curl -X GET ${APP_URL}/cron/daily-news-ingestion \\
  -H "Authorization: Bearer ${CRON_SECRET}"

# Test weekly news archival
curl -X GET ${APP_URL}/cron/weekly-news-archival \\
  -H "Authorization: Bearer ${CRON_SECRET}"
\`\`\`
`,
  },
};

// Generate all configurations
console.log("🔧 ISA News Cron Configuration Generator");
console.log("=========================================\n");

const outputDir = path.join(__dirname, "..", "cron-configs");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

Object.entries(configs).forEach(([key, config]) => {
  console.log(`📝 Generating ${config.name}...`);

  if (config.content) {
    const filename = config.filename || `${key}-config.txt`;
    const filepath = path.join(outputDir, filename);
    // Create subdirectories if needed
    const dir = path.dirname(filepath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filepath, config.content);
    console.log(`   ✓ Saved to: ${filepath}`);
  }

  if (config.instructions) {
    const instructionsFile = path.join(outputDir, `${key}-instructions.md`);
    fs.writeFileSync(instructionsFile, config.instructions);
    console.log(`   ✓ Instructions: ${instructionsFile}`);
  }

  console.log("");
});

// Generate summary file
const summary = `# ISA News Cron Configuration Summary

**Generated:** ${new Date().toISOString()}
**App URL:** ${APP_URL}
**CRON_SECRET:** ${CRON_SECRET.substring(0, 8)}... (${CRON_SECRET.length} characters)

## Available Configurations

${Object.entries(configs)
  .map(
    ([key, config]) => `
### ${config.name}

See: \`${key}-instructions.md\`
${config.filename ? `Config file: \`${config.filename}\`` : ""}
`
  )
  .join("\n")}

## Quick Start

1. Choose your preferred cron service (cron-job.org recommended for beginners)
2. Follow the instructions in the corresponding \`*-instructions.md\` file
3. Test using the curl commands in \`curl-test-config.txt\`
4. Monitor execution in your cron service dashboard

## Endpoints

- **Health Check:** ${APP_URL}/cron/health (no auth)
- **Daily News Ingestion:** ${APP_URL}/cron/daily-news-ingestion (requires auth)
- **Weekly News Archival:** ${APP_URL}/cron/weekly-news-archival (requires auth)

## Authentication

All protected endpoints require:
\`\`\`
Authorization: Bearer ${CRON_SECRET}
\`\`\`

## Support

For issues or questions, see: docs/CRON_SETUP_GUIDE.md
`;

fs.writeFileSync(path.join(outputDir, "README.md"), summary);

console.log("✅ Configuration generation complete!");
console.log(`\n📁 All files saved to: ${outputDir}`);
console.log("\n🚀 Next steps:");
console.log("   1. Review the generated configurations");
console.log("   2. Choose your preferred cron service");
console.log("   3. Follow the instructions in the corresponding file");
console.log("   4. Test using the curl commands\n");
