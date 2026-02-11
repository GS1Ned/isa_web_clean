# ISA News Collection - Cron Setup Guide

**Purpose:** Set up automated daily news ingestion and weekly archival using external cron services

**Last Updated:** December 11, 2025

---

## Overview

ISA's news collection system runs inside your deployed web application and can be triggered by external cron services. This approach ensures:

- ✅ News collection runs in the same environment as your app (has access to database and code)
- ✅ No need for external scheduled tasks that run in fresh sandboxes
- ✅ Simple HTTP-based triggering via tRPC endpoints
- ✅ Secure with secret token authentication

---

## Architecture

```
External Cron Service (cron-job.org, EasyCron, etc.)
    ↓
    HTTP POST to your deployed ISA app
    ↓
ISA tRPC Cron Endpoint (/api/trpc/cron.dailyNewsIngestion)
    ↓
News Pipeline (news-cron-scheduler.ts)
    ↓
Database (hub_news table)
```

---

## Step 1: Set Up CRON_SECRET Environment Variable

### Why?

The cron endpoints are public (no login required) but protected by a secret token to prevent unauthorized access.

### How?

1. **Generate a strong secret:**

   ```bash
   openssl rand -hex 32
   # Example output: 4f8a3b2c1d9e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a
   ```

2. **Add to your Manus project secrets:**
   - Go to your ISA project in Manus
   - Navigate to **Settings → Secrets**
   - Add new secret:
     - Key: `CRON_SECRET`
     - Value: `<your-generated-secret>`

3. **Restart your dev server** (if running locally):
   ```bash
   pnpm dev
   ```

---

## Step 2: Choose an External Cron Service

### Recommended Options

#### Option 1: cron-job.org (Free, Easy)

**Pros:**

- Free tier: 50 jobs, 1-minute intervals
- Simple web interface
- No credit card required
- Reliable

**Cons:**

- Limited to 50 jobs on free tier
- No advanced features (retries, monitoring)

**Setup:**

1. Go to https://cron-job.org
2. Sign up for free account
3. Create new cron job (see Step 3 below)

#### Option 2: EasyCron (Free tier available)

**Pros:**

- Free tier: 1 job, 1-day intervals
- Advanced features: retries, notifications
- Good for production use

**Cons:**

- Free tier limited to 1 job
- Requires credit card for paid tiers

**Setup:**

1. Go to https://www.easycron.com
2. Sign up for free account
3. Create new cron job (see Step 3 below)

#### Option 3: GitHub Actions (Free for public repos)

**Pros:**

- Free for public repositories
- Integrated with your codebase
- Full control over workflow

**Cons:**

- Requires GitHub repository
- More complex setup
- Not recommended for private projects

**Setup:** See Step 4 below for GitHub Actions example

---

## Step 3: Configure Cron Job (cron-job.org example)

### Daily News Ingestion

1. **Create new cron job:**
   - Title: `ISA Daily News Ingestion`
   - URL: `https://your-isa-domain.manus.space/cron/daily-news-ingestion`
   - Method: `GET`
   - Schedule: `Every day at 2:00 AM` (or your preferred time)
   - Headers:
     - `Authorization: Bearer your-cron-secret-here`

2. **Save and enable** the cron job

### Weekly News Archival

1. **Create new cron job:**
   - Title: `ISA Weekly News Archival`
   - URL: `https://your-isa-domain.manus.space/cron/weekly-news-archival`
   - Method: `GET`
   - Schedule: `Every Sunday at 3:00 AM`
   - Headers:
     - `Authorization: Bearer your-cron-secret-here`

2. **Save and enable** the cron job

---

## Step 4: Alternative - GitHub Actions Setup

If you prefer to use GitHub Actions, create `.github/workflows/isa-news-cron.yml`:

```yaml
name: ISA News Collection

on:
  schedule:
    # Daily at 2:00 AM UTC
    - cron: "0 2 * * *"
  workflow_dispatch: # Allow manual trigger

jobs:
  daily-news-ingestion:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Daily News Ingestion
        run: |
          curl -X POST \
            -H "Content-Type: application/json" \
            -d '{"secret": "${{ secrets.CRON_SECRET }}"}' \
            https://your-isa-domain.manus.space/api/trpc/cron.dailyNewsIngestion

  weekly-news-archival:
    runs-on: ubuntu-latest
    # Only run on Sundays
    if: github.event.schedule == '0 3 * * 0'
    steps:
      - name: Trigger Weekly News Archival
        run: |
          curl -X POST \
            -H "Content-Type: application/json" \
            -d '{"secret": "${{ secrets.CRON_SECRET }}"}' \
            https://your-isa-domain.manus.space/api/trpc/cron.weeklyNewsArchival
```

**Setup:**

1. Add `CRON_SECRET` to your GitHub repository secrets (Settings → Secrets → Actions)
2. Commit the workflow file to your repository
3. GitHub will automatically run the workflow on schedule

---

## Step 5: Test the Cron Endpoints

### Manual Test via curl

```bash
# Test daily news ingestion
curl -X GET \
  -H "Authorization: Bearer your-cron-secret-here" \
  https://your-isa-domain.manus.space/cron/daily-news-ingestion

# Expected response:
# {
#   "success": true,
#   "message": "Daily news ingestion completed",
#   "stats": {
#     "fetched": 10,
#     "inserted": 5,
#     "skipped": 5,
#     "errors": 0,
#     "duration": "2345ms"
#   }
# }
```

### Manual Test via News Admin Page

1. Go to your ISA app
2. Navigate to **Admin → News Admin** (requires admin role)
3. Click **"Run Daily Ingestion"** button
4. Check the logs and stats

### Health Check

```bash
# Test health endpoint (no secret required)
curl https://your-isa-domain.manus.space/cron/health

# Expected response:
# {
#   "status": "ok",
#   "timestamp": "2024-12-11T20:00:00.000Z",
#   "service": "ISA News Cron"
# }
```

---

## Monitoring and Troubleshooting

### Check Cron Execution Logs

**In cron-job.org:**

1. Go to your cron job
2. Click **"Execution log"** tab
3. Check for successful executions and error messages

**In your ISA app:**

1. Check server logs for `[cron]` and `[news-cron]` prefixes
2. Look for error messages or unexpected behavior

### Common Issues

#### Issue: "Unauthorized: Invalid cron secret"

**Cause:** CRON_SECRET mismatch between environment variable and cron job body

**Solution:**

1. Verify CRON_SECRET is set correctly in Manus project secrets
2. Verify cron job body contains correct secret
3. Restart dev server to pick up new environment variable

#### Issue: "Failed to fetch news"

**Cause:** News sources may be temporarily unavailable or rate-limited

**Solution:**

1. Check server logs for specific error messages
2. Verify network connectivity from your deployed app
3. Check if news source APIs are operational
4. Consider adjusting fetch intervals to avoid rate limits

#### Issue: Cron job not triggering

**Cause:** Cron service may be down or misconfigured

**Solution:**

1. Check cron service status page
2. Verify cron job is enabled
3. Test manually via curl to isolate issue
4. Check cron service execution logs

---

## Security Best Practices

1. **Never commit CRON_SECRET to version control**
   - Use environment variables only
   - Add `.env` to `.gitignore`

2. **Use strong, random secrets**
   - Generate with `openssl rand -hex 32`
   - Rotate periodically (e.g., every 90 days)

3. **Monitor cron execution logs**
   - Set up alerts for failed executions
   - Review logs regularly for suspicious activity

4. **Limit cron endpoint access**
   - Consider IP whitelisting if your cron service supports it
   - Use HTTPS only (never HTTP)

---

## Recommended Schedule

**Daily News Ingestion:**

- Frequency: Every day
- Time: 2:00 AM (your timezone)
- Reason: Low traffic time, ensures fresh news for morning users

**Weekly News Archival:**

- Frequency: Every Sunday
- Time: 3:00 AM (your timezone)
- Reason: Weekly cleanup to keep database size manageable

---

## Next Steps

1. ✅ Set up CRON_SECRET environment variable
2. ✅ Choose external cron service (cron-job.org recommended)
3. ✅ Configure daily news ingestion cron job
4. ✅ Configure weekly news archival cron job
5. ✅ Test endpoints manually
6. ✅ Monitor execution logs for first week
7. ✅ Set up alerts for failed executions (optional)

---

## Support

If you encounter issues:

1. Check this guide's troubleshooting section
2. Review server logs for error messages
3. Test endpoints manually via curl
4. Contact your cron service support if needed

---

## Appendix: Endpoint Reference

### Daily News Ingestion

**Endpoint:** `GET /cron/daily-news-ingestion`

**Headers:**

```
Authorization: Bearer your-cron-secret
```

**Response (Success):**

```json
{
  "success": true,
  "message": "Daily news ingestion completed",
  "stats": {
    "fetched": 10,
    "inserted": 5,
    "skipped": 5,
    "errors": 0,
    "duration": "2345ms"
  }
}
```

**Response (Error):**

```json
{
  "success": false,
  "message": "Daily news ingestion failed",
  "error": "Error message here"
}
```

### Weekly News Archival

**Endpoint:** `GET /cron/weekly-news-archival`

**Headers:**

```
Authorization: Bearer your-cron-secret
```

**Response (Success):**

```json
{
  "success": true,
  "message": "Weekly news archival completed",
  "stats": {
    "archived": 50,
    "errors": 0,
    "duration": "1234ms"
  }
}
```

**Response (Error):**

```json
{
  "success": false,
  "message": "Weekly news archival failed",
  "error": "Error message here"
}
```

### Health Check

**Endpoint:** `GET /cron/health`

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2024-12-11T20:00:00.000Z",
  "service": "ISA News Cron"
}
```
