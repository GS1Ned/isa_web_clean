import { serverLogger } from '../server/utils/server-logger';

async function testLogger() {
  serverLogger.info('This is an info message.');
  serverLogger.warn('This is a warning message.');
  serverLogger.error('This is an error message.');

  // Test with metadata
  serverLogger.info('This is an info message with metadata.', { userId: '123', requestId: 'abc' });
  serverLogger.error(new Error('This is a test error with a stack trace.'), { context: 'test-runner' });
}

testLogger();
