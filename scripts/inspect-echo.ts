import ExcelJS from 'exceljs';

async function inspect() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile('/home/ubuntu/isa_web/data/standards/gs1-nl/benelux-datasource/v3.1.33/common-echo-datamodel_3133.xlsx');
  
  console.log(`Sheets: ${wb.worksheets.length}`);
  wb.worksheets.forEach((s, i) => {
    console.log(`\nSheet ${i+1}: "${s.name}" (${s.rowCount} rows)`);
    for (let r = 1; r <= Math.min(5, s.rowCount); r++) {
      const row = s.getRow(r);
      const vals: string[] = [];
      row.eachCell(c => vals.push(String(c.value || '').substring(0, 30)));
      console.log(`  Row ${r}: ${vals.slice(0, 6).join(' | ')}`);
    }
  });
}
inspect();
