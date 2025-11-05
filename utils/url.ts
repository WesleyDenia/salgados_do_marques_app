export function resolveAssetUrl(path?: string | null, baseUrl?: string | null): string | undefined {
  if (!path) return undefined;

  const trimmed = path.trim();
  if (!trimmed) return undefined;

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`;
  }

  if (!baseUrl || !baseUrl.trim()) {
    return trimmed;
  }

  const normalizedBase = baseUrl.replace(/\/+$/, '');
  const normalizedPath = trimmed.replace(/^\/+/, '');

  return `${normalizedBase}/${normalizedPath}`;
}
