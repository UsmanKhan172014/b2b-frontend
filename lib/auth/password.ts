export const MIN_PASSWORD_LENGTH = 10;
/** bcrypt, which Supabase uses, ignores everything after 72 bytes. */
export const MAX_PASSWORD_LENGTH = 72;

/** A short reason the password is not acceptable, or null when it is. */
export function passwordProblem(password: string, email?: string | null): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (new TextEncoder().encode(password).length > MAX_PASSWORD_LENGTH) {
    return `Use at most ${MAX_PASSWORD_LENGTH} characters.`;
  }
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return "Include at least one letter and one number.";
  }
  const local = email?.split("@")[0]?.toLowerCase();
  if (local && local.length >= 4 && password.toLowerCase().includes(local)) {
    return "Do not use your email address in your password.";
  }
  return null;
}
