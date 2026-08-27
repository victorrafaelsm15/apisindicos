export function normalizeExternalUrl(url) {
  if (!url) return url;
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

export function hostnameOf(url) {
  try {
    return new URL(normalizeExternalUrl(url)).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}
