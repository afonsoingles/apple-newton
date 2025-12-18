import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';
import { EncryptedData } from '@/types';

const ALGORITHM = 'aes-256-gcm';

/**
 * Gets the encryption salt from environment or throws
 * In production, this should be a unique, randomly generated value
 */
function getEncryptionSalt(): string {
  const salt = process.env.ENCRYPTION_SALT;
  if (!salt) {
    throw new Error(
      'ENCRYPTION_SALT environment variable is not set. ' +
      'Generate one with: openssl rand -hex 32'
    );
  }
  return salt;
}

/**
 * Derives a proper 32-byte key from the provided encryption key using scrypt
 */
function deriveKey(encryptionKey: string): Buffer {
  // Use scrypt to derive a secure 32-byte key with unique salt
  return scryptSync(encryptionKey, getEncryptionSalt(), 32);
}

/**
 * Encrypts environment variables using AES-256-GCM
 * Only the user and build worker can decrypt with the encryption key
 */
export function encryptEnvironmentVariables(
  envVars: Record<string, string>,
  encryptionKey: string
): EncryptedData {
  const key = deriveKey(encryptionKey);
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
  const key = deriveKey(encryptionKey);
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
