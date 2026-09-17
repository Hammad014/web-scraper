// Fetches the site on the server, pulls out what matters, and returns it
// as a list of sections so the page can build its tabs from them.

import * as cheerio from 'cheerio';
import { cleanUrl, fetchPage, fetchMany, isSameSite, MAX_EXTRA_PAGES } from '@/app/lib/crawl';
import { DOMAIN_HIGHLIGHTS, FEATURE_LABELS } from '@/app/lib/keywords';
import {
  cleanText,
  collectLinks,
  findKeyPages,
  detectSiteType,
  detectFeatures,
  discoverCollections,
  extractContact,
  extractBanner,
  extractAbout,
  extractDoctors,
  extractItems,
  isFacility,
  slugToName,
  SERVICE_HREF,
  FACILITY_HREF,
} from '@/app/lib/extract';

const ITEM_HREF = new RegExp(`${FACILITY_HREF.source}|${SERVICE_HREF.source}`, 'i');

// Segments already reported by a section of their own, so they don't come
// back a second time as a generic collection.
const ALREADY_COVERED =
  /doctor|physician|consultant|team|staff|faculty|special|service|department|facilit|clinic|treatment|procedure|centre|center/i;

function mergeUnique(lists, keyOf, limit) {
  const seen = new Set();
  const merged = [];

  for (const list of lists) {
    for (const item of list) {
      const key = keyOf(item);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      merged.push(item);
      if (merged.length >= limit) return merged;
    }
  }

  return merged;
}

// Prefer the site's own wording for a tab name. A hospital calling them
// "Specialities" shouldn't get a tab labelled "Services".
function labelFor(keyPages, id, fallback) {
  const page = keyPages.find((item) => item.id === id);
  if (!page) return fallback;
  return page.siteLabel || slugToName(page.url) || fallback;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const rawUrl = searchParams.get('url');
  const deep = searchParams.get('deep') !== '0';

  if (!rawUrl) {
    return Response.json({ error: 'No URL provided.' }, { status: 400 });
  }

  const startUrl = cleanUrl(rawUrl);
  if (!startUrl) {
    return Response.json(
      { error: "That doesn't look like a valid URL. Try something like example.com" },
      { status: 400 }
    );
  }

  const home = await fetchPage(startUrl);
  if (!home.ok) {
    return Response.json({ error: `${home.reason}.` }, { status: home.suggestedStatus || 502 });
  }

  const $home = cheerio.load(home.html);
  const baseUrl = home.url;
  const homeLinks = collectLinks($home, baseUrl);
  const keyPages = findKeyPages(homeLinks);

  // Grabbed now because the live-chat check needs the script tags, and they
  // get stripped below before any text is read.
  const scriptSrcs = $home('script[src]')
    .map((i, el) => $home(el).attr('src'))
    .get()
    .join(' ');

  const targets = deep
    ? keyPages.filter((p) => p.crawl && isSameSite(p.url, baseUrl)).slice(0, MAX_EXTRA_PAGES)
    : [];
  const extraPages = await fetchMany(targets);

  // The raw HTML is kept alongside each page because some sites hide their
  // address in a JSON blob that never reaches the visible text.
  const loaded = [{ $: $home, url: baseUrl, label: 'Home page', id: 'home', html: home.html }];
  for (const page of extraPages) {
    if (!page.ok) continue;
    const $page = cheerio.load(page.html);
    $page('script, style, noscript').remove();
    loaded.push({ $: $page, url: page.url, label: page.label, id: page.category, html: page.html });
  }

  // everything below reads text, so the scripts and styles go now
  $home('script, style, noscript').remove();

  /* ---------------------------------------------------- gather the facts */

  const allLinks = loaded.flatMap((page) => collectLinks(page.$, page.url));

  const contacts = loaded.map((p) => extractContact(p.$, p.url, p.html));
  const contact = {
    phones: mergeUnique(contacts.map((c) => c.phones), (p) => p.replace(/\D/g, ''), 8),
    emails: mergeUnique(contacts.map((c) => c.emails), (e) => e, 6),
    addresses: mergeUnique(contacts.map((c) => c.addresses), (a) => a.toLowerCase(), 3),
    socials: mergeUnique(contacts.map((c) => c.socials), (s) => s.name, 8),
  };

  const people = mergeUnique(
    loaded.map((p) => extractDoctors(p.$, p.url)),
    (person) => person.name.toLowerCase().replace(/[^a-z]/g, ''),
    60
  );

  const allItems = mergeUnique(
    loaded.map((p) => extractItems(p.$, p.url, ITEM_HREF)),
    (item) => item.name.toLowerCase(),
    80
  );
  const facilities = allItems.filter(isFacility);
  const services = allItems.filter((item) => !isFacility(item));

  const aboutPage = loaded.find((p) => p.id === 'about');
  const about = extractAbout((aboutPage || loaded[0]).$);
  const banner = extractBanner($home);

  // What kind of site this is, decided before the checklist runs so the
  // right vocabulary gets used.
  const headlineText = [
    cleanText($home('title').first().text()),
    $home('meta[name="description"]').attr('content') || '',
    homeLinks.map((link) => link.text).join(' '),
  ].join(' ');
  const siteType = detectSiteType(headlineText, cleanText($home('body').text()).slice(0, 4000));

  // Every page that was read, not just the home page — a site can easily
  // link its lab reports from an inner page only.
  const features = detectFeatures($home, allLinks, siteType.id, scriptSrcs);
  const foundFeatures = features.filter((f) => f.found);

  /* ------------------------------------------- collections from the URLs */

  const discovered = discoverCollections(allLinks)
    .filter((c) => !ALREADY_COVERED.test(c.segment))
    .slice(0, 4);

  const collections = [];
  for (const group of discovered) {
    const pattern = new RegExp(`/${group.segment}/`, 'i');
    const items = mergeUnique(
      loaded.map((p) => extractItems(p.$, p.url, pattern, 40)),
      (item) => item.name.toLowerCase(),
      40
    );
    // a handful of stray links isn't a collection worth its own tab
    if (items.length >= 4) collections.push({ ...group, items });
  }

  const title =
    cleanText($home('head title').first().text()) ||
    cleanText($home('meta[property="og:title"]').attr('content')) ||
    cleanText($home('h1').first().text()) ||
    'No title found';

  const description =
    cleanText($home('meta[name="description"]').attr('content')) ||
    cleanText($home('meta[property="og:description"]').attr('content')) ||
    '';

  /* ------------------------------------------------- build the sections */

  // The few questions worth a plain yes or no. These keep showing a "no",
  // because "this site has no online booking" is a real answer.
  const highlightIds = DOMAIN_HIGHLIGHTS[siteType.id] || DOMAIN_HIGHLIGHTS.general;
  const highlights = highlightIds
    .map((id) => features.find((f) => f.id === id))
    .filter(Boolean)
    .map((f) => ({ id: f.id, label: f.label, found: f.found, evidence: f.evidence }));

  const sections = [];

  sections.push({
    id: 'overview',
    label: 'Overview',
    type: 'overview',
    data: {
      title,
      description,
      siteType,
      banner,
      about,
      highlights,
      pagesScanned: [
        { url: baseUrl, label: 'Home page', ok: true, reason: null },
        ...extraPages.map((p) => ({
          url: p.url,
          label: p.label,
          ok: p.ok,
          reason: p.ok ? null : p.reason,
        })),
      ],
    },
  });

  if (people.length > 0) {
    sections.push({
      id: 'people',
      label: labelFor(keyPages, 'doctors', 'Team'),
      type: 'people',
      count: people.length,
      items: people,
    });
  }

  if (services.length > 0) {
    sections.push({
      id: 'services',
      label: labelFor(keyPages, 'services', 'Services'),
      type: 'list',
      count: services.length,
      items: services,
    });
  }

  if (facilities.length > 0) {
    sections.push({
      id: 'facilities',
      label: labelFor(keyPages, 'facilities', 'Facilities'),
      type: 'list',
      count: facilities.length,
      items: facilities,
    });
  }

  // whatever else the site's own URL structure turned up
  for (const collection of collections) {
    sections.push({
      id: `collection-${collection.segment}`,
      label: collection.label,
      type: 'list',
      count: collection.items.length,
      items: collection.items,
    });
  }

  // Only when something was actually found, and named for the audience —
  // a school gets "Student Features", not "Patient Features".
  if (foundFeatures.length > 0) {
    sections.push({
      id: 'features',
      label: FEATURE_LABELS[siteType.id] || FEATURE_LABELS.general,
      type: 'features',
      count: foundFeatures.length,
      items: features,
    });
  }

  if (contact.phones.length || contact.emails.length || contact.addresses.length || contact.socials.length) {
    sections.push({ id: 'contact', label: 'Contact', type: 'contact', data: contact });
  }

  if (keyPages.length > 0) {
    sections.push({
      id: 'pages',
      label: 'Key Pages',
      type: 'pages',
      count: keyPages.length,
      items: keyPages.map(({ crawl, ...rest }) => rest),
    });
  }

  return Response.json({
    scrapedUrl: baseUrl,
    title,
    siteType,
    sections,
    pagesRead: loaded.length,
  });
}
