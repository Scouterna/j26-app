/**
 * Ensures the link is on the same origin or a valid relative path, otherwise
 * returns null to prevent open external links from notifications.
 */
export function resolveLink(link: string | null): string | null {
  if (!link) {
    return null;
  }

  try {
    const url = new URL(link);
    if (url.origin === self.location.origin) {
      return url.pathname + url.search + url.hash;
    }
    return null;
  } catch {
    return link.startsWith("/") ? link : null;
  }
}
