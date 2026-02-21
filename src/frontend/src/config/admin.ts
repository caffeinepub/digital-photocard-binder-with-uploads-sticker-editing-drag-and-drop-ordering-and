import { normalizeEmail } from '../utils/normalizeEmail';

/**
 * Superuser email allowlist.
 * Only users with these email addresses can access the admin portal.
 */
const SUPERUSER_EMAILS = ['liddymo@gmail.com'];

/**
 * Checks if the given email is in the superuser allowlist.
 */
export function isSuperuserEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  const normalized = normalizeEmail(email);
  return SUPERUSER_EMAILS.some((superEmail) => normalizeEmail(superEmail) === normalized);
}
