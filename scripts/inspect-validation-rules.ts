import ExcelJS from 'exceljs';

async function inspectValidationRules() {
  const workbook = new ExcelJS.Workbook();
  const filePath = '/home/ubuntu/isa_web/data/standards/gs1-nl/benelux-datasource/v3.1.33/overview_of_validation_rules_for_the_benelux-31334.xlsx';
  
  console.log('Loading validation rules workbook...');
  await workbook.xlsx.readFile(filePath);
  
  console.log(`\n=== VALIDATION RULES WORKBOOK ===`);
  console.log(`Total sheets: ${workbook.worksheets.length}\n`);
  
  workbook.worksheets.forEach((sheet, index) => {
    console.log(`Sheet ${index + 1}: "${sheet.name}"`);
    console.log(`  Rows: ${sheet.rowCount}, Columns: ${sheet.columnCount}`);
    
    // Show first 5 rows
    for (let i = 1; i <= Math.min(5, sheet.rowCount); i++) {
      const row = sheet.getRow(i);
      const values: string[] = [];
      row.eachCell((cell) => {
        const val = String(cell.value || '').trim();
        values.push(val.length > 40 ? val.substring(0, 40) + '...' : val);
      });
      console.log(`  Row ${i}: ${values.slice(0, 6).join(' | ')}`);
    }
    console.log('');
  });
  
  // Focus on main validation sheet
  const mainSheet = workbook.worksheets.find(s => 
    s.name.toLowerCase().includes('validation') || 
    s.name.toLowerCase().includes('regel')
  ) || workbook.worksheets[0];
  
  console.log(`\n=== DETAILED INSPECTION: "${mainSheet.name}" ===`);
  
  // Find header row (usually row 1 or 2)
  for (let i = 1; i <= Math.min(3, mainSheet.rowCount); i++) {
    const row = mainSheet.getRow(i);
    const headers: string[] = [];
    row.eachCell((cell) => {
      headers.push(String(cell.value || '').trim());
    });
    console.log(`\nRow ${i} headers (${headers.length} columns):`);
    headers.forEach((h, idx) => {
      if (h) console.log(`  ${idx + 1}. ${h}`);
    });
  }
  
  // Show sample data rows
  console.log('\nSample data rows (rows 4-8):');
  for (let i = 4; i <= Math.min(8, mainSheet.rowCount); i++) {
    const row = mainSheet.getRow(i);
    const values: string[] = [];
    row.eachCell((cell) => {
      const val = String(cell.value || '').trim();
      values.push(val.length > 30 ? val.substring(0, 30) + '...' : val);
    });
    console.log(`  Row ${i}: ${values.slice(0, 8).join(' | ')}`);
  }
}

inspectValidationRules().catch(console.error);
