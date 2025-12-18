import { describe, test, expect } from '@jest/globals';
import { encryptEnvironmentVariables, decryptEnvironmentVariables, generateEncryptionKey } from '../src/lib/encryption';

describe('Environment Variable Encryption', () => {
  test('encrypts and decrypts environment variables', () => {
    const envVars = {
      API_KEY: 'secret-key-123',
      DATABASE_URL: 'postgresql://localhost:5432/db',
    };
    const encryptionKey = generateEncryptionKey();

    const encrypted = encryptEnvironmentVariables(envVars, encryptionKey);
    expect(encrypted.encryptedValue).toBeDefined();
    expect(encrypted.iv).toBeDefined();
    expect(encrypted.authTag).toBeDefined();

    const decrypted = decryptEnvironmentVariables(encrypted, encryptionKey);
    expect(decrypted).toEqual(envVars);
  });

  test('generates unique encryption keys', () => {
    const key1 = generateEncryptionKey();
    const key2 = generateEncryptionKey();
    expect(key1).not.toBe(key2);
    expect(key1.length).toBe(64); // 32 bytes in hex
  });

  test('fails to decrypt with wrong key', () => {
    const envVars = { API_KEY: 'secret' };
    const key1 = generateEncryptionKey();
    const key2 = generateEncryptionKey();

    const encrypted = encryptEnvironmentVariables(envVars, key1);
    expect(() => decryptEnvironmentVariables(encrypted, key2)).toThrow();
  });
});
