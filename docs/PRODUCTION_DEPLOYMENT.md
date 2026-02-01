# ISA Production Deployment Guide

## Overview

This document describes the production deployment process for the Intelligent Standards Assistant (ISA). ISA is deployed on Replit and uses TiDB Serverless for the database.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        ISA Production                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐   │
│  │   Client     │    │   Server     │    │   Database   │   │
│  │   (React)    │◄──►│   (Node.js)  │◄──►│   (TiDB)     │   │
│  │   Vite       │    │   Express    │    │   Serverless │   │
│  └──────────────┘    └──────────────┘    └──────────────┘   │
│                              │                               │
│                              ▼                               │
│                      ┌──────────────┐                        │
│                      │   OpenAI     │                        │
│                      │   API        │                        │
│                      └──────────────┘                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Environment Variables

The following environment variables must be configured in the production environment:

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | TiDB Serverless connection string | Yes |
| `OPENAI_API_KEY` | OpenAI API key for embeddings and LLM | Yes |
| `OPENAI_API_BASE` | OpenAI API base URL (optional) | No |
| `NODE_ENV` | Set to `production` | Yes |
| `SESSION_SECRET` | Secret for session encryption | Yes |

## Deployment Process

### Automatic Deployment (Recommended)

1. **Push to main branch**: Any push to the `main` branch triggers automatic deployment via Replit's Git integration.

2. **GitHub Actions**: The `deploy-production.yml` workflow runs:
   - Type checking
   - Linting
   - Unit tests
   - Build verification

3. **Replit Auto-Deploy**: Replit automatically detects changes and rebuilds the application.

### Manual Deployment

1. **Trigger workflow**: Go to GitHub Actions → Deploy to Production → Run workflow

2. **Select environment**: Choose `production` or `staging`

3. **Monitor deployment**: Watch the workflow progress in GitHub Actions

## GS1 NL Content Updates

### Updating Datamodels

When new versions of GS1 Benelux datamodels are released:

1. Download the new Excel files from GS1 Benelux documentation portal
2. Place files in `data/gs1nl/` directory
3. Run the appropriate parser script:
   ```bash
   # For FMCG datamodel
   python3 scripts/parse_gs1nl_datamodel.py
   
   # For DIY datamodel
   python3 scripts/parse_gs1nl_diy_datamodel.py
   
   # For Healthcare datamodel
   python3 scripts/parse_gs1nl_healthcare_datamodel.py
   ```
4. Run the ingestion script:
   ```bash
   python3 scripts/ingest_gs1nl_sector_content.py
   ```

### Current Content Statistics

| Dataset | Count | Version |
|---------|-------|---------|
| FMCG Benelux Datamodel | 476 | v3.1.34.2 |
| DIY Datamodel | 3,007 | v3.1.34.1 |
| Healthcare Datamodel | 185 | v3.1.34 |
| Sustainability Guidance | 5 | v1.0 |

## Monitoring

### Health Checks

- **API Health**: `GET /api/health`
- **Database Health**: `GET /api/health/db`
- **Embedding Service**: `GET /api/health/embeddings`

### Logs

Logs are available in the Replit console and can be filtered by:
- `[AskISA]` - Ask ISA query processing
- `[HybridSearch]` - Search operations
- `[news-fetcher]` - News pipeline operations
- `[embedding]` - Embedding generation

## Rollback Procedure

1. **Identify issue**: Check logs for errors
2. **Revert commit**: `git revert <commit-hash>`
3. **Push to main**: Triggers automatic redeployment
4. **Verify rollback**: Check health endpoints

## Security Considerations

- All database connections use SSL/TLS
- API keys are stored in environment variables, never in code
- User sessions are encrypted
- CORS is configured for production domain only

## Contact

For deployment issues, contact the ISA development team.
