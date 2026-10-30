


/**
 * Public environment variables for the Next.js client bundle.
 * Use static process.env.NEXT_PUBLIC_* access so values are inlined at build time.
 */

function requirePublicEnv(
  value: string | undefined,
  name: string,
): string {
  const trimmed = value?.trim();
  if (!trimmed) {
    throw new Error(
      `Missing ${name}. Set it in Frontend/.env.local and restart the dev server.`,
    );
  }
  return trimmed;
}

export function getAgentServiceUrl(): string {
  const base = requirePublicEnv(
    process.env.NEXT_PUBLIC_AGENT_SERVICE_URL,
    "NEXT_PUBLIC_AGENT_SERVICE_URL",
  );
  return base.replace(/\/$/, "");
}

export function getAgentStreamUrl(): string {
  return `${getAgentServiceUrl()}/research/stream`;
}
