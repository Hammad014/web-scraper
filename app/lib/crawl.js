// Fetching pages from the target site: timeouts, error handling and the
// same-site check that stops the crawl wandering off.

import dns from 'node:dns';

// Node tries IPv6 first by default. On a network without working IPv6 that
// means every request waits for a timeout before falling back, so ask for
// IPv4 addresses first instead.
dns.setDefaultResultOrder('ipv4first');

const TIMEOUT_MS = 20000;

// How many sub-pages to fetch at the same time.
//
// One, from measurement rather than instinct. Fetching all five at once made
// every single one time out. Two at a time still lost a page and took 53s.
// One at a time fetched every page in 2-4 seconds with nothing dropped —
// the pages are around a megabyte each, so they want the whole connection.
const FETCH_AT_ONCE = 1;
const BROWSER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// Sites start returning 403 if you hammer them, so this stays small.
export const MAX_EXTRA_PAGES = 5;

export function cleanUrl(input) {
  let text = (input || '').trim();
  if (!text) return null;

  if (!text.startsWith('http://') && !text.startsWith('https://')) {
    text = 'https://' + text;
  }

  try {
    const parsed = new URL(text);
    if (!parsed.hostname.includes('.')) return null;
    return parsed.href;
  } catch {
    return null;
  }
}

// The real error code is rarely on the error itself. It sits one or two
// levels down in .cause, and when a hostname has several IP addresses the
// cause is an AggregateError holding one failure per address.
function findErrorCode(error, depth = 0) {
  if (!error || depth > 4) return null;
  if (error.code) return error.code;
  if (Array.isArray(error.errors) && error.errors.length > 0) {
    return findErrorCode(error.errors[0], depth + 1);
  }
  return findErrorCode(error.cause, depth + 1);
}

function describeFailure(error) {
  if (error.name === 'TimeoutError' || error.name === 'AbortError') {
    return { reason: 'The site took too long to respond', suggestedStatus: 504 };
  }

  const code = findErrorCode(error);

  switch (code) {
    case 'UND_ERR_CONNECT_TIMEOUT':
    case 'ETIMEDOUT':
      return {
        reason: 'Could not reach the site — this usually means your own internet connection is down',
        suggestedStatus: 504,
      };

    case 'ENOTFOUND':
    case 'EAI_AGAIN':
      return {
        reason: 'That domain could not be found — check the spelling, or your internet may be offline',
        suggestedStatus: 502,
      };

    case 'ECONNREFUSED':
      return { reason: 'The site refused the connection', suggestedStatus: 502 };

    case 'ECONNRESET':
      return { reason: 'The connection was cut off partway through', suggestedStatus: 502 };

    case 'CERT_HAS_EXPIRED':
    case 'DEPTH_ZERO_SELF_SIGNED_CERT':
    case 'UNABLE_TO_VERIFY_LEAF_SIGNATURE':
      return { reason: "The site's security certificate could not be verified", suggestedStatus: 502 };

    default:
      return { reason: 'Could not connect to the site', suggestedStatus: 502 };
  }
}

// Fetches one page. Never throws — the caller gets { ok: false, reason }
// instead, so one dead sub-page can't sink the whole scan.
export async function fetchPage(url) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': BROWSER_AGENT },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      redirect: 'follow',
    });

    if (!res.ok) {
      return {
        ok: false,
        url,
        reason: `The site responded with ${res.status}`,
        suggestedStatus: 502,
      };
    }

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('html')) {
      return {
        ok: false,
        url,
        reason: 'That link is not an HTML page, so there is nothing to scrape',
        suggestedStatus: 415,
      };
    }

    return { ok: true, url: res.url || url, html: await res.text(), status: res.status };
  } catch (error) {
    return { ok: false, url, ...describeFailure(error) };
  }
}

// Only follow links on the same site. Following outward would wander off
// into social media and never finish.
export function isSameSite(url, baseUrl) {
  try {
    const a = new URL(url);
    const b = new URL(baseUrl);
    // treat www.site.com and site.com as the same place
    return a.hostname.replace(/^www\./, '') === b.hostname.replace(/^www\./, '');
  } catch {
    return false;
  }
}

// Fetches the chosen sub-pages, one at a time — see FETCH_AT_ONCE above.
export async function fetchMany(targets) {
  const results = [];

  for (let i = 0; i < targets.length; i += FETCH_AT_ONCE) {
    const batch = targets.slice(i, i + FETCH_AT_ONCE);
    const fetched = await Promise.all(batch.map((target) => fetchPage(target.url)));

    fetched.forEach((result, j) => {
      results.push({ ...result, category: batch[j].id, label: batch[j].label });
    });
  }

  return results;
}
