import ExcelJS from 'exceljs';

async function inspectDatamodel() {
  const workbook = new ExcelJS.Workbook();
  const filePath = '/home/ubuntu/isa_web/data/standards/gs1-nl/benelux-datasource/v3.1.33/GS1 Data Source Datamodel 3.1.33.xlsx';
  
  console.log('Loading workbook...');
  await workbook.xlsx.readFile(filePath);
  
  console.log('\n=== WORKBOOK STRUCTURE ===');
  console.log(`Total sheets: ${workbook.worksheets.length}\n`);
  
  workbook.worksheets.forEach((sheet, index) => {
    console.log(`Sheet ${index + 1}: "${sheet.name}"`);
    console.log(`  Rows: ${sheet.rowCount}, Columns: ${sheet.columnCount}`);
    
    // Show first row (headers)
    const headerRow = sheet.getRow(1);
    const headers: string[] = [];
    headerRow.eachCell((cell, colNumber) => {
      headers.push(String(cell.value || '').trim());
    });
    console.log(`  Headers (first 10): ${headers.slice(0, 10).join(', ')}`);
    
    // Show sample data from row 2
    if (sheet.rowCount > 1) {
      const dataRow = sheet.getRow(2);
      const sample: string[] = [];
      dataRow.eachCell((cell, colNumber) => {
        const val = String(cell.value || '').trim();
        sample.push(val.length > 30 ? val.substring(0, 30) + '...' : val);
      });
      console.log(`  Sample row 2 (first 5): ${sample.slice(0, 5).join(' | ')}`);
    }
    console.log('');
  });
  
  // Focus on the main datamodel sheet (likely first or largest)
  const mainSheet = workbook.worksheets.find(s => 
    s.name.toLowerCase().includes('datamodel') || 
    s.name.toLowerCase().includes('attributes') ||
    s.rowCount > 100
  ) || workbook.worksheets[0];
  
  console.log(`\n=== DETAILED INSPECTION: "${mainSheet.name}" ===`);
  console.log(`Total rows: ${mainSheet.rowCount}`);
  
  // Extract all headers
  const headerRow = mainSheet.getRow(1);
  const allHeaders: string[] = [];
  headerRow.eachCell((cell) => {
    allHeaders.push(String(cell.value || '').trim());
  });
  
  console.log(`\nAll column headers (${allHeaders.length} columns):`);
  allHeaders.forEach((h, i) => {
    console.log(`  ${i + 1}. ${h}`);
  });
  
  // Show first 5 data rows
  console.log('\nFirst 5 data rows:');
  for (let i = 2; i <= Math.min(6, mainSheet.rowCount); i++) {
    const row = mainSheet.getRow(i);
    const values: string[] = [];
    row.eachCell((cell) => {
      const val = String(cell.value || '').trim();
      values.push(val.length > 20 ? val.substring(0, 20) + '...' : val);
    });
    console.log(`  Row ${i}: ${values.slice(0, 8).join(' | ')}`);
  }
}

inspectDatamodel().catch(console.error);
