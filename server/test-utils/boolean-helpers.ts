/**
 * Test utilities for handling MySQL tinyint boolean values
 * 
 * MySQL stores boolean values as tinyint (0/1), which JavaScript
 * interprets as numbers rather than true/false. These helpers
 * provide consistent boolean comparison in tests.
 */

/**
 * Converts MySQL tinyint (0/1) to JavaScript boolean
 * Handles both number and boolean inputs for flexibility
 */
export function toBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  return Boolean(value);
}

/**
 * Custom matcher for boolean values that handles MySQL tinyint
 * Use: expect(value).toBeTruthy() or expect(toBoolean(value)).toBe(true)
 */
export function isTruthy(value: unknown): boolean {
  return toBoolean(value) === true;
}

/**
 * Custom matcher for boolean values that handles MySQL tinyint
 * Use: expect(value).toBeFalsy() or expect(toBoolean(value)).toBe(false)
 */
export function isFalsy(value: unknown): boolean {
  return toBoolean(value) === false;
}

/**
 * Assert that a value is truthy (handles MySQL tinyint)
 * Throws descriptive error if assertion fails
 */
export function assertTruthy(value: unknown, message?: string): void {
  if (!isTruthy(value)) {
    throw new Error(message || `Expected truthy value but got: ${JSON.stringify(value)}`);
  }
}

/**
 * Assert that a value is falsy (handles MySQL tinyint)
 * Throws descriptive error if assertion fails
 */
export function assertFalsy(value: unknown, message?: string): void {
  if (!isFalsy(value)) {
    throw new Error(message || `Expected falsy value but got: ${JSON.stringify(value)}`);
  }
}
