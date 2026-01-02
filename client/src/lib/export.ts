import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export interface Regulation {
  id: number;
  celexId: string | null;
  title: string;
  description?: string | null;
  regulationType: string;
  effectiveDate?: string | null;
  sourceUrl?: string | null;
  lastUpdated?: string;
  createdAt?: string;
  embedding?: unknown;
}

/**
 * Export regulations to JSON format
 */
export function exportToJSON(
  regulations: Regulation[],
  filename: string = "regulations.json"
) {
  const dataStr = JSON.stringify(regulations, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  downloadFile(dataBlob, filename);
}

/**
 * Export regulations to CSV format
 */
export function exportToCSV(
  regulations: Regulation[],
  filename: string = "regulations.csv"
) {
  const headers = [
    "CELEX ID",
    "Title",
    "Type",
    "Description",
    "Effective Date",
    "Source URL",
  ];

  const rows = regulations.map(reg => [
    reg.celexId || "",
    reg.title || "",
    reg.regulationType || "",
    reg.description || "",
    reg.effectiveDate ? new Date(reg.effectiveDate).toLocaleDateString() : "",
    reg.sourceUrl || "",
  ]);

  const csvContent = [
    headers.map(h => `"${h}"`).join(","),
    ...rows.map(row =>
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");

  const dataBlob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  downloadFile(dataBlob, filename);
}

/**
 * Export regulations to PDF format
 */
export function exportToPDF(
  regulations: Regulation[],
  filename: string = "regulations.pdf"
) {
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(16);
  doc.text("ISA Regulatory Mapping Report", 14, 15);

  // Add metadata
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 25);
  doc.text(`Total Regulations: ${regulations.length}`, 14, 32);

  // Add table
  const tableData = regulations.map(reg => [
    reg.celexId || "—",
    reg.title || "—",
    reg.regulationType || "—",
    reg.effectiveDate ? new Date(reg.effectiveDate).toLocaleDateString() : "—",
  ]);

  autoTable(doc, {
    head: [["CELEX ID", "Title", "Type", "Effective Date"]],
    body: tableData,
    startY: 40,
    theme: "grid",
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [25, 118, 210],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
  });

  doc.save(filename);
}

/**
 * Export regulations to HTML format
 */
export function exportToHTML(
  regulations: Regulation[],
  filename: string = "regulations.html"
) {
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ISA Regulatory Mapping Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; color: #333; }
    .container { max-width: 1200px; margin: 0 auto; padding: 40px 20px; }
    header { background: white; padding: 30px; border-radius: 8px; margin-bottom: 30px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    h1 { font-size: 28px; margin-bottom: 10px; color: #1976d2; }
    .metadata { font-size: 14px; color: #666; margin-top: 15px; }
    .metadata p { margin: 5px 0; }
    table { width: 100%; border-collapse: collapse; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden; }
    thead { background: #1976d2; color: white; }
    th { padding: 15px; text-align: left; font-weight: 600; }
    td { padding: 12px 15px; border-bottom: 1px solid #e0e0e0; }
    tbody tr:hover { background: #f9f9f9; }
    .type-badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; }
    .type-csrd { background: #e3f2fd; color: #1976d2; }
    .type-esrs { background: #f3e5f5; color: #7b1fa2; }
    .type-dpp { background: #e8f5e9; color: #388e3c; }
    .type-eu { background: #fff3e0; color: #f57c00; }
    footer { text-align: center; margin-top: 40px; color: #999; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>ISA Regulatory Mapping Report</h1>
      <div class="metadata">
        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Total Regulations:</strong> ${regulations.length}</p>
      </div>
    </header>
    
    <table>
      <thead>
        <tr>
          <th>CELEX ID</th>
          <th>Title</th>
          <th>Type</th>
          <th>Effective Date</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        ${regulations
          .map(
            reg => `
        <tr>
          <td>${reg.celexId || "—"}</td>
          <td>${reg.title || "—"}</td>
          <td><span class="type-badge type-${reg.regulationType?.toLowerCase() || "default"}">${reg.regulationType || "—"}</span></td>
          <td>${reg.effectiveDate ? new Date(reg.effectiveDate).toLocaleDateString() : "—"}</td>
          <td>${reg.description || "—"}</td>
        </tr>
        `
          )
          .join("")}
      </tbody>
    </table>
    
    <footer>
      <p>&copy; 2025 Intelligent Standards Architect. All rights reserved.</p>
    </footer>
  </div>
</body>
</html>
  `;

  const dataBlob = new Blob([htmlContent], {
    type: "text/html;charset=utf-8;",
  });
  downloadFile(dataBlob, filename);
}

/**
 * Helper function to download a file
 */
function downloadFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate filename with timestamp
 */
export function generateFilename(
  format: "json" | "csv" | "pdf" | "html"
): string {
  const timestamp = new Date().toISOString().split("T")[0];
  const extensions: Record<string, string> = {
    json: "json",
    csv: "csv",
    pdf: "pdf",
    html: "html",
  };
  return `isa-regulations-${timestamp}.${extensions[format]}`;
}
