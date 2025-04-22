import { createHash } from 'crypto';
import bcrypt from 'bcrypt';

// Salt rounds for bcrypt (higher is more secure but slower)
const BCRYPT_SALT_ROUNDS = 10;
// Prefix to identify bcrypt hashes
const BCRYPT_PREFIX = 'bcrypt:';

/**
 * Password hashing using bcrypt with backward compatibility
 * for legacy SHA-256 hashes
 */
export async function hashPassword(password: string): Promise<string> {
  // Use bcrypt for all new passwords
  const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS);
  const hash = await bcrypt.hash(password, salt);

  // Return with prefix to identify as bcrypt hash
  return `${BCRYPT_PREFIX}${hash}`;
}

/**
 * Compares a plain text password with a stored hash
 * Handles both bcrypt and legacy SHA-256 hashes
 */
export async function comparePassword(password: string, storedHash: string): Promise<boolean> {
  return storedHash.startsWith(BCRYPT_PREFIX)
    ? await compareBcryptPassword(password, storedHash)
    : compareLegacyPassword(password, storedHash);
}

async function compareBcryptPassword(password: string, storedHash: string) {
  if (!storedHash.startsWith(BCRYPT_PREFIX)) {
    console.warn('Bcrypt hash does not have expected prefix');
  }
  const hash = storedHash.substring(BCRYPT_PREFIX.length);
  return await bcrypt.compare(password, hash);
}

/**
 * Helper function to compare with legacy SHA-256 hashes
 * @private
 */
function compareLegacyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 2) {
    return false;
  }

  try {
    const [salt, hash] = parts;

    // Hash the input password with the stored salt
    const calculatedHash = createHash('sha256')
      .update(password + salt)
      .digest('hex');

    // Compare the calculated hash with the stored hash
    return calculatedHash === hash;
  } catch {
    // If any error occurs during hash calculation, return false
    return false;
  }
}
