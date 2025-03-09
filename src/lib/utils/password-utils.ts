import bcrypt from 'bcrypt';

/**
 * Hashes a password using bcrypt with appropriate salt rounds
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Compares a plain text password with a bcrypt hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
