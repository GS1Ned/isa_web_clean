import { buildMysqlConfig, createMysqlConnection } from './server/db-connection.ts';

async function testConnection() {
  console.log('Testing database connection with SSL...');
  
  const config = buildMysqlConfig(process.env.DATABASE_URL);
  console.log('SSL config:', config.ssl);
  
  try {
    const connection = await createMysqlConnection(process.env.DATABASE_URL);
    await connection.ping();
    console.log('✅ Connection successful!');
    
    // Test a simple query
    const [rows] = await connection.query('SELECT 1 as test');
    console.log('✅ Query successful:', rows);
    
    await connection.end();
    console.log('✅ All tests passed!');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
