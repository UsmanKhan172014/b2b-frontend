/** Reject search-engine URLs used as faux evidence links. */
const BLOCKED_URL_PATTERNS = [
  "google.com/search",
  "bing.com/search",
  "duckduckgo.com",
  "google.com/url?",
];

export function isValidSourceUrl(url: string): boolean {
  const trimmed = url.trim().toLowerCase();
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    return false;
  }
  return !BLOCKED_URL_PATTERNS.some((pattern) => trimmed.includes(pattern));
}

export function sanitizeSourceUrls(urls: string[] | null | undefined): string[] {
  const cleaned: string[] = [];
  for (const url of urls ?? []) {
    if (isValidSourceUrl(url) && !cleaned.includes(url)) {
      cleaned.push(url.trim());
    }
  }
  return cleaned;
}

/** Ensures a website value is a valid absolute URL for links. */
export function normalizeWebsiteUrl(website: string): string {
  const trimmed = website.trim();
  if (!trimmed) return "#";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

/** Display hostname without protocol for tables. */
export function formatWebsiteLabel(website: string): string {
  return website.replace(/^https?:\/\//i, "").replace(/\/$/, "");
}
