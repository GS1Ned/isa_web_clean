# ISA News Collection - Cron Configuration Files

**📁 This directory contains ready-to-use configurations for various cron services.**

---

## 🚀 Quick Start

**New to this?** Start here:

1. Read: `../docs/CRON_QUICK_START.md` (5-minute setup guide)
2. Choose your cron service (we recommend cron-job.org for beginners)
3. Follow the instructions in the corresponding file below

---

## 📋 Available Configurations

### 1. cron-job.org (Recommended for Beginners)

**File:** `cron-job.org-instructions.md`

**Why choose this:**
- ✅ Free tier (50 jobs, 1-minute intervals)
- ✅ Simple web interface
- ✅ No credit card required
- ✅ Reliable execution logs

**Best for:** First-time users, small projects

---

### 2. EasyCron

**File:** `easycron-instructions.md`

**Why choose this:**
- ✅ Advanced features (retries, notifications)
- ✅ Good for production use
- ⚠️  Free tier limited to 1 job

**Best for:** Production deployments, advanced users

---

### 3. GitHub Actions

**Files:**
- `.github/workflows/isa-news-cron.yml` (workflow file)
- `github-actions-instructions.md` (setup guide)

**Why choose this:**
- ✅ Free for public repositories
- ✅ Integrated with your codebase
- ✅ Full control over workflow
- ⚠️  Requires GitHub repository

**Best for:** Open-source projects, developers familiar with GitHub Actions

---

### 4. cURL Test Commands

**File:** `curl-test-config.txt`

**Why use this:**
- Test your endpoints manually
- Verify authentication is working
- Debug issues

**Usage:**
```bash
# Make the script executable
chmod +x curl-test-config.txt

# Run tests
./curl-test-config.txt
```

---

## 🔑 Important: CRON_SECRET

All configurations use the same CRON_SECRET:

```
c11f32585dcc3641dd108e4b6d9c3d4c9a718a41eeab7869775bb8ee97ca3f9b
```

**⚠️  Keep this secret secure!** Don't share it publicly or commit it to version control.

---

## 🎯 Endpoints

Your ISA app exposes these cron endpoints:

| Endpoint | Purpose | Auth Required |
|----------|---------|---------------|
| `/cron/health` | Health check | No |
| `/cron/daily-news-ingestion` | Daily news collection | Yes |
| `/cron/weekly-news-archival` | Weekly cleanup | Yes |

**Base URL:** `https://your-isa-domain.manus.space`

---

## 📊 Monitoring

All cron executions are automatically logged and monitored:

- **Logs:** `logs/cron/cron-YYYY-MM-DD.log`
- **Alerts:** Automatic notification after 3 consecutive failures
- **Stats:** View execution history and success rates

---

## 🆘 Need Help?

1. **Quick Start Guide:** `../docs/CRON_QUICK_START.md`
2. **Detailed Setup:** `../docs/CRON_SETUP_GUIDE.md`
3. **Test Endpoints:** Use `curl-test-config.txt`

---

## 🔄 Regenerate Configurations

If you need to regenerate these files (e.g., after changing your domain or CRON_SECRET):

```bash
node scripts/generate-cron-config.mjs
```

This will update all configuration files with your current settings.

---

**Ready to get started?** Choose a cron service above and follow its instructions!
