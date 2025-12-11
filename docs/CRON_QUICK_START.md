# ISA News Collection - Quick Start Guide

**Get your automated news collection running in 5 minutes!**

---

## ✅ What's Already Done

Your ISA project is now fully configured with:

- ✅ Secure CRON_SECRET generated and set
- ✅ REST API endpoints for news collection (`/cron/*`)
- ✅ Automatic monitoring and failure alerts
- ✅ File-based execution logging
- ✅ All tests passing

---

## 🚀 Quick Setup (Recommended: cron-job.org)

### Step 1: Sign Up for cron-job.org (2 minutes)

1. Go to https://cron-job.org
2. Click "Sign up" (free, no credit card required)
3. Verify your email

### Step 2: Create Daily News Ingestion Job (2 minutes)

1. Click **"Create cronjob"** button
2. Fill in the form:

   **Basic Settings:**
   - Title: `ISA Daily News Ingestion`
   - URL: `https://your-isa-domain.manus.space/cron/daily-news-ingestion`
     _(Replace `your-isa-domain` with your actual Manus domain)_

   **Schedule:**
   - Select: **"Every day"**
   - Time: **2:00 AM** (or your preferred time)
   - Timezone: Select your timezone

   **Advanced Settings:**
   - Request method: **GET**
   - Headers: Click "Add header"
     - Name: `Authorization`
     - Value: `Bearer c11f32585dcc3641dd108e4b6d9c3d4c9a718a41eeab7869775bb8ee97ca3f9b`
       _(This is your CRON_SECRET - keep it secure!)_

3. Click **"Create cronjob"**

### Step 3: Create Weekly News Archival Job (1 minute)

1. Click **"Create cronjob"** button again
2. Fill in the form:

   **Basic Settings:**
   - Title: `ISA Weekly News Archival`
   - URL: `https://your-isa-domain.manus.space/cron/weekly-news-archival`

   **Schedule:**
   - Select: **"Every week"**
   - Day: **Sunday**
   - Time: **3:00 AM**

   **Advanced Settings:**
   - Request method: **GET**
   - Headers: Click "Add header"
     - Name: `Authorization`
     - Value: `Bearer c11f32585dcc3641dd108e4b6d9c3d4c9a718a41eeab7869775bb8ee97ca3f9b`

3. Click **"Create cronjob"**

### Step 4: Test Your Setup (30 seconds)

1. In cron-job.org dashboard, find your "ISA Daily News Ingestion" job
2. Click the **"▶ Run now"** button
3. Wait a few seconds
4. Check the "Execution log" tab - you should see:
   - Status: **200 OK**
   - Response body: `{"success":true,"message":"Daily news ingestion completed",...}`

**✅ Done!** Your news collection is now automated.

---

## 📊 Monitoring & Logs

### View Execution Logs

**In cron-job.org:**

- Go to your cronjob → "Execution log" tab
- See all past executions, status codes, and response times

**In your ISA server:**

- Logs are saved to: `logs/cron/cron-YYYY-MM-DD.log`
- View today's log: `tail -f logs/cron/cron-$(date +%Y-%m-%d).log`

### Automatic Failure Alerts

If a cron job fails **3 times consecutively**, you'll automatically receive a notification via Manus with:

- Error details
- Recent execution history
- Troubleshooting steps

### Monitoring Dashboard

View execution statistics:

```bash
# Generate monitoring report
node scripts/generate-cron-config.mjs
```

---

## 🔧 Troubleshooting

### Issue: "401 Unauthorized"

**Cause:** CRON_SECRET mismatch

**Solution:**

1. Verify your CRON_SECRET in cron-job.org matches the one in Manus secrets
2. Check Authorization header format: `Bearer <secret>` (note the space after "Bearer")

### Issue: "Timeout" or "No response"

**Cause:** News fetching takes too long

**Solution:**

1. This is normal - news collection can take 30-60 seconds
2. Increase timeout in cron-job.org settings to 120 seconds:
   - Edit cronjob → Advanced → Timeout: `120`

### Issue: "403 Forbidden" or "404 Not Found" in logs

**Cause:** Some news sources may be temporarily unavailable or rate-limiting

**Solution:**

- This is expected and handled gracefully
- The pipeline will skip unavailable sources and continue
- Check logs for: `[news-fetcher] Error fetching from...`
- Most sources should still work

### Issue: No news items inserted

**Cause:** All fetched news items may already exist in database

**Solution:**

- This is normal behavior (deduplication working correctly)
- Check response: `"skipped": 10` means 10 items were already in database
- New news will be inserted as it becomes available

---

## 🎯 What Happens When Cron Runs?

### Daily News Ingestion (2:00 AM)

1. Fetches news from 8 sources:
   - GS1 Netherlands News
   - GS1 Global News
   - EFRAG Updates
   - European Commission
   - EUR-Lex Press Releases
   - And more...

2. Processes each article:
   - Extracts title, summary, URL
   - Analyzes content with AI
   - Extracts relevant tags and categories
   - Checks for duplicates

3. Stores new articles in database

4. Typical execution time: 30-60 seconds

### Weekly News Archival (Sunday 3:00 AM)

1. Archives news items older than 200 days
2. Keeps database size manageable
3. Typical execution time: 1-5 seconds

---

## 📈 Expected Results

**First run:**

- Fetched: 10-50 items (depending on sources)
- Inserted: 10-50 items (all new)
- Skipped: 0 items

**Subsequent runs:**

- Fetched: 5-20 items
- Inserted: 0-10 items (only new ones)
- Skipped: 5-15 items (already in database)

**Weekly archival:**

- Archived: 0-50 items (depends on age)

---

## 🔒 Security Best Practices

1. **Never commit CRON_SECRET to version control**
   - It's stored securely in Manus project secrets
   - Only use it in cron service configuration

2. **Use HTTPS only**
   - All Manus domains use HTTPS by default
   - Never use HTTP for cron endpoints

3. **Monitor execution logs**
   - Review cron-job.org logs weekly
   - Check for suspicious activity or unexpected failures

4. **Rotate CRON_SECRET periodically**
   - Recommended: every 90 days
   - Generate new secret: `openssl rand -hex 32`
   - Update in Manus secrets and cron-job.org

---

## 📚 Additional Resources

- **Detailed Setup Guide:** `docs/CRON_SETUP_GUIDE.md`
- **Configuration Generator:** `scripts/generate-cron-config.mjs`
- **Alternative Cron Services:** See `cron-configs/` directory
- **Monitoring Code:** `server/cron-monitoring-simple.ts`

---

## ❓ Need Help?

**Common Questions:**

**Q: Can I change the schedule?**
A: Yes! Edit your cronjob in cron-job.org and change the schedule to any time you prefer.

**Q: Can I run it more frequently?**
A: Yes, but be mindful of rate limits from news sources. Daily is recommended.

**Q: What if I want to use a different cron service?**
A: See `cron-configs/` directory for configurations for EasyCron, GitHub Actions, and more.

**Q: How do I test manually?**
A: Use curl:

```bash
curl -H "Authorization: Bearer c11f32585dcc3641dd108e4b6d9c3d4c9a718a41eeab7869775bb8ee97ca3f9b" \
  https://your-domain.manus.space/cron/daily-news-ingestion
```

**Q: Where are the logs stored?**
A: In your project directory: `logs/cron/cron-YYYY-MM-DD.log`

---

## ✨ You're All Set!

Your ISA news collection is now fully automated and monitored. Sit back and let the system keep you updated with the latest EU sustainability regulations and GS1 standards news!

**Next Steps:**

1. ✅ Mark this guide as complete
2. 📧 Check your email for the first failure alert (if any)
3. 📊 Review execution logs after 24 hours
4. 🎉 Enjoy automated news collection!
