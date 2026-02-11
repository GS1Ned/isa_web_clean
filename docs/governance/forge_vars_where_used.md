# Where BUILT_IN_FORGE_API_* is referenced

timestamp_utc=2026-02-11T13:45:41Z
repo_root=/Users/frisowempe/isa_web_clean
head_sha=307d6ca023ee3850025807309532128f0e6b996b

## Grep in repo (code + configs)

./docs/ASK_ISA_TEST_RESULTS.md:7:1. **API URL**: Changed from `forge.manus.im` to `api.openai.com`
./client/src/components/Map.tsx:89:const API_KEY = import.meta.env.VITE_FRONTEND_FORGE_API_KEY;
./client/src/components/Map.tsx:91:  import.meta.env.VITE_FRONTEND_FORGE_API_URL ||
./client/src/components/Map.tsx:92:  "https://forge.butterfly-effect.dev";
./docs/DEVELOPMENT_PROGRESS_2026-02-01.md:14:- Changed API URL from forge.manus.im to api.openai.com
./server/storage.ts:9:  const baseUrl = ENV.forgeApiUrl;
./server/storage.ts:10:  const apiKey = ENV.forgeApiKey;
./server/storage.ts:14:      "Storage proxy credentials missing: set BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY"
./server/_core/voiceTranscription.ts:83:    if (!ENV.forgeApiUrl) {
./server/_core/voiceTranscription.ts:87:        details: "BUILT_IN_FORGE_API_URL is not set",
./server/_core/voiceTranscription.ts:90:    if (!ENV.forgeApiKey) {
./server/_core/voiceTranscription.ts:94:        details: "BUILT_IN_FORGE_API_KEY is not set",
./server/_core/voiceTranscription.ts:153:    const baseUrl = ENV.forgeApiUrl.endsWith("/")
./server/_core/voiceTranscription.ts:154:      ? ENV.forgeApiUrl
./server/_core/voiceTranscription.ts:155:      : `${ENV.forgeApiUrl}/`;
./server/_core/voiceTranscription.ts:162:        authorization: `Bearer ${ENV.forgeApiKey}`,
./server/_core/imageGeneration.ts:37:  if (!ENV.forgeApiUrl) {
./server/_core/imageGeneration.ts:38:    throw new Error("BUILT_IN_FORGE_API_URL is not configured");
./server/_core/imageGeneration.ts:40:  if (!ENV.forgeApiKey) {
./server/_core/imageGeneration.ts:41:    throw new Error("BUILT_IN_FORGE_API_KEY is not configured");
./server/_core/imageGeneration.ts:45:  const baseUrl = ENV.forgeApiUrl.endsWith("/")
./server/_core/imageGeneration.ts:46:    ? ENV.forgeApiUrl
./server/_core/imageGeneration.ts:47:    : `${ENV.forgeApiUrl}/`;
./server/_core/imageGeneration.ts:59:      authorization: `Bearer ${ENV.forgeApiKey}`,
./server/_core/env.ts:100:  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
./server/_core/env.ts:101:  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
./docs/governance/ISA_MANUS_PROJECT_GOVERNANCE.md:168:| BUILT_IN_FORGE_API_URL      | Variable | Manus internal API base       |
./docs/governance/ISA_MANUS_PROJECT_GOVERNANCE.md:169:| BUILT_IN_FORGE_API_KEY      | Secret   | Manus internal API key        |
./docs/governance/ISA_MANUS_PROJECT_GOVERNANCE.md:170:| VITE_FRONTEND_FORGE_API_URL | Variable | Frontend-accessible Forge URL |
./server/_core/dataApi.ts:20:  if (!ENV.forgeApiUrl) {
./server/_core/dataApi.ts:21:    throw new Error("BUILT_IN_FORGE_API_URL is not configured");
./server/_core/dataApi.ts:23:  if (!ENV.forgeApiKey) {
./server/_core/dataApi.ts:24:    throw new Error("BUILT_IN_FORGE_API_KEY is not configured");
./server/_core/dataApi.ts:28:  const baseUrl = ENV.forgeApiUrl.endsWith("/")
./server/_core/dataApi.ts:29:    ? ENV.forgeApiUrl
./server/_core/dataApi.ts:30:    : `${ENV.forgeApiUrl}/`;
./server/_core/dataApi.ts:42:      authorization: `Bearer ${ENV.forgeApiKey}`,
./server/_core/notification.ts:71:  if (!ENV.forgeApiUrl) {
./server/_core/notification.ts:78:  if (!ENV.forgeApiKey) {
./server/_core/notification.ts:85:  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
./server/_core/notification.ts:92:        authorization: `Bearer ${ENV.forgeApiKey}`,
./server/_core/llm.ts:218:  ENV.forgeApiUrl && ENV.forgeApiUrl.trim().length > 0
./server/_core/llm.ts:219:    ? `${ENV.forgeApiUrl.replace(/\/$/, "")}/v1/chat/completions`
./server/_core/llm.ts:223:  // Use forgeApiKey if forgeApiUrl is configured, otherwise use openaiApiKey
./server/_core/llm.ts:224:  if (ENV.forgeApiUrl && ENV.forgeApiUrl.trim().length > 0) {
./server/_core/llm.ts:225:    if (!ENV.forgeApiKey) {
./server/_core/llm.ts:226:      throw new Error("BUILT_IN_FORGE_API_KEY is not configured but FORGE_API_URL is set");
./server/_core/llm.ts:228:    return ENV.forgeApiKey;
./server/_core/map.ts:22:  const baseUrl = ENV.forgeApiUrl;
./server/_core/map.ts:23:  const apiKey = ENV.forgeApiKey;
./server/_core/map.ts:27:      "Google Maps proxy credentials missing: set BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY"
./isa-archive/manus-tasks/docs__research__manus_research_findings.md:142:- Risk of drifting off-topic or forgetting earlier goals
./docs/DEPLOYMENT.md:53:BUILT_IN_FORGE_API_URL=<manus-api-url>
./docs/DEPLOYMENT.md:54:BUILT_IN_FORGE_API_KEY=<manus-api-key>
./docs/DEPLOYMENT.md:55:VITE_FRONTEND_FORGE_API_KEY=<frontend-api-key>
./docs/DEPLOYMENT.md:56:VITE_FRONTEND_FORGE_API_URL=<frontend-api-url>
./docs/DEPLOYMENT_GUIDE.md:210:BUILT_IN_FORGE_API_URL=<auto-configured>
./docs/DEPLOYMENT_GUIDE.md:211:BUILT_IN_FORGE_API_KEY=<auto-configured>
./docs/spec/ops/CRON_DEPLOYMENT.md:18:- Notification system configured (via `BUILT_IN_FORGE_API_KEY` env var)
./docs/spec/ops/CRON_DEPLOYMENT.md:159:1. Verify notification system is configured: `echo $BUILT_IN_FORGE_API_KEY`
./isa-archive/docs/agent-prompts/CHATGPT_PROMPT_BATCH_INGEST_02_04_05_06.md:41:- Don't forget indexes - add indexes on foreign keys and frequently queried columns
./isa-archive/docs/agent-prompts/CHATGPT_PROMPT_BATCH_INGEST_02_04_05_06.md:44:- Don't forget CLI support - Add `if (import.meta.url === \`file://\${process.argv[1]}\`) { ... }`
./docs/spec/ARCHITECTURE.md:353:- `BUILT_IN_FORGE_API_KEY` - LLM API access (server-side)
./docs/spec/ARCHITECTURE.md:354:- `VITE_FRONTEND_FORGE_API_KEY` - LLM API access (frontend)

## .env* files (values redacted in output)

### .env
7:BUILT_IN_FORGE_API_URL=
8:BUILT_IN_FORGE_API_KEY=

### .env.example
7:BUILT_IN_FORGE_API_URL=
8:BUILT_IN_FORGE_API_KEY=


## GitHub (names only)

### gh secret list

### gh variable list
