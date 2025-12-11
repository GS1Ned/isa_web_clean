import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Regulation export data structure
 */
export interface RegulationExportData {
  id: string;
  title: string;
  type: string;
  celexId: string;
  description: string;
  effectiveDate: Date;
  enforcementDate: Date | null;
  status: string;
  applicableSectors: string[];
  applicableGS1Standards: string[];
  implementationPhases: Array<{
    phase: string;
    deadline: string;
    description: string;
  }>;
  relatedRegulations: string[];
  faqItems: Array<{
    question: string;
    answer: string;
  }>;
  checklist: Array<{
    item: string;
    description: string;
    priority: "high" | "medium" | "low";
    completed: boolean;
  }>;
}

/**
 * Export regulation to PDF format
 * Includes timeline, checklist, related standards, and FAQ
 */
export function exportRegulationToPDF(data: RegulationExportData): Buffer {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // Helper function to add page break if needed
  const checkPageBreak = (spaceNeeded: number) => {
    if (yPosition + spaceNeeded > pageHeight - 10) {
      doc.addPage();
      yPosition = 20;
    }
  };

  // Title
  doc.setFontSize(20);
  doc.setTextColor(13, 71, 161); // Deep blue color
  doc.text(data.title, 20, yPosition);
  yPosition += 15;

  // Regulation metadata
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Type: ${data.type}`, 20, yPosition);
  yPosition += 6;
  doc.text(`CELEX ID: ${data.celexId}`, 20, yPosition);
  yPosition += 6;
  doc.text(`Status: ${data.status}`, 20, yPosition);
  yPosition += 6;
  doc.text(
    `Effective Date: ${data.effectiveDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`,
    20,
    yPosition
  );
  yPosition += 10;

  // Description
  checkPageBreak(30);
  doc.setFontSize(12);
  doc.setTextColor(13, 71, 161);
  doc.text("Description", 20, yPosition);
  yPosition += 8;
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  const descriptionLines = doc.splitTextToSize(
    data.description,
    pageWidth - 40
  );
  doc.text(descriptionLines, 20, yPosition);
  yPosition += descriptionLines.length * 5 + 5;

  // Applicable Sectors
  if (data.applicableSectors.length > 0) {
    checkPageBreak(20);
    doc.setFontSize(12);
    doc.setTextColor(13, 71, 161);
    doc.text("Applicable Sectors", 20, yPosition);
    yPosition += 8;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    data.applicableSectors.forEach(sector => {
      doc.text(`• ${sector}`, 25, yPosition);
      yPosition += 5;
    });
    yPosition += 3;
  }

  // Applicable GS1 Standards
  if (data.applicableGS1Standards.length > 0) {
    checkPageBreak(20);
    doc.setFontSize(12);
    doc.setTextColor(13, 71, 161);
    doc.text("Applicable GS1 Standards", 20, yPosition);
    yPosition += 8;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    data.applicableGS1Standards.forEach(standard => {
      doc.text(`• ${standard}`, 25, yPosition);
      yPosition += 5;
    });
    yPosition += 3;
  }

  // Implementation Phases
  if (data.implementationPhases.length > 0) {
    checkPageBreak(30);
    doc.setFontSize(12);
    doc.setTextColor(13, 71, 161);
    doc.text("Implementation Timeline", 20, yPosition);
    yPosition += 10;

    const phaseTableData = data.implementationPhases.map(phase => [
      phase.phase,
      phase.deadline,
      phase.description,
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [["Phase", "Deadline", "Description"]],
      body: phaseTableData,
      headStyles: {
        fillColor: [13, 71, 161],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: "bold",
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 4,
      },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 40 },
        2: { cellWidth: pageWidth - 100 },
      },
      margin: { left: 20, right: 20 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;
  }

  // Implementation Checklist
  if (data.checklist.length > 0) {
    checkPageBreak(30);
    doc.setFontSize(12);
    doc.setTextColor(13, 71, 161);
    doc.text("Implementation Checklist", 20, yPosition);
    yPosition += 10;

    const checklistTableData = data.checklist.map(item => [
      item.completed ? "✓" : "○",
      item.item,
      item.description,
      item.priority.charAt(0).toUpperCase() + item.priority.slice(1),
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [["Done", "Item", "Description", "Priority"]],
      body: checklistTableData,
      headStyles: {
        fillColor: [13, 71, 161],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: "bold",
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 4,
      },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 40 },
        2: { cellWidth: pageWidth - 120 },
        3: { cellWidth: 25 },
      },
      margin: { left: 20, right: 20 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;
  }

  // FAQ Section
  if (data.faqItems.length > 0) {
    checkPageBreak(30);
    doc.setFontSize(12);
    doc.setTextColor(13, 71, 161);
    doc.text("Frequently Asked Questions", 20, yPosition);
    yPosition += 10;

    data.faqItems.forEach((item, index) => {
      checkPageBreak(15);
      doc.setFontSize(10);
      doc.setTextColor(13, 71, 161);
      doc.setFont("helvetica", "bold");
      doc.text(`Q${index + 1}: ${item.question}`, 20, yPosition);
      yPosition += 7;

      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
      const answerLines = doc.splitTextToSize(item.answer, pageWidth - 40);
      doc.text(answerLines, 25, yPosition);
      yPosition += answerLines.length * 4 + 5;
    });
  }

  // Footer
  const pageCount = (doc as any).internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, {
      align: "center",
    });
    doc.text(
      `Generated on ${new Date().toLocaleDateString()}`,
      20,
      pageHeight - 10
    );
  }

  return Buffer.from(doc.output("arraybuffer"));
}

/**
 * Export regulation to CSV format
 * Includes all metadata, checklist items, and FAQ
 */
export function exportRegulationToCSV(data: RegulationExportData): string {
  const rows: string[] = [];

  // Header section
  rows.push("Regulation Export Report");
  rows.push("");

  // Basic information
  rows.push("REGULATION INFORMATION");
  rows.push(`Title,${escapeCSV(data.title)}`);
  rows.push(`Type,${data.type}`);
  rows.push(`CELEX ID,${data.celexId}`);
  rows.push(`Status,${data.status}`);
  rows.push(`Effective Date,${data.effectiveDate.toLocaleDateString("en-US")}`);
  if (data.enforcementDate) {
    rows.push(
      `Enforcement Date,${data.enforcementDate.toLocaleDateString("en-US")}`
    );
  }
  rows.push(`Description,${escapeCSV(data.description)}`);
  rows.push("");

  // Applicable Sectors
  if (data.applicableSectors.length > 0) {
    rows.push("APPLICABLE SECTORS");
    data.applicableSectors.forEach(sector => {
      rows.push(escapeCSV(sector));
    });
    rows.push("");
  }

  // Applicable GS1 Standards
  if (data.applicableGS1Standards.length > 0) {
    rows.push("APPLICABLE GS1 STANDARDS");
    data.applicableGS1Standards.forEach(standard => {
      rows.push(escapeCSV(standard));
    });
    rows.push("");
  }

  // Implementation Phases
  if (data.implementationPhases.length > 0) {
    rows.push("IMPLEMENTATION TIMELINE");
    rows.push("Phase,Deadline,Description");
    data.implementationPhases.forEach(phase => {
      rows.push(
        `${escapeCSV(phase.phase)},${phase.deadline},${escapeCSV(phase.description)}`
      );
    });
    rows.push("");
  }

  // Implementation Checklist
  if (data.checklist.length > 0) {
    rows.push("IMPLEMENTATION CHECKLIST");
    rows.push("Completed,Item,Description,Priority");
    data.checklist.forEach(item => {
      rows.push(
        `${item.completed ? "Yes" : "No"},${escapeCSV(item.item)},${escapeCSV(item.description)},${item.priority}`
      );
    });
    rows.push("");
  }

  // FAQ
  if (data.faqItems.length > 0) {
    rows.push("FREQUENTLY ASKED QUESTIONS");
    rows.push("Question,Answer");
    data.faqItems.forEach(item => {
      rows.push(`${escapeCSV(item.question)},${escapeCSV(item.answer)}`);
    });
    rows.push("");
  }

  // Footer
  rows.push(`Generated on,${new Date().toLocaleString()}`);

  return rows.join("\n");
}

/**
 * Escape CSV field values
 */
function escapeCSV(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Export multiple regulations to CSV
 */
export function exportRegulationsListToCSV(
  regulations: Array<{
    id: string;
    title: string;
    type: string;
    celexId: string;
    status: string;
    effectiveDate: Date;
    applicableSectors: string[];
    applicableGS1Standards: string[];
  }>
): string {
  const rows: string[] = [];

  // Header
  rows.push("Regulations List Export");
  rows.push("");
  rows.push(
    "Title,Type,CELEX ID,Status,Effective Date,Applicable Sectors,Applicable GS1 Standards"
  );

  // Data rows
  regulations.forEach(reg => {
    rows.push(
      `${escapeCSV(reg.title)},${reg.type},${reg.celexId},${reg.status},${reg.effectiveDate.toLocaleDateString("en-US")},${escapeCSV(reg.applicableSectors.join("; "))},${escapeCSV(reg.applicableGS1Standards.join("; "))}`
    );
  });

  rows.push("");
  rows.push(`Generated on,${new Date().toLocaleString()}`);

  return rows.join("\n");
}

/**
 * Generate filename for export
 */
export function generateExportFilename(
  regulationTitle: string,
  format: "pdf" | "csv"
): string {
  const sanitizedTitle = regulationTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 50);

  const timestamp = new Date().toISOString().split("T")[0];
  const extension = format === "pdf" ? "pdf" : "csv";

  return `regulation-${sanitizedTitle}-${timestamp}.${extension}`;
}
