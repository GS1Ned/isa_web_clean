import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { appRouter } from "../server/routers.ts";
import type { ProcedureRouterRecord } from "@trpc/server";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOC_PATH = path.resolve(__dirname, "../docs/API_REFERENCE.md");
const ROUTERS_PATH = path.resolve(__dirname, "../server/routers.ts");
const ROUTER_DIR = path.resolve(__dirname, "../server/routers");
const RATE_LIMIT_PATH = path.resolve(__dirname, "../server/_core/rate-limit.ts");

const PROCEDURE_TYPE_LABELS: Record<string, string> = {
  query: "Query",
  mutation: "Mutation",
  subscription: "Subscription",
};

type RateLimitConfig = {
  name: string;
  windowMs?: number;
  max?: number;
  messageCode?: string;
};

const sanitizeAnchor = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const toTypeName = (pathValue: string, suffix: string) => {
  const parts = pathValue.split(".").map(part =>
    part
      .replace(/[^a-zA-Z0-9]/g, " ")
      .split(" ")
      .filter(Boolean)
      .map(word => word[0]?.toUpperCase() + word.slice(1))
      .join("")
  );

  return `${parts.join("")}${suffix}`;
};

const formatDuration = (ms?: number) => {
  if (!ms) return "—";
  const minutes = Math.round(ms / 60000);
  if (minutes >= 60) {
    const hours = Math.round(minutes / 60);
    return `${hours} hour${hours === 1 ? "" : "s"}`;
  }
  return `${minutes} minute${minutes === 1 ? "" : "s"}`;
};

const safeEvalMath = (expression: string) => {
  const trimmed = expression.replace(/\s+/g, "");
  if (!/^[\d+\-*/().]+$/.test(trimmed)) {
    return undefined;
  }
  try {
    // eslint-disable-next-line no-new-func
    return Function(`return (${trimmed});`)();
  } catch {
    return undefined;
  }
};

const parseRateLimits = (source: string): RateLimitConfig[] => {
  const configs: RateLimitConfig[] = [];
  const limiterRegex =
    /export const (\w+) = createNamedRateLimiter\(\{([\s\S]*?)\}\);/g;
  for (const match of source.matchAll(limiterRegex)) {
    const [, name, body] = match;
    const windowMatch = body.match(/windowMs:\s*([^,]+),/);
    const maxMatch = body.match(/max:\s*(\d+)/);
    const codeMatch = body.match(/code:\s*"([A-Z_]+)"/);
    const windowMs = windowMatch ? safeEvalMath(windowMatch[1]) : undefined;
    configs.push({
      name,
      windowMs: typeof windowMs === "number" ? windowMs : undefined,
      max: maxMatch ? Number(maxMatch[1]) : undefined,
      messageCode: codeMatch?.[1],
    });
  }
  return configs;
};

type ProcedureInfo = {
  path: string;
  type: string;
  auth: "public" | "protected";
  inputType: string;
  outputType: string;
  exampleInput: string;
  hasInput: boolean;
};

const exampleForZod = (schema: any): unknown => {
  if (!schema || typeof schema !== "object") return null;
  const def = schema._def ?? schema.def;
  const type = def?.type ?? def?.typeName;
  switch (type) {
    case "string":
      return "string";
    case "number":
      return 0;
    case "boolean":
      return true;
    case "date":
      return new Date().toISOString();
    case "literal":
      return def.value ?? def.values?.[0] ?? "literal";
    case "enum":
      return def.entries?.[0] ?? def.values?.[0] ?? "enum";
    case "array":
      return [exampleForZod(def.element ?? def.type)];
    case "tuple":
      return (def.items ?? []).map((item: any) => exampleForZod(item));
    case "object": {
      const shape = typeof def.shape === "function" ? def.shape() : def.shape;
      if (!shape) return {};
      return Object.fromEntries(
        Object.entries(shape).map(([key, value]) => [key, exampleForZod(value)])
      );
    }
    case "optional":
    case "nullable":
    case "nullish":
      return exampleForZod(def.innerType ?? def.type);
    case "union":
      return exampleForZod(def.options?.[0]);
    case "record":
      return { key: exampleForZod(def.valueType ?? def.value) };
    case "map":
      return { key: exampleForZod(def.valueType ?? def.value) };
    case "set":
      return [exampleForZod(def.valueType ?? def.value)];
    case "unknown":
    case "any":
      return null;
    case "bigint":
      return 0;
    case "lazy":
      return exampleForZod(def.getter?.());
    case "effects":
      return exampleForZod(def.schema ?? def.inner);
    case "nativeEnum":
      return Object.values(def.values ?? {})[0] ?? "enum";
    default:
      return null;
  }
};

const formatJson = (value: unknown) =>
  JSON.stringify(value, null, 2).replace(/\n$/, "");

const buildProcedures = (procedures: ProcedureRouterRecord) => {
  const list: ProcedureInfo[] = [];
  for (const [pathKey, procedure] of Object.entries(procedures)) {
    const def = (procedure as any)._def ?? {};
    const inputs = def.inputs ?? [];
    const schema = inputs[0];
    const exampleInput = schema ? formatJson(exampleForZod(schema)) : "null";
    const auth = def.middlewares && def.middlewares.length > 0 ? "protected" : "public";
    list.push({
      path: pathKey,
      type: def.type ?? "query",
      auth,
      inputType: toTypeName(pathKey, "Input"),
      outputType: toTypeName(pathKey, "Output"),
      exampleInput,
      hasInput: Boolean(schema),
    });
  }
  return list.sort((a, b) => a.path.localeCompare(b.path));
};

const groupByRouter = (procedures: ProcedureInfo[]) => {
  const grouped = new Map<string, ProcedureInfo[]>();
  for (const procedure of procedures) {
    const [root] = procedure.path.split(".");
    const existing = grouped.get(root) ?? [];
    existing.push(procedure);
    grouped.set(root, existing);
  }
  return [...grouped.entries()].sort(([a], [b]) => a.localeCompare(b));
};

const renderTypeDefinition = (info: ProcedureInfo) => {
  const pathParts = info.path.split(".");
  const inputAccessor = pathParts
    .map(part => `["${part}"]`)
    .join("");
  const outputAccessor = inputAccessor;
  return [
    `type ${info.inputType} = inferRouterInputs<AppRouter>${inputAccessor};`,
    `type ${info.outputType} = inferRouterOutputs<AppRouter>${outputAccessor};`,
  ].join("\n");
};

const main = async () => {
  const routerSource = await fs.readFile(ROUTERS_PATH, "utf-8");
  const routerDirEntries = await fs.readdir(ROUTER_DIR, { withFileTypes: true });
  const routerFiles = routerDirEntries
    .filter(
      entry =>
        entry.isFile() &&
        entry.name.endsWith(".ts") &&
        !entry.name.endsWith(".test.ts")
    )
    .map(entry => path.join("server/routers", entry.name))
    .sort((a, b) => a.localeCompare(b));

  void routerSource;

  const rateLimitSource = await fs.readFile(RATE_LIMIT_PATH, "utf-8");
  const rateLimits = parseRateLimits(rateLimitSource);

  const procedures = buildProcedures(appRouter._def.procedures);
  const grouped = groupByRouter(procedures);

  const lines: string[] = [];
  lines.push("# ISA tRPC API Reference");
  lines.push("");
  lines.push("Generated by `scripts/generate-api-docs.ts`. Run:");
  lines.push("");
  lines.push("```bash");
  lines.push("npx tsx scripts/generate-api-docs.ts");
  lines.push("```");
  lines.push("");
  lines.push("## Overview");
  lines.push("");
  lines.push(
    "This reference documents all public tRPC procedures exported by the ISA server, including inputs, outputs, authentication requirements, and usage examples. The document is generated from the router source and runtime procedure definitions to stay in sync with the codebase."
  );
  lines.push("");
  lines.push("## Router Sources");
  lines.push("");
  lines.push("The generator scans the following files:");
  lines.push("");
  lines.push("- `server/routers.ts`");
  routerFiles.forEach(file => lines.push(`- \`${file}\``));
  lines.push("");
  lines.push("## Authentication");
  lines.push("");
  lines.push(
    "Procedures are marked as **public** (no session required) or **protected** (requires an authenticated session). Protected procedures expect a valid session cookie or equivalent authentication context when called through the API."
  );
  lines.push("");
  lines.push("## Rate Limiting & Quotas");
  lines.push("");
  lines.push("The API enforces the following rate limits (per IP):");
  lines.push("");
  lines.push("| Limiter | Window | Max Requests | Error Code |");
  lines.push("| --- | --- | --- | --- |");
  rateLimits.forEach(limit => {
    lines.push(
      `| ${limit.name} | ${formatDuration(limit.windowMs)} | ${limit.max ?? "—"} | ${limit.messageCode ?? "—"} |`
    );
  });
  lines.push("");
  lines.push("## Error Handling");
  lines.push("");
  lines.push("Common error codes returned by the API:");
  lines.push("");
  lines.push("- `UNAUTHORIZED` — Authentication required or session expired.");
  lines.push("- `FORBIDDEN` — Authenticated but lacking permissions.");
  lines.push("- `BAD_REQUEST` — Invalid input payload.");
  lines.push("- `NOT_FOUND` — Requested resource not found.");
  lines.push("- `INTERNAL_SERVER_ERROR` — Unhandled server error.");
  lines.push("- `RATE_LIMIT_EXCEEDED` — API rate limit exceeded.");
  lines.push("- `AUTH_RATE_LIMIT_EXCEEDED` — Authentication rate limit exceeded.");
  lines.push("");
  lines.push("## Shared Types");
  lines.push("");
  lines.push(
    "Shared input/output shapes are defined in `shared/`. Use these modules alongside `AppRouter` to strongly type client usage."
  );
  lines.push("");
  lines.push("## Procedure Index");
  lines.push("");

  grouped.forEach(([routerName, routerProcedures]) => {
    lines.push(`### ${routerName}`);
    lines.push("");
    lines.push("| Procedure | Type | Auth | Input Type | Output Type |");
    lines.push("| --- | --- | --- | --- | --- |");
    routerProcedures.forEach(proc => {
      const anchor = sanitizeAnchor(`type-${proc.path}`);
      lines.push(
        `| \`${proc.path}\` | ${PROCEDURE_TYPE_LABELS[proc.type] ?? proc.type} | ${proc.auth} | [${proc.inputType}](#${anchor}) | [${proc.outputType}](#${anchor}) |`
      );
    });
    lines.push("");
  });

  lines.push("## Procedure Details");
  lines.push("");

  procedures.forEach(proc => {
    const clientMethod =
      proc.type === "mutation" ? "mutate" : proc.type === "subscription" ? "subscribe" : "query";
    const anchor = sanitizeAnchor(`type-${proc.path}`);
    const [routerName, ...rest] = proc.path.split(".");
    const procedureName = rest.join(".") || routerName;
    lines.push(`### ${proc.path}`);
    lines.push("");
    lines.push(`- **Router:** \`${routerName}\``);
    lines.push(`- **Procedure:** \`${procedureName}\``);
    lines.push(`- **Type:** ${PROCEDURE_TYPE_LABELS[proc.type] ?? proc.type}`);
    lines.push(`- **Auth:** ${proc.auth}`);
    lines.push("");
    lines.push(`#### Type Definitions`);
    lines.push(``);
    lines.push(`<a id="${anchor}"></a>`);
    lines.push("```ts");
    lines.push("import type { AppRouter } from \"../server/routers\";");
    lines.push("import type { inferRouterInputs, inferRouterOutputs } from \"@trpc/server\";");
    lines.push("");
    lines.push(renderTypeDefinition(proc));
    lines.push("```");
    lines.push("");
    lines.push("#### Example Request");
    lines.push("");
    lines.push("```json");
    lines.push(proc.exampleInput);
    lines.push("```");
    lines.push("");
    lines.push("#### Example Response");
    lines.push("");
    lines.push("```json");
    lines.push(
      formatJson({
        data: `<${proc.outputType}>`,
      })
    );
    lines.push("```");
    lines.push("");
    lines.push("#### Example Client Usage");
    lines.push("");
    lines.push("```ts");
    lines.push("import { trpc } from \"../client/src/lib/trpc\";");
    lines.push("");
    if (proc.hasInput) {
      lines.push(`const input: ${proc.inputType} = ${proc.exampleInput};`);
      lines.push(
        `const result: ${proc.outputType} = await trpc.${proc.path}.${clientMethod}(input as any);`
      );
    } else {
      lines.push(`const result: ${proc.outputType} = await trpc.${proc.path}.${clientMethod}();`);
    }
    lines.push("```");
    lines.push("");
  });

  const content = lines.join("\n");
  await fs.writeFile(DOC_PATH, content);

  console.log(`Generated ${DOC_PATH}`);
};

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
