// The scraping happens here, on the server.
// Browsers can't fetch other websites directly because of CORS,
// so the page sends the URL here and we do the fetching instead.

import dns from 'node:dns';
import * as cheerio from 'cheerio';

// Node tries IPv6 addresses first by default. On networks without working
// IPv6 that means every request sits there until it times out, so ask for
// IPv4 addresses first instead.
dns.setDefaultResultOrder('ipv4first');

// How long we wait for a slow site before giving up
const TIMEOUT_MS = 15000;

// Most sites block requests that don't look like they came from a real browser
const BROWSER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// People usually type "example.com" without the https:// part, so add it for them.
// Returns null if what they typed still isn't a usable URL.
function cleanUrl(input) {
  let text = input.trim();

  if (!text.startsWith('http://') && !text.startsWith('https://')) {
    text = 'https://' + text;
  }

  try {
    const parsed = new URL(text);
    // no point fetching something that has no real domain
    if (!parsed.hostname.includes('.')) return null;
    return parsed.href;
  } catch {
    return null;
  }
}

// Links in HTML are often relative ("/about", "images/logo.png").
// Those are useless on their own, so turn them into full URLs.
function toAbsolute(link, base) {
  try {
    return new URL(link, base).href;
  } catch {
    return null;
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const rawUrl = searchParams.get('url');

  if (!rawUrl) {
    return Response.json({ error: 'No URL provided.' }, { status: 400 });
  }

  const url = cleanUrl(rawUrl);
  if (!url) {
    return Response.json(
      { error: "That doesn't look like a valid URL. Try something like example.com" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': BROWSER_AGENT },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      redirect: 'follow',
    });

    if (!res.ok) {
      return Response.json(
        { error: `The site responded with ${res.status} ${res.statusText}.` },
        { status: 502 }
      );
    }

    // If the link points to a PDF or an image there's no HTML to parse
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('html')) {
      return Response.json(
        { error: 'That link is not an HTML page, so there is nothing to scrape.' },
        { status: 415 }
      );
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    // res.url is where we ended up after redirects — that's the correct
    // base for turning relative links into absolute ones
    const baseUrl = res.url || url;

    const title = $('title').first().text().trim() || 'No title found';

    const metaDescription =
      $('meta[name="description"]').attr('content')?.trim() ||
      $('meta[property="og:description"]').attr('content')?.trim() ||
      'No description found';

    const headings = [];
    $('h1, h2, h3').each((i, el) => {
      const text = $(el).text().replace(/\s+/g, ' ').trim();
      if (text) {
        headings.push({ level: el.tagName.toUpperCase(), text });
      }
    });

    // A page often links to the same place more than once,
    // so keep a Set of what we've already added
    const links = [];
    const seenLinks = new Set();

    $('a[href]').each((i, el) => {
      const href = $(el).attr('href');

      // anchors, mailto:, tel: and javascript: aren't pages, so skip them
      if (!href || href.startsWith('#')) return;
      if (/^(mailto|tel|javascript):/i.test(href)) return;

      const absolute = toAbsolute(href, baseUrl);
      if (!absolute || seenLinks.has(absolute)) return;

      seenLinks.add(absolute);
      links.push({
        text: $(el).text().replace(/\s+/g, ' ').trim() || absolute,
        href: absolute,
      });
    });

    const images = [];
    $('img').each((i, el) => {
      // lazy-loaded images keep the real file in data-src instead of src
      const src = $(el).attr('src') || $(el).attr('data-src');
      if (!src || src.startsWith('data:')) return;

      const absolute = toAbsolute(src, baseUrl);
      if (!absolute) return;

      images.push({ src: absolute, alt: $(el).attr('alt')?.trim() || '' });
    });

    // Scripts and styles sit inside <body> too, and their code would end up
    // in the text preview, so remove them before reading the text
    $('script, style, noscript').remove();

    // .text() glues everything together, so "<h1>Title</h1><p>Hello</p>" comes
    // out as "TitleHello". Adding a space after each block fixes that.
    $('p, div, br, li, tr, h1, h2, h3, h4, h5, h6, section, article').after(' ');
    const fullText = $('body').text().replace(/\s+/g, ' ').trim();

    return Response.json({
      scrapedUrl: baseUrl,
      title,
      metaDescription,
      headings,
      links: links.slice(0, 30),
      images: images.slice(0, 12),
      bodyText: fullText.slice(0, 600),
      // these feed the little stats row above the results
      stats: {
        headings: headings.length,
        links: links.length,
        images: images.length,
        words: fullText ? fullText.split(' ').length : 0,
      },
    });
  } catch (error) {
    // A timeout and a dead domain both end up here but mean different
    // things to the user, so send back the message that actually fits
    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      return Response.json(
        { error: 'The site took too long to respond. It may be slow or blocking us.' },
        { status: 504 }
      );
    }

    return Response.json(
      { error: "Couldn't reach that site. Check the URL and try again." },
      { status: 500 }
    );
  }
}
