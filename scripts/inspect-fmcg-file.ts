import ExcelJS from 'exceljs';

async function inspectFMCG() {
  const workbook = new ExcelJS.Workbook();
  const filePath = '/home/ubuntu/isa_web/data/standards/gs1-nl/benelux-datasource/v3.1.33/benelux-fmcg-data-model-31335-nederlands.xlsx';
  
  console.log('Loading FMCG workbook...');
  await workbook.xlsx.readFile(filePath);
  
  console.log(`\n=== FMCG WORKBOOK STRUCTURE ===`);
  console.log(`Total sheets: ${workbook.worksheets.length}\n`);
  
  workbook.worksheets.forEach((sheet, index) => {
    console.log(`Sheet ${index + 1}: "${sheet.name}"`);
    console.log(`  Rows: ${sheet.rowCount}, Columns: ${sheet.columnCount}`);
    
    // Show first 3 rows
    for (let i = 1; i <= Math.min(3, sheet.rowCount); i++) {
      const row = sheet.getRow(i);
      const values: string[] = [];
      row.eachCell((cell) => {
        const val = String(cell.value || '').trim();
        values.push(val.length > 30 ? val.substring(0, 30) + '...' : val);
      });
      console.log(`  Row ${i}: ${values.slice(0, 5).join(' | ')}`);
    }
    console.log('');
  });
}

inspectFMCG().catch(console.error);
