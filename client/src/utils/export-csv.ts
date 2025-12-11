
export type CsvRow = Record<string, unknown>;

export interface ExportCsvOptions {
  filename: string;
  headers?: string[];
  rows: CsvRow[];
}

function stringifyCell(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (Array.isArray(value)) {
    return value.join(";");
  }
  return String(value);
}

export function exportToCsv(options: ExportCsvOptions): void {
  if (typeof window === "undefined") {
    return;
  }

  const filename = options.filename.endsWith(".csv")
    ? options.filename
    : options.filename + ".csv";

  const rows = options.rows;
  let headers = options.headers;
  if (!headers || headers.length === 0) {
    const headerSet = new Set<string>();
    rows.forEach(row => {
      Object.keys(row).forEach(key => {
        headerSet.add(key);
      });
    });
    headers = Array.from(headerSet);
  }

  const lines: string[] = [];
  lines.push(headers.join(","));

  rows.forEach(row => {
    const cells: string[] = [];
    headers?.forEach(header => {
      const raw = stringifyCell(row[header]);
      let cell = raw.replace(/"/g, '""');
      if (cell.search(/("|,|\n)/) !== -1) {
        cell = '"' + cell + '"';
      }
      cells.push(cell);
    });
    lines.push(cells.join(","));
  });

  const csv = lines.join("\r\n");
  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;"
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

