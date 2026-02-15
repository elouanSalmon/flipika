import * as crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

/**
 * Get the encryption key from environment variable.
 * Must be a 32-byte hex string (64 hex chars).
 */
function getEncryptionKey(): Buffer {
    const key = process.env.META_TOKEN_ENCRYPTION_KEY;
    if (!key) {
        throw new Error("META_TOKEN_ENCRYPTION_KEY environment variable is not set");
    }
    if (key.length !== 64) {
        throw new Error("META_TOKEN_ENCRYPTION_KEY must be 64 hex characters (32 bytes)");
    }
    return Buffer.from(key, "hex");
}

/**
 * Encrypt a plaintext string using AES-256-GCM.
 * Returns a base64 string containing: IV + ciphertext + authTag
 */
export function encrypt(plaintext: string): string {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(plaintext, "utf8");
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    const authTag = cipher.getAuthTag();

    // Combine: IV + ciphertext + authTag
    const combined = Buffer.concat([iv, encrypted, authTag]);
    return combined.toString("base64");
}

/**
 * Decrypt a base64 string encrypted with encrypt().
 */
export function decrypt(encryptedBase64: string): string {
    const key = getEncryptionKey();
    const combined = Buffer.from(encryptedBase64, "base64");

    // Extract parts
    const iv = combined.subarray(0, IV_LENGTH);
    const authTag = combined.subarray(combined.length - TAG_LENGTH);
    const ciphertext = combined.subarray(IV_LENGTH, combined.length - TAG_LENGTH);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(ciphertext);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString("utf8");
}
