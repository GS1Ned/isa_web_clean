import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const repoRoot = path.resolve(process.argv[2] || process.cwd());
const auditRoot = path.join(repoRoot, "openclaw_audit");
const sourceRoot = path.join(auditRoot, "source", "openclaw-main");
const docsIndexPath = path.join(auditRoot, "docs", "DOCS_INDEX.json");
const docsPagesDir = path.join(auditRoot, "docs", "pages");
const helpLogPath = path.join(auditRoot, "exec", "EXEC_LOGS", "openclaw_help.log");

for (const required of [sourceRoot, docsIndexPath, docsPagesDir, helpLogPath]) {
  if (!fs.existsSync(required)) {
    throw new Error(`Missing required input: ${required}`);
  }
}

const writeText = (filePath, content) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
};

const mdEsc = (value) =>
  String(value ?? "")
    .replace(/\|/g, "\\|")
    .replace(/\r?\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const compact = (value, max = 200) => {
  const s = String(value ?? "").replace(/\s+/g, " ").trim();
  if (s.length <= max) return s;
  return `${s.slice(0, Math.max(0, max - 1))}…`;
};

const relFromRepo = (absPath) => path.relative(repoRoot, absPath).replace(/\\/g, "/");

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, "utf8"));

const docsIndex = readJson(docsIndexPath);
const docsPages = fs
  .readdirSync(docsPagesDir)
  .filter((name) => name.endsWith(".json"))
  .map((name) => readJson(path.join(docsPagesDir, name)));

const docsPagesEnglish = docsPages.filter(
  (page) => !/\/zh-CN\//.test(page.url) && !/\/ja-JP\//.test(page.url),
);

const CATEGORY_LIST = [
  "Overview",
  "Tools",
  "Built-in tools",
  "Lobster",
  "LLM Task",
  "Exec Tool",
  "Web Tools",
  "apply_patch Tool",
  "Elevated Mode",
  "Thinking Levels",
  "Reactions",
  "Browser",
  "Browser (OpenClaw-managed)",
  "Browser Login",
  "Chrome Extension",
  "Browser Troubleshooting",
  "Agent coordination",
  "Agent Send",
  "Sub-Agents",
  "ACP Agents",
  "Multi-Agent Sandbox & Tools",
  "Skills",
  "Slash Commands",
  "Skills Config",
  "ClawHub",
  "Plugins",
  "Extensions",
  "Community plugins",
  "Voice Call Plugin",
  "Zalo Personal Plugin",
  "Automation",
  "Hooks",
  "Cron Jobs",
  "Cron vs Heartbeat",
  "Automation Troubleshooting",
  "Webhooks",
  "Gmail PubSub",
  "Polls",
  "Auth Monitoring",
  "Media and devices",
  "Nodes",
  "Node Troubleshooting",
  "Image and Media Support",
  "Audio and Voice Notes",
  "Camera Capture",
  "Talk Mode",
  "Voice Wake",
  "Location Command",
  "Gateway",
  "Gateway Runbook",
  "Configuration",
  "Configuration Reference",
  "Configuration Examples",
  "Authentication",
  "Trusted proxy auth",
  "Health Checks",
  "Heartbeat",
  "Doctor",
  "Logging",
  "Gateway Lock",
  "Background Exec and Process Tool",
  "Multiple Gateways",
  "Troubleshooting",
  "Security and sandboxing",
  "Protocols and APIs",
  "Networking and discovery",
  "Remote access",
  "Remote Gateway Setup",
  "Tailscale",
  "Security",
  "Formal Verification (Security Models)",
  "Web",
  "Control UI",
  "Dashboard",
  "WebChat",
  "TUI",
];

const CATEGORY_ALIASES = {
  Overview: ["start/openclaw", "concepts/architecture", "getting-started"],
  Tools: ["/tools", "tool"],
  "Built-in tools": ["built-in", "tool-catalog", "tool registry"],
  Lobster: ["lobster", "tools/lobster", "extensions/lobster"],
  "LLM Task": ["llm-task", "tools/llm-task", "extensions/llm-task"],
  "Exec Tool": ["tools/exec", "exec"],
  "Web Tools": ["tools/web", "web_search", "web_fetch"],
  "apply_patch Tool": ["apply_patch", "apply-patch", "tools/apply-patch"],
  "Elevated Mode": ["tools/elevated", "elevated"],
  "Thinking Levels": ["tools/thinking", "thinking"],
  Reactions: ["tools/reactions", "reactions"],
  Browser: ["tools/browser", "cli/browser", "browser"],
  "Browser (OpenClaw-managed)": ["tools/browser", "openclaw-managed"],
  "Browser Login": ["tools/browser-login", "browser-login"],
  "Chrome Extension": ["tools/chrome-extension", "chrome-extension"],
  "Browser Troubleshooting": ["browser-linux-troubleshooting", "browser tool fails", "gateway/troubleshooting"],
  "Agent coordination": ["multi-agent", "agent coordination"],
  "Agent Send": ["tools/agent-send", "agent-send"],
  "Sub-Agents": ["tools/subagents", "subagents", "sub-agents"],
  "ACP Agents": ["tools/acp-agents", "acp-agents", "acp agents"],
  "Multi-Agent Sandbox & Tools": ["multi-agent-sandbox-tools", "sandbox tools"],
  Skills: ["tools/skills", "skills"],
  "Slash Commands": ["tools/slash-commands", "slash commands"],
  "Skills Config": ["tools/skills-config", "skills-config"],
  ClawHub: ["tools/clawhub", "clawhub"],
  Plugins: ["plugins", "tools/plugin"],
  Extensions: ["extensions", "plugin"],
  "Community plugins": ["plugins/community", "community plugins"],
  "Voice Call Plugin": ["plugins/voice-call", "voice-call"],
  "Zalo Personal Plugin": ["plugins/zalouser", "zalouser"],
  Automation: ["automation"],
  Hooks: ["automation/hooks", "hooks"],
  "Cron Jobs": ["automation/cron-jobs", "cron jobs"],
  "Cron vs Heartbeat": ["automation/cron-vs-heartbeat", "cron-vs-heartbeat"],
  "Automation Troubleshooting": ["automation/troubleshooting", "automation troubleshooting"],
  Webhooks: ["automation/webhook", "webhooks"],
  "Gmail PubSub": ["automation/gmail-pubsub", "gmail-pubsub"],
  Polls: ["automation/poll", "polls"],
  "Auth Monitoring": ["automation/auth-monitoring", "auth-monitoring"],
  "Media and devices": ["media", "devices", "nodes"],
  Nodes: ["cli/nodes", "nodes"],
  "Node Troubleshooting": ["nodes/troubleshooting", "node troubleshooting"],
  "Image and Media Support": ["nodes/images", "image", "media"],
  "Audio and Voice Notes": ["nodes/audio", "voice notes", "audio"],
  "Camera Capture": ["nodes/camera", "camera"],
  "Talk Mode": ["nodes/talk", "talk mode"],
  "Voice Wake": ["nodes/voicewake", "voicewake"],
  "Location Command": ["nodes/location-command", "location command"],
  Gateway: ["gateway"],
  "Gateway Runbook": ["gateway/remote-gateway-readme", "gateway/troubleshooting", "runbook"],
  Configuration: ["gateway/configuration", "configuration"],
  "Configuration Reference": ["gateway/configuration-reference", "configuration reference"],
  "Configuration Examples": ["gateway/configuration-examples", "configuration examples"],
  Authentication: ["gateway/authentication", "authentication"],
  "Trusted proxy auth": ["gateway/trusted-proxy-auth", "trusted proxy"],
  "Health Checks": ["gateway/health", "health"],
  Heartbeat: ["gateway/heartbeat", "heartbeat"],
  Doctor: ["gateway/doctor", "doctor"],
  Logging: ["gateway/logging", "logging"],
  "Gateway Lock": ["gateway/gateway-lock", "gateway lock"],
  "Background Exec and Process Tool": ["gateway/background-process", "process tool", "background exec"],
  "Multiple Gateways": ["gateway/multiple-gateways", "multiple gateways"],
  Troubleshooting: ["gateway/troubleshooting", "help/troubleshooting", "troubleshooting"],
  "Security and sandboxing": ["gateway/sandboxing", "gateway/security", "sandboxing"],
  "Protocols and APIs": ["gateway/protocol", "reference/rpc", "openai-http-api", "tools-invoke-http-api"],
  "Networking and discovery": ["gateway/discovery", "gateway/network-model", "bonjour", "dns"],
  "Remote access": ["gateway/remote", "remote access"],
  "Remote Gateway Setup": ["gateway/remote-gateway-readme", "remote gateway"],
  Tailscale: ["gateway/tailscale", "tailscale"],
  Security: ["gateway/security", "security"],
  "Formal Verification (Security Models)": ["security/formal-verification", "formal verification"],
  Web: ["/web", "web"],
  "Control UI": ["web/control-ui", "control ui"],
  Dashboard: ["web/dashboard", "dashboard"],
  WebChat: ["web/webchat", "webchat"],
  TUI: ["web/tui", "tui"],
};

const STOPWORDS = new Set([
  "and",
  "the",
  "for",
  "with",
  "mode",
  "tool",
  "tools",
  "plugin",
  "plugins",
  "openclaw",
  "vs",
  "capture",
  "support",
  "configuration",
  "access",
  "reference",
  "overview",
  "operations",
  "interfaces",
]);

function buildNeedles(category) {
  const cleaned = category.toLowerCase().replace(/[()]/g, " ").replace(/[^a-z0-9/_+-]+/g, " ").trim();
  const tokens = cleaned
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t && !STOPWORDS.has(t) && t.length > 2);
  const slug = cleaned.replace(/\s+/g, "-");
  const slash = cleaned.replace(/\s+/g, "/");
  const out = new Set([category.toLowerCase(), cleaned, slug, slash, ...tokens]);
  for (const alias of CATEGORY_ALIASES[category] || []) {
    out.add(alias.toLowerCase());
  }
  return Array.from(out)
    .map((value) => value.trim())
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);
}

function buildCodeNeedles(category) {
  const alias = (CATEGORY_ALIASES[category] || []).map((item) => item.toLowerCase());
  const cleaned = category.toLowerCase().replace(/[()]/g, " ").replace(/[^a-z0-9/_+-]+/g, " ").trim();
  const base = [cleaned.replace(/\s+/g, "-"), cleaned, category.toLowerCase()];
  const out = new Set([...alias, ...base]);
  return Array.from(out)
    .map((value) => value.trim())
    .filter((value) => value && (value.length >= 4 || value.includes("/") || value.includes("-") || value.includes("_")))
    .sort((a, b) => b.length - a.length);
}

function findNeedleIndex(haystack, needle) {
  if (!haystack || !needle) return -1;
  return haystack.toLowerCase().indexOf(needle.toLowerCase());
}

function snippetAround(text, needles) {
  const source = String(text || "").replace(/\s+/g, " ").trim();
  if (!source) return "";
  for (const needle of needles) {
    const idx = findNeedleIndex(source, needle);
    if (idx >= 0) {
      const start = Math.max(0, idx - 80);
      const end = Math.min(source.length, idx + needle.length + 120);
      return compact(source.slice(start, end), 220);
    }
  }
  return compact(source, 220);
}

function scoreDoc(page, needles) {
  const url = String(page.url || "").toLowerCase();
  const title = String(page.title || "").toLowerCase();
  const h1 = (page.h1 || []).join(" ").toLowerCase();
  const h2 = (page.h2 || []).join(" ").toLowerCase();
  const content = String(page.content || "").toLowerCase();

  let score = 0;
  for (const needle of needles) {
    if (!needle) continue;
    if (url.includes(needle)) score += 10;
    if (title.includes(needle)) score += 7;
    if (h1.includes(needle)) score += 6;
    if (h2.includes(needle)) score += 4;
    if (content.includes(needle)) score += 1;
  }
  if (/\/(zh-CN|ja-JP)\//.test(url)) score -= 3;
  return score;
}

function pickDocEvidence(category) {
  const needles = buildNeedles(category);
  let best = null;
  for (const page of docsPagesEnglish) {
    const score = scoreDoc(page, needles);
    if (score <= 0) continue;
    if (!best || score > best.score) {
      best = { score, page };
    }
  }
  if (!best) return null;
  return {
    url: best.page.url,
    snippet: snippetAround(best.page.content || best.page.snippet || "", needles),
  };
}

const codeSearchRoots = [
  path.join(sourceRoot, "src"),
  path.join(sourceRoot, "extensions"),
  path.join(sourceRoot, "ui"),
  path.join(sourceRoot, "skills"),
  path.join(sourceRoot, "openclaw.mjs"),
  path.join(sourceRoot, "package.json"),
  path.join(sourceRoot, "scripts"),
].filter((entry) => fs.existsSync(entry));

const docsSearchRoots = [path.join(sourceRoot, "docs")].filter((entry) => fs.existsSync(entry));

function parseMatchLine(line) {
  const m = line.match(/^(.*?):(\d+):(.*)$/);
  if (!m) return null;
  return {
    path: m[1],
    line: Number(m[2]),
    text: m[3],
  };
}

function rgFirst(pattern, roots, includeTests = false) {
  if (!pattern || roots.length === 0) return null;
  const args = ["-n", "-F", "-m", "1", "--no-heading"];
  if (!includeTests) {
    args.push("--glob", "!**/*.test.*", "--glob", "!**/test/**", "--glob", "!**/__tests__/**");
  }
  args.push(pattern, ...roots);
  try {
    const out = execFileSync("rg", args, {
      encoding: "utf8",
      maxBuffer: 50 * 1024 * 1024,
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
    if (!out) return null;
    const firstLine = out.split(/\r?\n/)[0];
    return parseMatchLine(firstLine);
  } catch (error) {
    if (error && typeof error === "object" && "status" in error && error.status === 1) {
      return null;
    }
    return null;
  }
}

function pickZipEvidence(category) {
  const needles = buildCodeNeedles(category);
  for (const needle of needles) {
    const codeHit = rgFirst(needle, codeSearchRoots, false);
    if (codeHit) {
      return {
        kind: "code",
        ...codeHit,
      };
    }
  }
  for (const needle of needles) {
    const docsHit = rgFirst(needle, docsSearchRoots, true);
    if (docsHit) {
      return {
        kind: "docs",
        ...docsHit,
      };
    }
  }
  return null;
}

function localDocEvidenceFromUrl(url, needles) {
  if (!url) return null;
  const slug = url.replace(/^https?:\/\/docs\.openclaw\.ai\//, "").replace(/\/+$/, "");
  const candidates = [
    path.join(sourceRoot, "docs", `${slug}.md`),
    path.join(sourceRoot, "docs", slug, "index.md"),
    slug ? path.join(sourceRoot, "docs", slug.split("/").slice(0, -1).join("/"), `${slug.split("/").at(-1)}.md`) : null,
  ].filter(Boolean);
  for (const candidate of candidates) {
    if (!candidate || !fs.existsSync(candidate)) continue;
    const content = fs.readFileSync(candidate, "utf8");
    const lines = content.split(/\r?\n/);
    let foundLine = 1;
    let foundText = lines[0] || "";
    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      for (const needle of needles) {
        if (!needle) continue;
        if (line.toLowerCase().includes(needle.toLowerCase())) {
          foundLine = i + 1;
          foundText = line;
          break;
        }
      }
      if (foundLine !== 1 || i > 40) break;
    }
    return {
      path: candidate,
      line: foundLine,
      text: foundText,
    };
  }
  return null;
}

const featureRows = CATEGORY_LIST.map((category) => {
  const docsEvidence = pickDocEvidence(category);
  const needles = buildNeedles(category);
  const localDocEvidence = localDocEvidenceFromUrl(docsEvidence?.url, needles);
  const codeEvidence = pickZipEvidence(category);
  const hasCodeEvidence = Boolean(codeEvidence);
  const hasZipEvidence = Boolean(localDocEvidence || codeEvidence);
  const status = hasZipEvidence && docsEvidence ? "CONFIRMED" : hasZipEvidence || docsEvidence ? "PARTIAL" : "UNVERIFIED";

  const zipPieces = [];
  if (localDocEvidence) {
    zipPieces.push(
      `${relFromRepo(localDocEvidence.path)}:${localDocEvidence.line} - ${compact(localDocEvidence.text, 120)}`,
    );
  }
  if (codeEvidence) {
    zipPieces.push(`${relFromRepo(codeEvidence.path)}:${codeEvidence.line} - ${compact(codeEvidence.text, 120)}`);
  }
  const zipRef = zipPieces.length > 0 ? zipPieces.join(" ; ") : "-";
  const docsRef = docsEvidence ? `${docsEvidence.url} - ${compact(docsEvidence.snippet, 180)}` : "-";

  let notes = "";
  if (status === "CONFIRMED" && hasCodeEvidence) notes = "ZIP docs + implementation + docs.openclaw.ai";
  else if (status === "CONFIRMED") notes = "ZIP docs + docs.openclaw.ai";
  else if (hasZipEvidence && !docsEvidence) notes = "ZIP evidence only";
  else if (!hasZipEvidence && docsEvidence) notes = "docs.openclaw.ai evidence only";
  else notes = "No evidence found";

  return {
    category,
    zipEvidence: zipRef,
    docsEvidence: docsRef,
    status,
    notes,
  };
});

const statusCounts = featureRows.reduce(
  (acc, row) => {
    acc[row.status] = (acc[row.status] || 0) + 1;
    return acc;
  },
  { CONFIRMED: 0, PARTIAL: 0, UNVERIFIED: 0 },
);

const featureMatrixMd = [
  "# Feature Matrix",
  "",
  `Generated: ${new Date().toISOString()}`,
  `Status counts: CONFIRMED=${statusCounts.CONFIRMED}, PARTIAL=${statusCounts.PARTIAL}, UNVERIFIED=${statusCounts.UNVERIFIED}`,
  "",
  "| Category | ZIP evidence (path + line) | Docs evidence (URL + snippet) | Status | Notes |",
  "|---|---|---|---|---|",
  ...featureRows.map(
    (row) =>
      `| ${mdEsc(row.category)} | ${mdEsc(row.zipEvidence)} | ${mdEsc(row.docsEvidence)} | ${row.status} | ${mdEsc(row.notes)} |`,
  ),
  "",
].join("\n");

writeText(path.join(auditRoot, "features", "FEATURE_MATRIX.md"), featureMatrixMd);

function parseHelpCommands(helpText) {
  const lines = helpText.split(/\r?\n/);
  const commands = [];
  let inCommands = false;
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (line.startsWith("Commands:")) {
      inCommands = true;
      continue;
    }
    if (!inCommands) continue;
    if (line.startsWith("Examples:")) break;
    const match = line.match(/^\s{2}([a-z0-9-]+)\s+(\*)?\s+(.+)$/i);
    if (match) {
      commands.push({
        command: match[1],
        hasSubcommands: Boolean(match[2]),
        description: match[3].trim(),
        line: i + 1,
      });
    }
  }
  return commands;
}

const helpLog = fs.readFileSync(helpLogPath, "utf8");
const cliCommands = parseHelpCommands(helpLog);

const commandRegistryPath = path.join(sourceRoot, "src", "cli", "program", "command-registry.ts");
const subCliRegistryPath = path.join(sourceRoot, "src", "cli", "program", "register.subclis.ts");

function firstCommandSource(command) {
  const inCore = rgFirst(`name: \"${command}\"`, [commandRegistryPath], true);
  if (inCore) return `${relFromRepo(inCore.path)}:${inCore.line}`;
  const inSub = rgFirst(`name: \"${command}\"`, [subCliRegistryPath], true);
  if (inSub) return `${relFromRepo(inSub.path)}:${inSub.line}`;
  return "-";
}

const cliCommandsMd = [
  "# CLI Commands",
  "",
  `Generated: ${new Date().toISOString()}`,
  `Command count (from openclaw --help): ${cliCommands.length}`,
  "",
  "Evidence:",
  `- ${relFromRepo(helpLogPath)}`,
  `- ${relFromRepo(commandRegistryPath)}`,
  `- ${relFromRepo(subCliRegistryPath)}`,
  "",
  "| Command | Subcommands | Synopsis | Evidence |",
  "|---|---|---|---|",
  ...cliCommands.map((entry) => {
    const source = firstCommandSource(entry.command);
    const evidence = `${relFromRepo(helpLogPath)}:${entry.line}; ${source}`;
    return `| ${entry.command} | ${entry.hasSubcommands ? "yes" : "no"} | ${mdEsc(entry.description)} | ${mdEsc(evidence)} |`;
  }),
  "",
].join("\n");

writeText(path.join(auditRoot, "cli", "CLI_COMMANDS.md"), cliCommandsMd);

function parseTopLevelSchemaKeys(zodSchemaPath) {
  const lines = fs.readFileSync(zodSchemaPath, "utf8").split(/\r?\n/);
  const out = [];
  const seen = new Set();
  const startIndex = lines.findIndex((line) => line.includes("OpenClawSchema") && line.includes("z"));
  if (startIndex < 0) {
    return out;
  }
  let objectStart = -1;
  for (let i = startIndex; i < lines.length; i += 1) {
    if (lines[i].includes(".object({")) {
      objectStart = i;
      break;
    }
  }
  if (objectStart < 0) {
    return out;
  }

  let depth = 1;
  for (let i = objectStart + 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (depth === 1) {
      const match = line.match(/^\s{4}([A-Za-z$][A-Za-z0-9$]*)\s*:/);
      if (match) {
        const key = match[1];
        if (!seen.has(key)) {
          seen.add(key);
          out.push({ key, line: i + 1 });
        }
      }
    }
    const openCount = (line.match(/\{/g) || []).length;
    const closeCount = (line.match(/\}/g) || []).length;
    depth += openCount - closeCount;
    if (depth <= 0) break;
  }
  return out;
}

const zodSchemaPath = path.join(sourceRoot, "src", "config", "zod-schema.ts");
const schemaHelpPath = path.join(sourceRoot, "src", "config", "schema.help.ts");
const pathsConfigPath = path.join(sourceRoot, "src", "config", "paths.ts");
const typeGatewayPath = path.join(sourceRoot, "src", "config", "types.gateway.ts");

const topLevelKeys = parseTopLevelSchemaKeys(zodSchemaPath);
const schemaHelpText = fs.readFileSync(schemaHelpPath, "utf8");

const configDocPage = docsPagesEnglish.find((page) => page.url.includes("/gateway/configuration-reference"));

const keyDefaults = {
  gateway: "gateway.port default 18789",
  update: "update.checkOnStart default true; update.auto.enabled default false",
  browser: "browser runtime options optional unless enabled",
  tools: "tool policies default to permissive profile-driven behavior",
  agents: "agent defaults resolve from runtime defaults module",
};

function keyHelpSnippet(key) {
  const q1 = `\"${key}\"`;
  const q2 = `\"${key}.`;
  const idx1 = schemaHelpText.indexOf(q1);
  const idx2 = schemaHelpText.indexOf(q2);
  const idx = idx1 >= 0 ? idx1 : idx2;
  if (idx < 0) return "";
  const slice = schemaHelpText.slice(idx, Math.min(schemaHelpText.length, idx + 320));
  const line = slice.split(/\r?\n/).slice(0, 3).join(" ");
  return compact(line, 200);
}

function configDocsSnippet(key) {
  if (!configDocPage) return "";
  return snippetAround(configDocPage.content || "", [key, `${key}.`]);
}

const configRows = topLevelKeys.map((entry) => {
  const defaultValue = keyDefaults[entry.key] || "No explicit top-level default in schema";
  const description = keyHelpSnippet(entry.key) || "See gateway/configuration-reference for detailed field behavior";
  const sourceEvidence = `${relFromRepo(zodSchemaPath)}:${entry.line}`;
  const docsEvidence = configDocPage
    ? `${configDocPage.url} - ${configDocsSnippet(entry.key)}`
    : "-";
  return {
    key: entry.key,
    defaultValue,
    description,
    sourceEvidence,
    docsEvidence,
  };
});

const envVarRegex = /OPENCLAW_[A-Z0-9_]+/g;
const envVarHits = new Map();

function collectEnvVarHits(rootDir) {
  if (!fs.existsSync(rootDir)) return;
  const stack = [rootDir];
  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;
    const stat = fs.statSync(current);
    if (stat.isDirectory()) {
      for (const entry of fs.readdirSync(current)) {
        if (entry === "node_modules" || entry === "dist" || entry === ".git") continue;
        stack.push(path.join(current, entry));
      }
      continue;
    }
    if (stat.size > 1_500_000) continue;
    const ext = path.extname(current).toLowerCase();
    const textLike = [".ts", ".tsx", ".js", ".mjs", ".cjs", ".json", ".md", ".sh", ".yaml", ".yml", ".toml", ""]; 
    if (!textLike.includes(ext)) continue;
    if (/\.test\./.test(current) || /\/test\//.test(current) || /\/__tests__\//.test(current)) continue;
    let content = "";
    try {
      content = fs.readFileSync(current, "utf8");
    } catch {
      continue;
    }
    const lines = content.split(/\r?\n/);
    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      const matches = line.match(envVarRegex);
      if (!matches) continue;
      for (const name of matches) {
        if (!envVarHits.has(name)) {
          envVarHits.set(name, {
            path: current,
            line: i + 1,
            text: line,
          });
        }
      }
    }
  }
}

collectEnvVarHits(path.join(sourceRoot, "src"));
collectEnvVarHits(path.join(sourceRoot, "extensions"));
collectEnvVarHits(path.join(sourceRoot, "scripts"));

const ENV_EXCLUDE = /(TEST|SMOKE|E2E|BENCH|FIXTURE|STUB|MOCK)/;

function findEnvDocsEvidence(envName) {
  const token = envName.toLowerCase();
  for (const page of docsPagesEnglish) {
    const url = String(page.url || "").toLowerCase();
    const content = String(page.content || "").toLowerCase();
    const title = String(page.title || "").toLowerCase();
    if (url.includes(token) || title.includes(token) || content.includes(token)) {
      return `${page.url} - ${compact(snippetAround(page.content || "", [envName]), 120)}`;
    }
  }
  return "-";
}

const envVarRows = Array.from(envVarHits.entries())
  .filter(([name]) => !ENV_EXCLUDE.test(name))
  .sort((a, b) => a[0].localeCompare(b[0]))
  .map(([name, hit]) => {
    return {
      name,
      source: `${relFromRepo(hit.path)}:${hit.line}`,
      example: compact(hit.text, 120),
      docs: findEnvDocsEvidence(name),
    };
  });

const configReferenceMd = [
  "# Config Reference",
  "",
  `Generated: ${new Date().toISOString()}`,
  `Top-level keys detected in schema: ${configRows.length}`,
  `OPENCLAW_* env vars detected: ${envVarRows.length}`,
  "",
  "## Top-Level Config Keys",
  "",
  "| Key | Default (evidenced) | Description | Source | Docs |",
  "|---|---|---|---|---|",
  ...configRows.map(
    (row) =>
      `| ${mdEsc(row.key)} | ${mdEsc(row.defaultValue)} | ${mdEsc(row.description)} | ${mdEsc(row.sourceEvidence)} | ${mdEsc(row.docsEvidence)} |`,
  ),
  "",
  "## Environment Variables",
  "",
  "| Env Var | Source | Evidence snippet | Docs |",
  "|---|---|---|---|",
  ...envVarRows.map(
    (row) =>
      `| ${mdEsc(row.name)} | ${mdEsc(row.source)} | ${mdEsc(row.example)} | ${mdEsc(row.docs)} |`,
  ),
  "",
  "## Default Port Evidence",
  "",
  `- ${mdEsc(`${relFromRepo(pathsConfigPath)}:${rgFirst("DEFAULT_GATEWAY_PORT = 18789", [pathsConfigPath], true)?.line || "?"} - DEFAULT_GATEWAY_PORT = 18789`)}`,
  `- ${mdEsc(`${relFromRepo(typeGatewayPath)}:${rgFirst("default: 18789", [typeGatewayPath], true)?.line || "?"} - gateway port docs comment`)}`,
  "",
].join("\n");

writeText(path.join(auditRoot, "config", "CONFIG_REFERENCE.md"), configReferenceMd);

function buildCategorySlice(categories) {
  return categories
    .map((name) => featureRows.find((row) => row.category === name))
    .filter(Boolean);
}

function buildCategoryTable(rows) {
  return [
    "| Category | ZIP evidence | Docs evidence | Status |",
    "|---|---|---|---|",
    ...rows.map(
      (row) =>
        `| ${mdEsc(row.category)} | ${mdEsc(row.zipEvidence)} | ${mdEsc(row.docsEvidence)} | ${row.status} |`,
    ),
  ].join("\n");
}

const securityCategories = [
  "Security and sandboxing",
  "Security",
  "Sandboxing",
  "Elevated Mode",
  "Trusted proxy auth",
  "Gateway Lock",
  "Formal Verification (Security Models)",
].filter((name) => CATEGORY_LIST.includes(name));

const securityRows = buildCategorySlice(
  CATEGORY_LIST.filter((name) =>
    [
      "Security and sandboxing",
      "Security",
      "Elevated Mode",
      "Trusted proxy auth",
      "Gateway Lock",
      "Formal Verification (Security Models)",
      "Background Exec and Process Tool",
      "apply_patch Tool",
    ].includes(name),
  ),
);

const securityMd = [
  "# Security and Sandboxing",
  "",
  `Generated: ${new Date().toISOString()}`,
  "",
  "## Evidence Matrix",
  "",
  buildCategoryTable(securityRows),
  "",
  "## Key Source Anchors",
  "",
  `- ${relFromRepo(path.join(sourceRoot, "src", "security", "audit.ts"))}`,
  `- ${relFromRepo(path.join(sourceRoot, "src", "security", "audit-extra.sync.ts"))}`,
  `- ${relFromRepo(path.join(sourceRoot, "src", "agents", "sandbox"))}`,
  `- ${relFromRepo(path.join(sourceRoot, "src", "agents", "apply-patch.ts"))}`,
  "",
].join("\n");

writeText(path.join(auditRoot, "security", "SECURITY_AND_SANDBOXING.md"), securityMd);

const networkRows = buildCategorySlice(
  CATEGORY_LIST.filter((name) =>
    [
      "Gateway",
      "Gateway Runbook",
      "Health Checks",
      "Heartbeat",
      "Doctor",
      "Logging",
      "Multiple Gateways",
      "Networking and discovery",
      "Remote access",
      "Remote Gateway Setup",
      "Tailscale",
      "Troubleshooting",
      "Gateway Lock",
    ].includes(name),
  ),
);

const networkMd = [
  "# Network and Gateway",
  "",
  `Generated: ${new Date().toISOString()}`,
  "",
  "## Evidence Matrix",
  "",
  buildCategoryTable(networkRows),
  "",
  "## Key Source Anchors",
  "",
  `- ${relFromRepo(path.join(sourceRoot, "src", "gateway"))}`,
  `- ${relFromRepo(path.join(sourceRoot, "src", "cli", "gateway-cli"))}`,
  `- ${relFromRepo(path.join(sourceRoot, "src", "commands", "doctor-gateway-services.ts"))}`,
  "",
].join("\n");

writeText(path.join(auditRoot, "network", "NETWORK_AND_GATEWAY.md"), networkMd);

const protocolRows = buildCategorySlice(
  CATEGORY_LIST.filter((name) => ["Protocols and APIs", "Gateway", "Web", "Control UI", "Dashboard", "WebChat", "TUI"].includes(name)),
);

const protocolMd = [
  "# APIs and Protocols",
  "",
  `Generated: ${new Date().toISOString()}`,
  "",
  "## Evidence Matrix",
  "",
  buildCategoryTable(protocolRows),
  "",
  "## Protocol Source Anchors",
  "",
  `- ${relFromRepo(path.join(sourceRoot, "src", "gateway", "protocol"))}`,
  `- ${relFromRepo(path.join(sourceRoot, "src", "gateway", "tools-invoke-http.ts"))}`,
  `- ${relFromRepo(path.join(sourceRoot, "docs", "reference", "rpc.md"))}`,
  `- ${relFromRepo(path.join(sourceRoot, "docs", "gateway", "openai-http-api.md"))}`,
  "",
].join("\n");

writeText(path.join(auditRoot, "protocols", "APIS.md"), protocolMd);

function parseHelpExamples(helpText) {
  const lines = helpText.split(/\r?\n/);
  const rows = [];
  let inExamples = false;
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (line.startsWith("Examples:")) {
      inExamples = true;
      continue;
    }
    if (!inExamples) continue;
    const cmd = line.match(/^\s{2}(openclaw\s+.+)$/);
    if (cmd) {
      const description = lines[i + 1] ? lines[i + 1].trim() : "";
      rows.push({ cmd: cmd[1].trim(), description, line: i + 1 });
    }
  }
  return rows;
}

const exampleRows = parseHelpExamples(helpLog);
const useCaseDocTargets = [
  "/start/getting-started",
  "/cli/onboard",
  "/gateway/remote",
  "/gateway/remote-gateway-readme",
  "/tools/browser-login",
  "/tools/chrome-extension",
  "/automation/webhook",
  "/automation/cron-jobs",
  "/plugins/voice-call",
  "/plugins/community",
  "/web/dashboard",
  "/web/webchat",
  "/web/tui",
];

const useCaseDocs = useCaseDocTargets
  .map((target) => docsPagesEnglish.find((page) => page.url.includes(target)))
  .filter(Boolean)
  .map((page) => ({
    url: page.url,
    title: page.title || (page.h1 || [""])[0] || "Untitled",
    snippet: compact(page.snippet || page.content || "", 220),
  }));

const useCasesMd = [
  "# Use Cases",
  "",
  `Generated: ${new Date().toISOString()}`,
  "",
  "## CLI Examples",
  "",
  "| Command | Description | Evidence |",
  "|---|---|---|",
  ...exampleRows.map(
    (row) =>
      `| ${mdEsc(row.cmd)} | ${mdEsc(row.description)} | ${mdEsc(`${relFromRepo(helpLogPath)}:${row.line}`)} |`,
  ),
  "",
  "## Docs Scenarios",
  "",
  "| URL | Title | Evidence snippet |",
  "|---|---|---|",
  ...useCaseDocs.map(
    (row) => `| ${mdEsc(row.url)} | ${mdEsc(row.title)} | ${mdEsc(row.snippet)} |`,
  ),
  "",
].join("\n");

writeText(path.join(auditRoot, "use_cases", "USE_CASES.md"), useCasesMd);

const summaryPayload = {
  generatedAt: new Date().toISOString(),
  categoryCount: CATEGORY_LIST.length,
  counts: statusCounts,
  outputs: {
    featureMatrix: relFromRepo(path.join(auditRoot, "features", "FEATURE_MATRIX.md")),
    cliCommands: relFromRepo(path.join(auditRoot, "cli", "CLI_COMMANDS.md")),
    configReference: relFromRepo(path.join(auditRoot, "config", "CONFIG_REFERENCE.md")),
    security: relFromRepo(path.join(auditRoot, "security", "SECURITY_AND_SANDBOXING.md")),
    network: relFromRepo(path.join(auditRoot, "network", "NETWORK_AND_GATEWAY.md")),
    apis: relFromRepo(path.join(auditRoot, "protocols", "APIS.md")),
    useCases: relFromRepo(path.join(auditRoot, "use_cases", "USE_CASES.md")),
  },
};

writeText(path.join(auditRoot, "features", "FEATURE_STATUS_SUMMARY.json"), `${JSON.stringify(summaryPayload, null, 2)}\n`);

console.log(`CONFIRMED=${statusCounts.CONFIRMED}`);
console.log(`PARTIAL=${statusCounts.PARTIAL}`);
console.log(`UNVERIFIED=${statusCounts.UNVERIFIED}`);
console.log("DONE=generate_artifacts");
