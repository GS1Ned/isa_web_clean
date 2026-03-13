import { buildMysqlConfig, createMysqlConnection } from './server/db-connection.ts';
import { format as utilFormat } from "node:util";
const cliOut = (...args) => process.stdout.write(`${utilFormat(...args)}\n`);
const cliErr = (...args) => process.stderr.write(`${utilFormat(...args)}\n`);


async function testConnection() {
  cliOut('Testing database connection with SSL...');
  
  const config = buildMysqlConfig(process.env.DATABASE_URL);
  cliOut('SSL config:', config.ssl);
  
  try {
    const connection = await createMysqlConnection(process.env.DATABASE_URL);
    await connection.ping();
    cliOut('✅ Connection successful!');
    
    // Test a simple query
    const [rows] = await connection.query('SELECT 1 as test');
    cliOut('✅ Query successful:', rows);
    
    await connection.end();
    cliOut('✅ All tests passed!');
  } catch (error) {
    cliErr('❌ Connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
