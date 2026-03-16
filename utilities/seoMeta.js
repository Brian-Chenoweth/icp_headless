const STOP_WORDS = new Set([
  'a',
  'about',
  'after',
  'all',
  'also',
  'an',
  'and',
  'any',
  'are',
  'as',
  'at',
  'be',
  'because',
  'been',
  'before',
  'being',
  'but',
  'by',
  'can',
  'could',
  'do',
  'each',
  'for',
  'from',
  'get',
  'has',
  'have',
  'how',
  'if',
  'in',
  'into',
  'is',
  'it',
  'its',
  'more',
  'new',
  'no',
  'not',
  'of',
  'on',
  'or',
  'our',
  'out',
  'over',
  'that',
  'the',
  'their',
  'them',
  'there',
  'these',
  'they',
  'this',
  'to',
  'up',
  'us',
  'we',
  'what',
  'when',
  'where',
  'which',
  'with',
  'you',
  'your',
]);

const HTML_ENTITY_MAP = {
  '&amp;': '&',
  '&apos;': "'",
  '&#39;': "'",
  '&quot;': '"',
  '&ldquo;': '"',
  '&rdquo;': '"',
  '&lsquo;': "'",
  '&rsquo;': "'",
  '&nbsp;': ' ',
  '&ndash;': '-',
  '&mdash;': '-',
  '&hellip;': '...',
};

function decodeEntities(text = '') {
  return Object.entries(HTML_ENTITY_MAP).reduce(
    (result, [entity, value]) => result.replaceAll(entity, value),
    text
  );
}

function normalizeText(value) {
  return `${value ?? ''}`.replace(/\s+/g, ' ').trim();
}

export function stripHtml(html = '') {
  return normalizeText(
    decodeEntities(
      `${html ?? ''}`
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
    )
  );
}

function truncateAtWordBoundary(text, maxLength) {
  if (!text || text.length <= maxLength) {
    return text;
  }

  const clipped = text.slice(0, maxLength + 1);
  const lastSpace = clipped.lastIndexOf(' ');
  const safeLength = lastSpace > 0 ? lastSpace : maxLength;

  return `${clipped.slice(0, safeLength).trim()}...`;
}

export function buildMetaDescription({
  title = '',
  content = '',
  fallback = '',
  maxLength = 160,
}) {
  const bodyText = stripHtml(content);
  const candidate = bodyText || normalizeText(fallback) || normalizeText(title);

  return truncateAtWordBoundary(candidate, maxLength);
}

export function buildKeywordString({
  title = '',
  content = '',
  seedKeywords = [],
  maxKeywords = 10,
}) {
  const seeded = seedKeywords
    .map((keyword) => normalizeText(keyword))
    .filter(Boolean);
  const seededSet = new Set(seeded.map((keyword) => keyword.toLowerCase()));
  const frequency = new Map();
  const text = `${normalizeText(title)} ${stripHtml(content)}`.toLowerCase();
  const words = text.match(/[a-z0-9]{3,}/g) ?? [];

  words.forEach((word) => {
    if (STOP_WORDS.has(word)) {
      return;
    }

    frequency.set(word, (frequency.get(word) ?? 0) + 1);
  });

  const rankedWords = [...frequency.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([word]) => word)
    .filter((word) => !seededSet.has(word));

  return [...seeded, ...rankedWords].slice(0, maxKeywords).join(', ');
}
