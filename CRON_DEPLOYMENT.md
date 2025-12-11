# ESG Hub Cron Job Deployment Guide

This document explains how to deploy and schedule the automated tasks for the ESG Regulations Knowledge & News Hub.

## Overview

The ESG Hub includes three automated tasks that should run on a daily schedule:

1. **RSS Aggregation** (2:00 AM) - Fetches news from official EU sources
2. **Regulation Change Scanning** (3:00 AM) - Detects regulation updates
3. **Email Notifications** (8:00 AM) - Sends deadline alerts and daily digests

## Prerequisites

- Node.js installed on your server
- Access to crontab or your server's task scheduler
- Database connection configured (via `DATABASE_URL` env var)
- Notification system configured (via `BUILT_IN_FORGE_API_KEY` env var)

## Cron Job Configuration

### Option 1: Linux/Unix Crontab

Edit your crontab with:

```bash
crontab -e
```

Add the following lines:

```cron
# ESG Hub - RSS Aggregation (daily at 2:00 AM)
0 2 * * * cd /path/to/isa_web && node server/rss-aggregator-real.mjs >> /var/log/isa-rss.log 2>&1

# ESG Hub - Regulation Change Scanning (daily at 3:00 AM)
0 3 * * * cd /path/to/isa_web && node server/regulation-change-tracker.ts >> /var/log/isa-changes.log 2>&1

# ESG Hub - Email Notifications (daily at 8:00 AM)
0 8 * * * cd /path/to/isa_web && node -e "import('./server/email-notification-triggers.ts').then(m => m.sendDeadlineAlerts()).then(() => m.sendDailyDigest())" >> /var/log/isa-emails.log 2>&1
```

### Option 2: Node.js Scheduler (Built-in)

The project includes `server/cron-scheduler.ts` which can be run as a background process:

```bash
# Start the scheduler
node server/cron-scheduler.ts &

# Or use PM2 for process management
pm2 start server/cron-scheduler.ts --name "isa-cron"
```

### Option 3: Docker Cron

If running in Docker, use a cron image or add to your Dockerfile:

```dockerfile
# Install cron
RUN apt-get update && apt-get install -y cron

# Copy crontab file
COPY crontab /etc/cron.d/isa-cron
RUN chmod 0644 /etc/cron.d/isa-cron

# Start cron daemon
CMD ["cron", "-f"]
```

## Email Notification Recipients

The email notification system is configured with hardcoded recipients:

- `frisowempe@gmail.com`
- `friso.wempe@gs1.nl`

To modify recipients, edit `server/email-notification-triggers.ts`:

```typescript
const NOTIFICATION_RECIPIENTS = [
  "frisowempe@gmail.com",
  "friso.wempe@gs1.nl",
  // Add more recipients here
];
```

## Email Notification Types

### Deadline Alerts

Sent daily at 8:00 AM for regulations with implementation dates within 30 days.

**Recipients:** Hardcoded list (see above)
**Frequency:** Daily
**Trigger:** Cron job at 8:00 AM

### Daily Digest

Sent daily at 8:00 AM with summary of new regulations and news from the past 24 hours.

**Recipients:** Hardcoded list (see above)
**Frequency:** Daily
**Trigger:** Cron job at 8:00 AM

### Regulation Updates

Sent when a regulation is updated (new deadline, scope change, enforcement date shift).

**Recipients:** Hardcoded list (see above)
**Frequency:** On-demand
**Trigger:** Manual or via API

## Monitoring

### Log Files

Monitor the cron job execution with:

```bash
# View RSS aggregation logs
tail -f /var/log/isa-rss.log

# View regulation change logs
tail -f /var/log/isa-changes.log

# View email notification logs
tail -f /var/log/isa-emails.log
```

### Database Verification

Check that news items are being created:

```sql
SELECT COUNT(*) as total_news, MAX(publishedDate) as latest_news
FROM hub_news;
```

Check user alerts:

```sql
SELECT COUNT(*) as total_alerts, COUNT(DISTINCT userId) as unique_users
FROM user_alerts
WHERE alertType = 'REGULATION_UPDATE';
```

## Troubleshooting

### Cron Job Not Running

1. Verify crontab is installed: `which cron`
2. Check cron service is running: `systemctl status cron`
3. Verify crontab entry: `crontab -l`
4. Check logs: `grep CRON /var/log/syslog`

### Email Notifications Not Sending

1. Verify notification system is configured: `echo $BUILT_IN_FORGE_API_KEY`
2. Check database connection: `mysql -u user -p database_name`
3. Review email logs: `tail -f /var/log/isa-emails.log`
4. Test manually: `node -e "import('./server/email-notification-triggers.ts').then(m => m.sendDeadlineAlerts())"`

### RSS Feed Not Updating

1. Verify RSS aggregator script runs: `node server/rss-aggregator-real.mjs`
2. Check RSS feed URLs are accessible
3. Review RSS logs: `tail -f /var/log/isa-rss.log`
4. Verify database has regulations: `SELECT COUNT(*) FROM regulations;`

## Performance Considerations

- **RSS Aggregation:** ~5-10 seconds per run
- **Regulation Change Scanning:** ~2-5 seconds per run
- **Email Notifications:** ~10-30 seconds per run (depends on recipient count)

Schedule these tasks during off-peak hours to minimize server load.

## Security Notes

- Ensure cron job logs do not contain sensitive information
- Use environment variables for API keys (not hardcoded)
- Restrict log file permissions: `chmod 600 /var/log/isa-*.log`
- Regularly review email recipient list for accuracy

## Next Steps

1. Choose your deployment method (crontab, Node.js scheduler, or Docker)
2. Update file paths to match your server setup
3. Test cron jobs manually before scheduling
4. Monitor logs for the first week to ensure proper operation
5. Set up log rotation to prevent disk space issues
