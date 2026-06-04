import crypto from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';

function getEncryptionKey() {
  const value = process.env.API_SECRET_ENCRYPTION_KEY || '';
  if (!value) return null;

  if (/^[a-f0-9]{64}$/i.test(value)) {
    return Buffer.from(value, 'hex');
  }

  try {
    const decoded = Buffer.from(value, 'base64');
    if (decoded.length === 32) return decoded;
  } catch {
    // Fall through to hash-based derivation.
  }

  return crypto.createHash('sha256').update(value).digest();
}

export function hasApiSecretEncryptionKey() {
  return Boolean(getEncryptionKey());
}

export function generateApiSecret() {
  return `pgsec_${crypto.randomBytes(24).toString('base64url')}`;
}

export function encryptApiSecret(secret) {
  const key = getEncryptionKey();
  if (!key) {
    throw new Error('API_SECRET_ENCRYPTION_KEY is not configured');
  }

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([cipher.update(secret, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    secret_ciphertext: ciphertext.toString('base64'),
    secret_iv: iv.toString('base64'),
    secret_auth_tag: authTag.toString('base64'),
  };
}

export function decryptApiSecret(record) {
  const key = getEncryptionKey();
  if (!key) {
    throw new Error('API_SECRET_ENCRYPTION_KEY is not configured');
  }

  const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(record.secret_iv, 'base64'));
  decipher.setAuthTag(Buffer.from(record.secret_auth_tag, 'base64'));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(record.secret_ciphertext, 'base64')),
    decipher.final(),
  ]);

  return plaintext.toString('utf8');
}
