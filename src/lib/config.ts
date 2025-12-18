/**
 * Configuration validation utilities
 * Ensures required environment variables are set before the app starts
 */

/**
 * Validates that all required environment variables are set
 * @throws Error if any required variable is missing
 */
export function validateEnvironment(): void {
  const required = ['ENCRYPTION_KEY'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please ensure all required variables are set in your .env file.'
    );
  }
  
  // Validate ENCRYPTION_KEY is at least 32 characters (for scrypt derivation)
  const encryptionKey = process.env.ENCRYPTION_KEY;
  if (encryptionKey && encryptionKey.length < 32) {
    throw new Error(
      'ENCRYPTION_KEY must be at least 32 characters long.\n' +
      'Generate a secure key using: openssl rand -hex 32'
    );
  }
}

/**
 * Gets a required environment variable
 * @throws Error if the variable is not set
 */
export function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Required environment variable ${key} is not set`);
  }
  return value;
}

/**
 * Gets an optional environment variable with a default value
 */
export function getEnv(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}
