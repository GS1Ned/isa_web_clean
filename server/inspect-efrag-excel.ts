import ExcelJS from "exceljs";
import path from "path";

async function inspectExcel() {
  const filePath = path.join(
    process.cwd(),
    "data",
    "efrag",
    "esrs-set1-taxonomy-2024-08-30.xlsx"
  );

  console.log(`Inspecting: ${filePath}\n`);

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  console.log(`Total worksheets: ${workbook.worksheets.length}\n`);

  workbook.worksheets.forEach((sheet, index) => {
    console.log(`\n=== Sheet ${index + 1}: "${sheet.name}" ===`);
    console.log(`Rows: ${sheet.rowCount}, Columns: ${sheet.columnCount}`);

    // Show first 5 rows
    console.log(`\nFirst 5 rows:`);
    for (let i = 1; i <= Math.min(5, sheet.rowCount); i++) {
      const row = sheet.getRow(i);
      const values: string[] = [];
      row.eachCell(cell => {
        values.push(cell.value?.toString().substring(0, 30) || "");
      });
      console.log(`  Row ${i}: ${values.join(" | ")}`);
    }
  });

  process.exit(0);
}

inspectExcel();
