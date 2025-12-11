# EasyCron Setup Instructions

1. Go to https://www.easycron.com and sign up
2. Click "Add Cron Job" button
3. Configure the following jobs:

## Daily News Ingestion Job

- **Cron Job Name:** ISA Daily News Ingestion
- **URL:** https://your-domain.manus.space/cron/daily-news-ingestion
- **Cron Expression:** 0 2 \* \* \* (Every day at 2:00 AM)
- **HTTP Method:** GET
- **HTTP Headers:** Authorization: Bearer c11f32585dcc3641dd108e4b6d9c3d4c9a718a41eeab7869775bb8ee97ca3f9b
- **Status:** Enabled

## Weekly News Archival Job

- **Cron Job Name:** ISA Weekly News Archival
- **URL:** https://your-domain.manus.space/cron/weekly-news-archival
- **Cron Expression:** 0 3 \* \* 0 (Every Sunday at 3:00 AM)
- **HTTP Method:** GET
- **HTTP Headers:** Authorization: Bearer c11f32585dcc3641dd108e4b6d9c3d4c9a718a41eeab7869775bb8ee97ca3f9b
- **Status:** Enabled

4. Save both jobs
5. Test by clicking "Run Now" button
