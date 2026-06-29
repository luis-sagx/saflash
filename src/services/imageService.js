// saflash — Image service
// Fetches a real, free, no-API-key photo for a word using the Wikipedia REST
// summary endpoint. Results are cached per word in memory; the caller persists
// the URI in SQLite so it works offline afterwards. If anything fails, returns
// null and the UI falls back to the emoji visual.

const WIKI_SUMMARY =
  'https://en.wikipedia.org/api/rest_v1/page/summary/';

// Wikimedia REQUIRES a descriptive User-Agent; without it requests get
// throttled with HTTP 429. (Verified: with this header, concrete nouns return
// valid images reliably; without it, rapid requests are blocked.)
const USER_AGENT =
  'saflash-langlearn/1.0 (https://github.com/saflash; educational flashcard app)';

const memoryCache = new Map();

async function fetchWithTimeout(url, ms = 6000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json', 'Api-User-Agent': USER_AGENT },
    });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Returns a thumbnail image URI for the given word.
 *
 * - Resolves to a URI string when a relevant photo exists.
 * - Resolves to `null` when the result is DEFINITIVE: the page exists but has no
 *   usable image, or it is a disambiguation page. The caller can stop retrying.
 * - THROWS on a TRANSIENT failure (HTTP 429 rate-limit, 5xx, network, timeout)
 *   so the caller knows it's worth retrying later instead of finalizing.
 */
export async function getWordImageUri(word) {
  if (!word) return null;
  const key = String(word).toLowerCase().trim();
  if (memoryCache.has(key)) return memoryCache.get(key);

  const slug = encodeURIComponent(key.replace(/\s+/g, '_'));
  const res = await fetchWithTimeout(`${WIKI_SUMMARY}${slug}`); // may throw (timeout/network)

  if (res.status === 404) {
    // No such page — definitive "no image".
    memoryCache.set(key, null);
    return null;
  }
  if (!res.ok) {
    // 429 / 5xx — transient. Signal retryable; do NOT cache.
    throw new Error(`wiki ${res.status}`);
  }

  const data = await res.json();
  if (data.type === 'disambiguation') {
    memoryCache.set(key, null); // definitive
    return null;
  }
  const uri = data.thumbnail?.source || data.originalimage?.source || null;
  memoryCache.set(key, uri); // definitive (image or genuinely none)
  return uri;
}

export default getWordImageUri;
