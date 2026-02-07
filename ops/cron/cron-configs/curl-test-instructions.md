# cURL Test Commands

Save the generated script as test-cron-endpoints.sh and run:

```bash
chmod +x test-cron-endpoints.sh
./test-cron-endpoints.sh
```

Or run commands individually:

```bash
# Test health endpoint
curl https://your-domain.manus.space/cron/health

# Test daily news ingestion
curl -X GET https://your-domain.manus.space/cron/daily-news-ingestion \
  -H "Authorization: Bearer c11f32585dcc3641dd108e4b6d9c3d4c9a718a41eeab7869775bb8ee97ca3f9b"

# Test weekly news archival
curl -X GET https://your-domain.manus.space/cron/weekly-news-archival \
  -H "Authorization: Bearer c11f32585dcc3641dd108e4b6d9c3d4c9a718a41eeab7869775bb8ee97ca3f9b"
```
