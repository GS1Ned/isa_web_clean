# CELLAR Ingestion Scheduler Deployment Guide

## Overview

The CELLAR Ingestion Scheduler is an automated system that synchronizes the ISA database with the latest EU regulations from the CELLAR SPARQL endpoint. It runs daily to fetch, normalize, and store ESG-related legal acts.

## Architecture

```
┌─────────────────┐
│  CELLAR SPARQL  │
│    Endpoint     │
└────────┬────────┘
         │
         │ SPARQL Queries
         │
         ▼
┌─────────────────┐
│ cellar-connector│
│   (TypeScript)  │
└────────┬────────┘
         │
         │ EULegalAct[]
         │
         ▼
┌─────────────────┐
│cellar-normalizer│
│   (TypeScript)  │
└────────┬────────┘
         │
         │ InsertRegulation[]
         │
         ▼
┌─────────────────┐
│  ISA Database   │
│   (MySQL/TiDB)  │
└─────────────────┘
```

## Components

### 1. CELLAR Connector (`server/cellar-connector.ts`)

- Connects to EU Publications Office SPARQL endpoint
- Executes SPARQL queries for ESG regulations
- Parses RDF/JSON responses into TypeScript types
- Methods:
  - `getESGRegulations(yearsBack)` - Fetch ESG regulations
  - `searchActsByKeyword(keyword)` - Search by keyword
  - `getActByCelex(celexId)` - Fetch specific regulation
  - `testConnection()` - Verify endpoint availability

### 2. CELLAR Normalizer (`server/cellar-normalizer.ts`)

- Transforms CELLAR data to ISA database schema
- Maps CELEX IDs to regulation types (CSRD, ESRS, DPP, etc.)
- Validates data integrity
- Deduplicates regulations
- Merges with existing database records

### 3. Ingestion Scheduler (`server/cellar-ingestion-scheduler.mjs`)

- Orchestrates the ingestion workflow
- Runs as a cron job (daily at 3 AM)
- Implements retry logic with exponential backoff
- Logs all operations for monitoring

## Installation

### Prerequisites

```bash
# Ensure Node.js 22+ is installed
node --version  # Should be v22.13.0 or higher

# Ensure database connection is configured
echo $DATABASE_URL  # Should output your MySQL/TiDB connection string
```

### Build TypeScript Files

The scheduler imports TypeScript modules, so they need to be compiled first:

```bash
cd /path/to/isa_web

# Compile TypeScript to JavaScript
pnpm run build

# Or use tsc directly
npx tsc server/cellar-connector.ts --outDir dist/server --module es2022 --target es2022
npx tsc server/cellar-normalizer.ts --outDir dist/server --module es2022 --target es2022
```

## Configuration

### Environment Variables

Required environment variables (already configured in Manus platform):

```bash
DATABASE_URL=mysql://user:password@host:port/database
```

### Scheduler Configuration

Edit `server/cellar-ingestion-scheduler.mjs`:

```javascript
const INGESTION_CONFIG = {
  yearsBack: 5, // How many years back to search
  maxRegulations: 500, // Maximum regulations per run
  maxRetries: 3, // Retry attempts on failure
  retryDelayMs: 5000, // Delay between retries (ms)
  verbose: true, // Enable detailed logging
};
```

## Deployment

### Option 1: Cron Job (Recommended for Production)

1. **Create log directory:**

```bash
mkdir -p /path/to/isa_web/logs
```

2. **Add cron job:**

```bash
# Edit crontab
crontab -e

# Add this line (runs daily at 3 AM):
0 3 * * * cd /path/to/isa_web && node server/cellar-ingestion-scheduler.mjs >> logs/cellar-ingestion.log 2>&1
```

3. **Verify cron job:**

```bash
crontab -l
```

### Option 2: Systemd Service (Alternative)

1. **Create systemd service file:**

```bash
sudo nano /etc/systemd/system/isa-cellar-ingestion.service
```

2. **Add service configuration:**

```ini
[Unit]
Description=ISA CELLAR Ingestion Service
After=network.target

[Service]
Type=oneshot
User=ubuntu
WorkingDirectory=/path/to/isa_web
Environment="DATABASE_URL=mysql://..."
ExecStart=/usr/bin/node server/cellar-ingestion-scheduler.mjs
StandardOutput=append:/path/to/isa_web/logs/cellar-ingestion.log
StandardError=append:/path/to/isa_web/logs/cellar-ingestion-error.log

[Install]
WantedBy=multi-user.target
```

3. **Create systemd timer:**

```bash
sudo nano /etc/systemd/system/isa-cellar-ingestion.timer
```

```ini
[Unit]
Description=ISA CELLAR Ingestion Timer
Requires=isa-cellar-ingestion.service

[Timer]
OnCalendar=daily
OnCalendar=03:00
Persistent=true

[Install]
WantedBy=timers.target
```

4. **Enable and start timer:**

```bash
sudo systemctl daemon-reload
sudo systemctl enable isa-cellar-ingestion.timer
sudo systemctl start isa-cellar-ingestion.timer
```

### Option 3: Manual Execution (Testing)

```bash
cd /path/to/isa_web
node server/cellar-ingestion-scheduler.mjs
```

## Monitoring

### Log Files

Logs are written to `logs/cellar-ingestion.log` in JSON format:

```json
{
  "timestamp": "2024-01-15T03:00:00.000Z",
  "level": "info",
  "message": "Ingestion workflow completed",
  "duration": "15234ms",
  "inserted": 12,
  "updated": 45,
  "errors": 0,
  "total": 57
}
```

### Log Levels

- `info` - Normal operation messages
- `warn` - Non-critical issues (e.g., retries, invalid data)
- `error` - Critical failures
- `debug` - Detailed operation logs (when `verbose: true`)

### Monitoring Commands

```bash
# View latest logs
tail -f logs/cellar-ingestion.log

# Count successful runs today
grep "Ingestion workflow completed" logs/cellar-ingestion.log | grep "$(date +%Y-%m-%d)" | wc -l

# Check for errors
grep '"level":"error"' logs/cellar-ingestion.log | tail -10

# View ingestion statistics
grep "Regulation statistics" logs/cellar-ingestion.log | tail -1 | jq .
```

## Troubleshooting

### Issue: Scheduler fails to connect to CELLAR

**Symptoms:**

```json
{ "level": "error", "message": "Failed to connect to CELLAR endpoint" }
```

**Solutions:**

1. Check internet connectivity
2. Verify CELLAR endpoint is accessible: `curl https://publications.europa.eu/webapi/rdf/sparql`
3. Check firewall rules

### Issue: Database connection fails

**Symptoms:**

```json
{ "level": "error", "message": "Database connection failed" }
```

**Solutions:**

1. Verify `DATABASE_URL` environment variable
2. Check database server is running
3. Verify credentials and permissions

### Issue: No regulations inserted/updated

**Symptoms:**

```json
{ "inserted": 0, "updated": 0, "total": 0 }
```

**Solutions:**

1. Check if regulations already exist in database
2. Verify SPARQL queries are returning results
3. Check normalization filters (may be filtering out non-ESG acts)
4. Increase `yearsBack` configuration

### Issue: High error rate

**Symptoms:**

```json
{ "errors": 25, "total": 50 }
```

**Solutions:**

1. Check database schema matches `InsertRegulation` type
2. Verify validation logic in `cellar-normalizer.ts`
3. Check for duplicate CELEX IDs in database
4. Review error logs for specific failure patterns

## Performance

### Expected Metrics

- **Duration:** 10-30 seconds per run
- **Regulations processed:** 50-200 per day
- **Network requests:** 5-10 SPARQL queries
- **Database operations:** 50-200 inserts/updates

### Optimization

1. **Reduce query frequency:** Change `yearsBack` from 5 to 3
2. **Limit results:** Adjust `maxRegulations` in config
3. **Batch database operations:** Group inserts/updates
4. **Cache SPARQL results:** Store responses temporarily

## Maintenance

### Weekly Tasks

- Review logs for errors
- Check ingestion statistics
- Verify new regulations are being added

### Monthly Tasks

- Rotate log files (keep last 3 months)
- Review database growth
- Update CELEX mappings if new regulation types emerge

### Quarterly Tasks

- Update ESG keyword list in `cellar-normalizer.ts`
- Review and optimize SPARQL queries
- Audit data quality and completeness

## Integration with Existing Systems

### RSS Aggregator

The CELLAR ingestion scheduler complements the existing RSS aggregator:

- **RSS Aggregator:** Fetches news and updates (runs at 2 AM)
- **CELLAR Scheduler:** Fetches official legal acts (runs at 3 AM)
- **Change Tracker:** Detects regulation changes (runs at 3:30 AM)
- **Email Notifications:** Sends alerts to users (runs at 8 AM)

### Recommended Schedule

```
02:00 - RSS Aggregator (news from EU Commission, EFRAG, GS1)
03:00 - CELLAR Ingestion (official legal acts from CELLAR)
03:30 - Change Tracker (detect regulation updates)
08:00 - Email Notifications (send alerts to users)
```

## Security

### Best Practices

1. **Environment variables:** Never commit `DATABASE_URL` to version control
2. **Log sanitization:** Ensure logs don't contain sensitive data
3. **Access control:** Restrict cron job execution to authorized users
4. **Network security:** Use HTTPS for CELLAR endpoint
5. **Database permissions:** Use read/write user, not admin

### Audit Trail

All ingestion operations are logged with:

- Timestamp
- Operation type (insert/update)
- Regulation CELEX ID
- Success/failure status

## Support

For issues or questions:

1. Check logs: `logs/cellar-ingestion.log`
2. Review this documentation
3. Test manually: `node server/cellar-ingestion-scheduler.mjs`
4. Contact ISA development team

## Appendix: SPARQL Query Examples

### Fetch ESG Regulations (Last 3 Years)

```sparql
PREFIX cdm: <http://publications.europa.eu/ontology/cdm#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT DISTINCT ?act ?actID ?title ?dateEntryIntoForce ?inForce
WHERE {
  ?act cdm:work_id_document ?actID .
  ?act cdm:resource_legal_in-force ?inForce .
  ?act cdm:resource_legal_date_entry-into-force ?dateEntryIntoForce .
  OPTIONAL { ?act rdfs:label ?title } .
  FILTER(?dateEntryIntoForce >= "2022-01-01"^^xsd:date)
  FILTER(
    CONTAINS(LCASE(STR(?title)), "sustainability") ||
    CONTAINS(LCASE(STR(?title)), "environmental") ||
    CONTAINS(LCASE(STR(?title)), "esg")
  )
}
ORDER BY DESC(?dateEntryIntoForce)
LIMIT 500
```

## Version History

- **v1.0.0** (2024-01-15) - Initial deployment
- **v1.1.0** (TBD) - Add change detection and email notifications
- **v2.0.0** (TBD) - Integrate with GS1 standards mapping
