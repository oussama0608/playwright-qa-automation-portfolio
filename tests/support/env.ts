/**
 * Single source of truth for test configuration.
 * Values come from environment variables (.env locally, GitHub Secrets in CI).
 * Defaults are demo-only credentials of the local app – never real secrets.
 */
export const credentials = {
  username: process.env.DEMO_USER ?? 'qa_user',
  password: process.env.DEMO_PASS ?? 'ChangeMe123!',
} as const;
