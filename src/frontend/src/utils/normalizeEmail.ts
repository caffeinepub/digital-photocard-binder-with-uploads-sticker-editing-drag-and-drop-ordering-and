/**
 * Normalizes an email address for comparison by trimming whitespace
 * and converting to lowercase.
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Compares two email addresses in a case-insensitive manner after trimming.
 */
export function emailsMatch(email1: string, email2: string): boolean {
  return normalizeEmail(email1) === normalizeEmail(email2);
}
