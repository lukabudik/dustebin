import { createHash } from 'crypto';

/**
 * Simple password hashing using SHA-256 with a salt
 * Note: In a production environment, a more secure method like bcrypt should be used
 */
export async function hashPassword(password: string): Promise<string> {
  // Generate a random salt
  const salt = Math.random().toString(36).substring(2, 15);

  // Hash the password with the salt
  const hash = createHash('sha256')
    .update(password + salt)
    .digest('hex');

  // Return salt:hash
  return `${salt}:${hash}`;
}

/**
 * Compares a plain text password with a stored hash
 */
export async function comparePassword(password: string, storedHash: string): Promise<boolean> {
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
