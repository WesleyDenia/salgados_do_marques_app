export type ContentHomeTokenSegment =
  | { type: "text"; value: string }
  | { type: "internal-cta"; route: string };

const CTA_TOKEN_REGEX = /\{\{([^{}]+)\}\}/g;

function normalizeInternalRoute(rawValue: string): string | null {
  const trimmed = rawValue.trim();

  if (!trimmed || trimmed.includes("://") || /\s/.test(trimmed)) {
    return null;
  }

  const productMatch = trimmed.match(/^\/?details\/(\d+)\/products$/);
  if (productMatch) {
    return `/details/menu/${productMatch[1]}`;
  }

  const route = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;

  if (!route.startsWith("/details/")) {
    return null;
  }

  return route;
}

export function parseContentHomeBody(value: string | null | undefined): ContentHomeTokenSegment[] {
  if (!value) {
    return [];
  }

  const segments: ContentHomeTokenSegment[] = [];
  let lastIndex = 0;

  for (const match of value.matchAll(CTA_TOKEN_REGEX)) {
    const matchIndex = match.index ?? 0;
    const [rawMatch, tokenValue] = match;

    if (matchIndex > lastIndex) {
      segments.push({
        type: "text",
        value: value.slice(lastIndex, matchIndex),
      });
    }

    const route = normalizeInternalRoute(tokenValue);

    if (route) {
      segments.push({
        type: "internal-cta",
        route,
      });
    } else {
      segments.push({
        type: "text",
        value: rawMatch,
      });
    }

    lastIndex = matchIndex + rawMatch.length;
  }

  if (lastIndex < value.length) {
    segments.push({
      type: "text",
      value: value.slice(lastIndex),
    });
  }

  return segments;
}

export function getInternalCtaLabel(route: string): string {
  if (route.startsWith("/details/menu/")) {
    return "Ver produto";
  }

  if (route.startsWith("/details/content/")) {
    return "Abrir conteúdo";
  }

  if (route.startsWith("/details/coupon/")) {
    return "Ver cupom";
  }

  if (route.startsWith("/details/partner/")) {
    return "Ver parceiro";
  }

  return "Saiba mais";
}
