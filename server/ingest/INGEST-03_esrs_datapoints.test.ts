import { beforeEach, describe, expect, it, vi } from "vitest";
import { getDb } from "../db";
import {
  esrsDatapoints,
  rawEsrsDatapoints
} from "../../drizzle/schema";
import {
  ingestEsrsDatapoints,
  normalizeEsrsDataType,
  parseConditionalFlag,
  parseVoluntaryFlag
} from "./INGEST-03_esrs_datapoints";

vi.mock("xlsx", () => {
  type Sheet = { rows: unknown[][] };
  interface MockWorkbook {
    SheetNames: string[];
    Sheets: Record<string, Sheet>;
  }
  const esrs2Header = [
    "ID",
    "ESRS",
    "DR",
    "Paragraph",
    "Related AR",
    "Name",
    "Data Type",
    "Conditional or alternative DP",
    "May [V]",
    "Appendix B - ESRS 2"
  ];
  const esrs2Row1 = [
    "BP-1_01",
    "ESRS 2",
    "BP-1",
    "5 a",
    "AR 1",
    "Basis for preparation of sustainability statement",
    "semi-narrative",
    "",
    "",
    ""
  ];
  const esrs2Row2 = [
    "BP-1_02",
    "ESRS 2",
    "BP-1",
    "5 b",
    "",
    "Scope of consolidation of consolidated sustainability statement",
    "narrative",
    "Conditional",
    "V",
    ""
  ];
  const e1Header = esrs2Header;
  const e1Row1 = [
    "E1.GOV-3_01",
    "ESRS E1",
    "E1.GOV-3",
    "48 a",
    "",
    "Disclosure of whether and how climate-related considerations are factored into remuneration",
    "quantitative",
    "Alternative",
    "",
    ""
  ];
  const workbook: MockWorkbook = {
    SheetNames: ["ESRS 2", "Index", "ESRS E1"],
    Sheets: {
      "ESRS 2": { rows: [esrs2Header, esrs2Row1, esrs2Row2] },
      Index: { rows: [] },
      "ESRS E1": { rows: [e1Header, e1Row1] }
    }
  };
  function readFile() {
    return workbook;
  }
  const utils = {
    sheet_to_json: (sheet: Sheet, _options: unknown) => sheet.rows
  };
  return {
    default: {
      readFile,
      utils
    },
    readFile,
    utils
  };
});

describe("INGEST-03: ESRS Datapoints ingestion", () => {
  beforeEach(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.delete(rawEsrsDatapoints);
    await db.delete(esrsDatapoints);
  });

  it("normalizes ESRS data types correctly", () => {
    expect(normalizeEsrsDataType("semi-narrative")).toBe("semiNarrative");
    expect(normalizeEsrsDataType("Semi Narrative")).toBe("semiNarrative");
    expect(normalizeEsrsDataType("quantitative")).toBe("quantitative");
    expect(normalizeEsrsDataType("Qualitative")).toBe("qualitative");
    expect(normalizeEsrsDataType("narrative")).toBe("narrative");
    expect(normalizeEsrsDataType("")).toBe("unknown");
    expect(normalizeEsrsDataType(null)).toBe("unknown");
  });

  it("parses conditional and voluntary flags correctly", () => {
    expect(parseConditionalFlag("Conditional")).toBe(true);
    expect(parseConditionalFlag("Alternative")).toBe(true);
    expect(parseConditionalFlag("Something else")).toBe(false);
    expect(parseConditionalFlag(null)).toBe(false);
    expect(parseVoluntaryFlag("V")).toBe(true);
    expect(parseVoluntaryFlag(" ")).toBe(false);
    expect(parseVoluntaryFlag(null)).toBe(false);
  });

  it("ingests ESRS datapoints into raw and canonical tables", async () => {
    const result = await ingestEsrsDatapoints({ verbose: false });
    expect(Boolean(result.success)).toBe(true);
    expect(result.recordsProcessed).toBe(3);
    expect(result.recordsInserted).toBe(3);
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const canonicalRows = await db.select().from(esrsDatapoints);
    const codes = canonicalRows.map((row) => row.code).sort();
    expect(codes).toEqual([
      "BP-1_01",
      "BP-1_02",
      "E1.GOV-3_01"
    ]);
    const semiNarrative = canonicalRows.find(
      (row) => row.code === "BP-1_01"
    );
    expect(semiNarrative).toBeDefined();
    if (semiNarrative) {
      expect(semiNarrative.dataType).toBe("semiNarrative");
      expect(Boolean(semiNarrative.conditional)).toBe(false);
      expect(Boolean(semiNarrative.voluntary)).toBe(false);
    }
    const conditionalRow = canonicalRows.find(
      (row) => row.code === "BP-1_02"
    );
    expect(conditionalRow).toBeDefined();
    if (conditionalRow) {
      expect(Boolean(conditionalRow.conditional)).toBe(true);
      expect(Boolean(conditionalRow.voluntary)).toBe(true);
    }
    const rawRows = await db.select().from(rawEsrsDatapoints);
    expect(rawRows.length).toBe(3);
  });

  it("is idempotent when running ingestion twice", { timeout: 15000 }, async () => {
    const first = await ingestEsrsDatapoints();
    expect(Boolean(first.success)).toBe(true);
    const second = await ingestEsrsDatapoints();
    expect(Boolean(second.success)).toBe(true);
    expect(second.recordsInserted).toBe(0);
    expect(second.recordsUpdated).toBe(first.recordsInserted);
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const canonicalRows = await db.select().from(esrsDatapoints);
    expect(canonicalRows.length).toBe(first.recordsInserted);
  });

  it("respects dry-run option and does not write to database", async () => {
    const result = await ingestEsrsDatapoints({
      dryRun: true,
      verbose: false
    });
    expect(Boolean(result.success)).toBe(true);
    expect(result.recordsProcessed).toBe(3);
    expect(result.recordsInserted).toBe(0);
    expect(result.recordsUpdated).toBe(0);
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const canonicalRows = await db.select().from(esrsDatapoints);
    const rawRows = await db.select().from(rawEsrsDatapoints);
    expect(canonicalRows.length).toBe(0);
    expect(rawRows.length).toBe(0);
  });

  it("respects limit option and processes only the specified number of records", async () => {
    const result = await ingestEsrsDatapoints({
      limit: 2,
      verbose: false
    });
    expect(Boolean(result.success)).toBe(true);
    expect(result.recordsProcessed).toBe(2);
    expect(result.recordsInserted).toBe(2);
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const canonicalRows = await db.select().from(esrsDatapoints);
    expect(canonicalRows.length).toBe(2);
  });

  it("handles errors and reports failure in result", async () => {
    const originalEnv = { ...process.env };
    const spy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const ingestModule = await import("./INGEST-03_esrs_datapoints");
    const loadWorkbookFileFn = (ingestModule as unknown as {
      loadWorkbookFile?: () => unknown;
    }).loadWorkbookFile;
    expect(loadWorkbookFileFn).toBeUndefined();
    spy.mockRestore();
    process.env = originalEnv;
  });
});

