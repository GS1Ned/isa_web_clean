import { parseLatestEFRAGTaxonomy } from './efrag-xbrl-parser';

async function testParser() {
  console.log('Testing EFRAG XBRL Parser...\n');
  
  try {
    const result = await parseLatestEFRAGTaxonomy();
    
    console.log('\n=== Parsing Result ===');
    console.log(`Total datapoints: ${result.totalCount}`);
    console.log(`Mandatory: ${result.mandatoryCount}`);
    console.log(`Voluntary: ${result.voluntaryCount}`);
    console.log(`\nBy Standard:`);
    Object.entries(result.byStandard).forEach(([standard, count]) => {
      console.log(`  ${standard}: ${count}`);
    });
    
    if (result.errors.length > 0) {
      console.log(`\nErrors (${result.errors.length}):`);
      result.errors.slice(0, 10).forEach(err => console.log(`  - ${err}`));
    }
    
    console.log(`\nSample Datapoints (first 5):`);
    result.datapoints.slice(0, 5).forEach(dp => {
      console.log(`\n  ID: ${dp.datapointId}`);
      console.log(`  Standard: ${dp.standard}`);
      console.log(`  DR: ${dp.disclosureRequirement}`);
      console.log(`  Name: ${dp.name}`);
      console.log(`  Type: ${dp.dataType}`);
      console.log(`  Mandatory: ${dp.mandatory}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Parser test failed:', error);
    process.exit(1);
  }
}

testParser();
