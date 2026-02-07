import mysql from 'mysql2/promise';

async function getStats() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  try {
    // Count ESRS datapoints
    const [esrsCount] = await connection.execute(
      'SELECT COUNT(*) as count FROM gs1_esrs_mappings'
    );
    console.log('ESRS Datapoints:', esrsCount[0].count);
    
    // Count unique ESRS standards
    const [esrsStandards] = await connection.execute(
      'SELECT DISTINCT esrs_standard FROM gs1_esrs_mappings'
    );
    console.log('ESRS Standards:', esrsStandards.map(r => r.esrs_standard).join(', '));
    
    // Count GS1 attributes
    const [gs1Count] = await connection.execute(
      'SELECT COUNT(*) as count FROM gs1_attributes'
    );
    console.log('GS1 Attributes:', gs1Count[0].count);
    
    // Count GS1-ESRS mappings
    const [mappingCount] = await connection.execute(
      'SELECT COUNT(*) as count FROM gs1_attribute_esrs_mapping'
    );
    console.log('GS1-ESRS Mappings:', mappingCount[0].count);
    
    // Count sectors
    const [sectors] = await connection.execute(
      'SELECT DISTINCT sector FROM gs1_attributes'
    );
    console.log('Sectors:', sectors.map(r => r.sector).join(', '));
    
  } finally {
    await connection.end();
  }
}

getStats().catch(console.error);
