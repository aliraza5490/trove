import bcrypt from 'bcryptjs';

/**
 * Hash a password using bcrypt
 * @param password - The plain text password to hash
 * @param saltRounds - Number of salt rounds (default: 12)
 * @returns Promise<string> - The hashed password
 */
export async function hashPassword(
  password: string,
  saltRounds: number = 12,
): Promise<string> {
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    throw new Error('Failed to hash password');
  }
}

/**
 * Verify a password against a bcrypt hash
 * @param password - The plain text password to verify
 * @param hashedPassword - The bcrypt hash to compare against
 * @returns Promise<boolean> - True if password matches, false otherwise
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  try {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
  } catch (error) {
    throw new Error('Failed to verify password');
  }
}
