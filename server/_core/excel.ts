import ExcelJS from "exceljs";

function normalizeCellValue(value: unknown): unknown {
  if (value == null) return null;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }
  if (value instanceof Date) return value.toISOString();

  if (typeof value === "object") {
    const candidate = value as Record<string, unknown>;

    if (Array.isArray(candidate.richText)) {
      return candidate.richText
        .map((entry) => (entry && typeof entry === "object" ? String((entry as any).text ?? "") : ""))
        .join("");
    }

    if (typeof candidate.text === "string") {
      return candidate.text;
    }

    if ("result" in candidate) {
      return normalizeCellValue(candidate.result);
    }

    if (typeof candidate.error === "string") {
      return candidate.error;
    }
  }

  return String(value);
}

export async function readExcelWorkbook(filePath: string): Promise<ExcelJS.Workbook> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  return workbook;
}

export function getExcelSheetNames(workbook: ExcelJS.Workbook): string[] {
  return workbook.worksheets.map((sheet) => sheet.name);
}

export function getExcelWorksheetRows(
  workbook: ExcelJS.Workbook,
  worksheetName: string,
  defval: unknown = null
): unknown[][] {
  const worksheet = workbook.getWorksheet(worksheetName);
  if (!worksheet) {
    return [];
  }

  const rowCount = worksheet.rowCount;
  const columnCount = worksheet.columnCount;
  const rows: unknown[][] = [];

  for (let rowIdx = 1; rowIdx <= rowCount; rowIdx += 1) {
    const row = worksheet.getRow(rowIdx);
    const cells: unknown[] = [];

    for (let colIdx = 1; colIdx <= columnCount; colIdx += 1) {
      const normalized = normalizeCellValue(row.getCell(colIdx).value);
      if (normalized === null || normalized === undefined || normalized === "") {
        cells.push(defval);
      } else {
        cells.push(normalized);
      }
    }

    rows.push(cells);
  }

  return rows;
}
