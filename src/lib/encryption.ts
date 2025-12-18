import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { EncryptedData } from '@/types';

const ALGORITHM = 'aes-256-gcm';

/**
 * Encrypts environment variables using AES-256-GCM
 * Only the user and build worker can decrypt with the encryption key
 */
export function encryptEnvironmentVariables(
  envVars: Record<string, string>,
  encryptionKey: string
): EncryptedData {
  // Ensure key is 32 bytes for AES-256
  const key = Buffer.from(encryptionKey.padEnd(32, '0').slice(0, 32));
  const iv = randomBytes(16);
  
  const cipher = createCipheriv(ALGORITHM, key, iv);
  
  const plaintext = JSON.stringify(envVars);
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return {
    encryptedValue: encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
  };
}

/**
 * Decrypts environment variables
 */
export function decryptEnvironmentVariables(
  encryptedData: EncryptedData,
  encryptionKey: string
): Record<string, string> {
  const key = Buffer.from(encryptionKey.padEnd(32, '0').slice(0, 32));
  const iv = Buffer.from(encryptedData.iv, 'hex');
  const authTag = Buffer.from(encryptedData.authTag, 'hex');
  
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encryptedData.encryptedValue, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return JSON.parse(decrypted);
}

/**
 * Generates a secure encryption key for a user
 */
export function generateEncryptionKey(): string {
  return randomBytes(32).toString('hex');
}
