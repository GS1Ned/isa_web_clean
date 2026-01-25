# cron-job.org Setup Instructions

1. Go to https://cron-job.org and sign up for a free account
2. Click "Create cronjob" button
3. Configure the following jobs:

## Daily News Ingestion Job

- **Title:** ISA Daily News Ingestion
- **URL:** https://your-domain.manus.space/cron/daily-news-ingestion
- **Schedule:** Every day at 2:00 AM (or your preferred time)
- **Request method:** GET
- **Headers:**
  - Name: Authorization
  - Value: Bearer c11f32585dcc3641dd108e4b6d9c3d4c9a718a41eeab7869775bb8ee97ca3f9b
- **Enabled:** ✓ Yes

## Weekly News Archival Job

- **Title:** ISA Weekly News Archival
- **URL:** https://your-domain.manus.space/cron/weekly-news-archival
- **Schedule:** Every Sunday at 3:00 AM
- **Request method:** GET
- **Headers:**
  - Name: Authorization
  - Value: Bearer c11f32585dcc3641dd108e4b6d9c3d4c9a718a41eeab7869775bb8ee97ca3f9b
- **Enabled:** ✓ Yes

4. Save both jobs and verify they appear in your dashboard
5. Test manually by clicking "Run now" button
