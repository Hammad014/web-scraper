// Turns fetched HTML into useful information: people, services, facilities,
// contact details and the features a visitor can use.

import {
  SITE_TYPES,
  PAGE_CATEGORIES,
  COMMON_FEATURES,
  DOMAIN_FEATURES,
  COLLECTION_SKIP,
  CHAT_SCRIPTS,
  SOCIAL_NETWORKS,
  FACILITY_WORDS,
  SPECIALITY_WORDS,
  GENERIC_LINK_TEXT,
  SERVICE_HREF,
  FACILITY_HREF,
  SERVICE_INDEX,
  SERVICE_SKIP,
  STREET_WORDS,
  ADDRESS_STOP,
} from './keywords.js';

// A person's name starts with a title. Military ranks are included because
// Pakistani hospitals list plenty of them ("Brig R Dr Zulfiqar uddin Syed").
const NAME_START = /^(Dr|Prof|Professor|Brig|Col|Maj|Capt|Lt|Gen|Mr|Mrs|Ms)\b\.?\s/i;

// ...but only a medical title means the person is actually clinical staff.
// Searched anywhere in the name, since "Brig R Dr Zulfiqar" buries it.
const MEDICAL_TITLE = /\b(Dr|Prof|Professor)\b/i;

const INVISIBLE = /[​-‍﻿]/g;
const BLOCK_TAGS = 'p, div, br, li, tr, td, h1, h2, h3, h4, h5, h6, section, article';

export function cleanText(value) {
  return (value || '').replace(INVISIBLE, '').replace(/\s+/g, ' ').trim();
}

export function toAbsolute(link, base) {
  try {
    return new URL(link, base).href;
  } catch {
    return null;
  }
}

// Reads text with block elements kept apart, on a copy, so "<h5>Name</h5>
// <p>Ophthalmology</p>" doesn't come out as "NameOphthalmology".
function spacedText($, el) {
  const copy = $(el).clone();
  copy.find(BLOCK_TAGS).after(' ');
  return cleanText(copy.text());
}

// Next.js sites wrap the real image address inside their optimiser, like
// /_next/image?url=https%3A%2F%2F... so it has to be unwrapped first.
// Done with plain string work rather than a regex, because the address is
// full of slashes and question marks that are fiddly to escape.
function unwrapNextImage(src) {
  const marker = '/_next/image?url=';
  const at = src.indexOf(marker);
  if (at === -1) return src;

  const encoded = src.slice(at + marker.length).split('&')[0];
  try {
    return decodeURIComponent(encoded);
  } catch {
    return src;
  }
}

// Photos are often not <img> tags at all. Plenty of sites paint them on with
// style="background-image:url(...)", which is how this site does its doctor
// portraits, so that has to be read too.
function imageFrom($, container, baseUrl) {
  const img = container.find('img').first();
  let src = img.attr('src') || img.attr('data-src') || '';

  // a responsive image may only have srcset; the first entry is enough
  if (!src) {
    const srcset = img.attr('srcset') || '';
    src = (srcset.split(',')[0] || '').trim().split(' ')[0] || '';
  }

  // last resort: pull it out of style="background-image:url(...)"
  if (!src) {
    const style = container.find('[style*="background-image"]').first().attr('style') || '';
    const open = style.indexOf('(', style.indexOf('background-image'));
    const close = style.indexOf(')', open);
    if (open !== -1 && close !== -1) {
      src = style.slice(open + 1, close).replace(/['"]/g, '').trim();
    }
  }

  if (!src || src.startsWith('data:')) return null;
  return toAbsolute(unwrapNextImage(src), baseUrl);
}

// "ALL CAPS" and "diet-nutrition" both read badly on screen.
function tidyName(value) {
  let name = cleanText(value).replace(/\s*\|\s*.*$/, '');
  // only re-case if it's shouting, so "ICU" and "NICU" survive as they are
  if (name.length > 4 && name === name.toUpperCase()) {
    name = name.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  }
  return name;
}

// Many cards link out with "Read More" or an image and no text at all, but
// the address itself describes the thing: /facility/intensive-care-unit-icu.
// Hospital addresses are full of these, and "Icu" reads badly.
const ACRONYMS = new Set(['icu', 'nicu', 'ccu', 'ot', 'ipd', 'opd', 'epd', 'er', 'ecg', 'echo', 'mri', 'ct', 'xray', 'tv', 'faq']);

export function slugToName(url) {
  try {
    const parts = new URL(url).pathname.split('/').filter(Boolean);
    let last = parts[parts.length - 1] || '';
    // skip a trailing database id like /speciality/1127/diet-nutrition
    if (/^\d+$/.test(last)) last = parts[parts.length - 2] || '';

    return last
      .replace(/\.\w+$/, '')
      .replace(/[-_]+/g, ' ')
      .trim()
      .split(' ')
      .map((word) =>
        ACRONYMS.has(word.toLowerCase())
          ? word.toUpperCase()
          : word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join(' ');
  } catch {
    return '';
  }
}

/* ------------------------------------------------------------------ links */

export function collectLinks($, baseUrl) {
  const links = [];
  const seen = new Set();

  $('a[href]').each((i, el) => {
    const href = $(el).attr('href');
    if (!href || href.startsWith('#')) return;
    if (/^(mailto|tel|javascript):/i.test(href)) return;

    const absolute = toAbsolute(href, baseUrl);
    if (!absolute || seen.has(absolute)) return;
    seen.add(absolute);

    // A card-shaped link holds a heading plus a description; the heading on
    // its own is the name we want.
    const heading = $(el).find('h1, h2, h3, h4, h5, h6').first();
    const text = heading.length ? cleanText(heading.text()) : spacedText($, el);

    links.push({ text: text.slice(0, 120), href: absolute, raw: href });
  });

  return links;
}

function categoryOf(link) {
  const haystack = `${link.text} ${link.raw}`;
  const match = PAGE_CATEGORIES.find((category) => category.pattern.test(haystack));
  return match ? match.id : null;
}

export function findKeyPages(links) {
  const best = new Map();

  for (const link of links) {
    const category = categoryOf(link);
    if (!category) continue;
    const current = best.get(category);
    // the shortest address is usually the section index, not a deep page
    if (!current || link.href.length < current.href.length) best.set(category, link);
  }

  return PAGE_CATEGORIES.filter((c) => best.has(c.id)).map((category) => {
    const link = best.get(category.id);
    return {
      id: category.id,
      label: category.label,
      // the site's own wording is nicer than ours when it's usable
      siteLabel: link.text && link.text.length < 26 ? tidyName(link.text) : null,
      url: link.href,
      crawl: category.crawl,
    };
  });
}

/* ------------------------------------------------------------- site type */

export function detectSiteType(headline, body = '') {
  const strong = headline.toLowerCase();
  const weak = body.toLowerCase();

  // The title, description and menu say far more about what a site is than
  // its body text — a news site mentions "health" all day without being one.
  const scored = SITE_TYPES.map((type) => {
    let score = 0;
    for (const word of type.words) {
      if (strong.includes(word)) score += 3;
      else if (weak.includes(word)) score += 1;
    }
    return { type, score };
  }).sort((a, b) => b.score - a.score);

  const top = scored[0];
  const runnerUp = scored[1];
  if (!top || top.score < 6) {
    return { id: 'general', label: 'General Website', confidence: 0 };
  }

  const share = top.score / (top.score + (runnerUp ? runnerUp.score : 0));
  return {
    id: top.type.id,
    label: top.type.label,
    confidence: Math.min(95, Math.round(share * 100)),
  };
}

/* -------------------------------------------------------------- features */

// `siteTypeId` decides which vocabulary to use. A school gets the education
// checks and never gets asked about patient portals.
//
// `scriptSrcs` is passed in rather than read here, because the caller strips
// the <script> tags before this runs and the live-chat check needs them.
export function detectFeatures($, links, siteTypeId = 'general', scriptSrcs = '') {
  const checks = [...COMMON_FEATURES, ...(DOMAIN_FEATURES[siteTypeId] || [])];
  const linkCorpus = links.map((link) => `${link.text} ${link.raw}`);

  const results = checks.map((feature) => {
    const hit = links.find((link, i) => feature.pattern.test(linkCorpus[i]));
    return {
      id: feature.id,
      label: feature.label,
      hint: feature.hint,
      found: Boolean(hit),
      evidence: hit ? hit.href : null,
    };
  });

  // these three can't be found by reading links
  results.push({
    id: 'liveChat', label: 'Live chat widget', hint: 'A chat box for visitor questions',
    found: CHAT_SCRIPTS.test(scriptSrcs), evidence: null,
  });

  results.push({
    id: 'search', label: 'Site search', hint: 'A search box for the site itself',
    found: $('input[type="search"], input[name="q"], input[name="s"], form[role="search"]').length > 0,
    evidence: null,
  });

  results.push({
    id: 'newsletter', label: 'Newsletter signup', hint: 'Visitors can subscribe to updates',
    found: $('form').filter((i, el) => /subscribe|newsletter/i.test($(el).text())).length > 0,
    evidence: null,
  });

  return results;
}

/* --------------------------------------------------------------- contact */

function looksLikePhone(raw) {
  const text = raw.trim();
  if (/\d{4}-\d{2}-\d{2}/.test(text)) return false;          // a date
  if (/\d\.\d/.test(text)) return false;                      // 42.0739 / 16.0.5561
  if (/^(\d{4}[\s-]){3}\d{4}$/.test(text)) return false;      // card / account number
  if (!/^[+(0]/.test(text)) return false;                     // rules out PO boxes
  const digits = text.replace(/\D/g, '');
  return digits.length >= 9 && digits.length <= 15;
}

const tidyPhone = (raw) => cleanText(raw).replace(/[^\d+()\-\s]/g, '').trim();

function cleanEmail(raw) {
  let value = raw;
  try {
    value = decodeURIComponent(value);
  } catch {
    // a badly encoded address is better than none
  }
  value = value.replace(INVISIBLE, '').trim().toLowerCase();
  return /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/.test(value) ? value : null;
}

function looksLikeAddress(candidate) {
  if (!/^[A-Z]/.test(candidate)) return false;
  if (/[{};]|var\(|calc\(|rgba?\(|\dpx\b/i.test(candidate)) return false;
  if (candidate.length < 15 || candidate.length > 160) return false;
  // a real address carries a comma or a postcode-sized number
  return candidate.includes(',') || /\b\d{4,6}\b/.test(candidate);
}

function findAddress(haystack) {
  const pattern = new RegExp(
    // No "i" flag: the street word must be capitalised, which separates
    // "Stadium Road" from "road trip".
    `(?<![-\\w])[A-Z][A-Za-z0-9.'\\- ]{2,40}\\b${STREET_WORDS.source}\\b[^<>{};"\\\\]{0,70}`,
    'g'
  );

  for (const match of haystack.match(pattern) || []) {
    const candidate = cleanText(match)
      .replace(/^Address\s*[:\-]?\s*/i, '')
      .replace(ADDRESS_STOP, '')
      .replace(/([a-z0-9])\.\s+[A-Z][\s\S]*$/, '$1.')
      // Addresses are made of names and numbers. Two lowercase words in a row
      // means the sentence has carried on — "Adyala Road, and surrounding
      // areas with the expansion of..." is prose, not an address.
      .replace(/\s+[a-z]+\s+[a-z]+[\s\S]*$/, '')
      .replace(/[,\s]+$/, '')
      .trim();
    if (looksLikeAddress(candidate)) return candidate;
  }
  return null;
}

export function extractContact($, baseUrl, rawHtml = '') {
  // keyed by digits so "+92 51 5732855" and "0515732855" don't both show
  const phones = new Map();
  const emails = new Set();

  const addPhone = (value, minDigits) => {
    const number = tidyPhone(value);
    const digits = number.replace(/\D/g, '');
    if (digits.length < minDigits || digits.length > 15) return;
    if (!phones.has(digits)) phones.set(digits, number);
  };

  $('a[href^="tel:"]').each((i, el) => {
    let href = $(el).attr('href').replace(/^tel:/i, '');
    try {
      href = decodeURIComponent(href);
    } catch {
      // keep the raw value if it isn't valid encoding
    }
    addPhone(href, 3);
  });

  $('a[href^="mailto:"]').each((i, el) => {
    const address = cleanEmail($(el).attr('href').replace(/^mailto:/i, '').split('?')[0]);
    if (address) emails.add(address);
  });

  const bodyText = spacedText($, 'body');

  if (phones.size === 0) {
    for (const candidate of bodyText.match(/\+?\d[\d\s\-().]{8,}\d/g) || []) {
      if (looksLikePhone(candidate)) addPhone(candidate, 9);
      if (phones.size >= 6) break;
    }
  }

  if (emails.size === 0) {
    for (const raw of bodyText.match(/[\w.+-]+@[\w-]+\.[\w.]{2,}/g) || []) {
      if (/\.(png|jpe?g|gif|svg|webp)$/i.test(raw)) continue;
      if (/sentry|example\.com|wixpress|\.js$/i.test(raw)) continue;
      const address = cleanEmail(raw);
      if (address) emails.add(address);
      if (emails.size >= 6) break;
    }
  }

  const addresses = new Set();
  $('address').each((i, el) => {
    const text = cleanText($(el).text());
    if (text.length > 10) addresses.add(text.slice(0, 160));
  });

  if (addresses.size === 0) {
    const labelled = bodyText.match(/Address\s*[:\-]\s*([^|]{15,120})/i);
    if (labelled) {
      const value = cleanText(labelled[1]).replace(ADDRESS_STOP, '').trim();
      if (value.length >= 15) addresses.add(value.slice(0, 160));
    }
  }

  if (addresses.size === 0) {
    const fromText = findAddress(bodyText);
    if (fromText) {
      addresses.add(fromText);
    } else if (rawHtml) {
      // React sites often keep the address in a JSON blob inside a <script>,
      // so the raw HTML is searched too — minus stylesheets, which are full
      // of words like "padding-block".
      const searchable = rawHtml
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/\sstyle="[^"]*"/gi, ' ')
        .replace(/\\"/g, '"')
        .replace(/<[^>]+>/g, ' ');
      const fromHtml = findAddress(cleanText(searchable));
      if (fromHtml) addresses.add(fromHtml);
    }
  }

  const socials = [];
  const socialSeen = new Set();
  $('a[href]').each((i, el) => {
    const href = toAbsolute($(el).attr('href'), baseUrl);
    if (!href) return;
    for (const [name, pattern] of SOCIAL_NETWORKS) {
      if (pattern.test(href) && !socialSeen.has(name)) {
        socialSeen.add(name);
        socials.push({ name, url: href });
      }
    }
  });

  return {
    phones: [...phones.values()].slice(0, 8),
    emails: [...emails].slice(0, 6),
    addresses: [...addresses].slice(0, 3),
    socials,
  };
}

/* ---------------------------------------------------------------- banner */

// Home pages usually run a slider with several messages, not one, so all of
// the top-level headings are collected rather than just the first.
export function extractBanner($) {
  const collect = (selector) => {
    const found = [];
    const seen = new Set();

    $(selector).each((i, el) => {
      if (found.length >= 6) return false;
      const text = cleanText($(el).text());
      if (!text || text.length < 6 || text.length > 120) return;
      if (seen.has(text.toLowerCase())) return;
      seen.add(text.toLowerCase());
      found.push(text);
    });

    return found;
  };

  // Slider messages are h1s. Falling straight through to h2 would pull in
  // section titles like "Who We Are", which aren't banner content.
  let headings = collect('h1');
  if (headings.length === 0) headings = collect('h2');

  return {
    headings,
    tagline: cleanText($('meta[property="og:description"]').attr('content')).slice(0, 220),
    image: $('meta[property="og:image"]').attr('content') || null,
  };
}

/* ------------------------------------------------------------------ about */

// The About page's real content is in its longest paragraphs. Nav and footer
// text is short and repetitive, so length is a good filter on its own.
export function extractAbout($) {
  const paragraphs = [];
  const seen = new Set();

  $('p').each((i, el) => {
    if (paragraphs.length >= 4) return false;
    const text = cleanText($(el).text()).replace(/\s*\.\.\.\s*Read More$/i, '…');
    if (text.length < 80 || text.length > 600) return;

    // The same intro often appears twice (once in a hidden mobile layout),
    // so compare openings rather than the whole paragraph.
    const key = text.slice(0, 60).toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    paragraphs.push(text);
  });

  return paragraphs;
}

/* --------------------------------------------------------------- doctors */

// Climbs out of a link or heading until the surrounding element actually has
// more text than the element itself — that's the card holding the extra
// details. A photo-only wrapper has no text, which is why stopping at the
// first <div> found nothing.
function climbToCard($, el, maxLevels = 4) {
  const ownLength = cleanText($(el).text()).length;
  let node = $(el);

  for (let i = 0; i < maxLevels; i++) {
    const parent = node.parent();
    if (!parent.length) break;
    node = parent;
    if (cleanText(node.text()).length > ownLength + 3) return node;
  }

  return node;
}

export function extractDoctors($, baseUrl) {
  const people = [];
  const seen = new Set();

  $('h1, h2, h3, h4, h5, h6, a, strong, b').each((i, el) => {
    if (people.length >= 60) return false;

    // .clone().children().remove() leaves only this element's own words, so a
    // wrapper holding ten doctors doesn't look like one very long name
    const name = cleanText($(el).clone().children().remove().end().text());
    if (!name || name.length > 60 || !NAME_START.test(name)) return;

    const key = name.toLowerCase().replace(/[^a-z]/g, '');
    if (!key || seen.has(key)) return;

    const card = climbToCard($, el);

    // whatever the card says beyond the name is usually the speciality
    const extra = cleanText(spacedText($, card).replace(name, ' ')).slice(0, 90);
    let specialty = null;
    if (extra.length > 2 && extra.length < 90 && !NAME_START.test(extra)) {
      if (SPECIALITY_WORDS.test(extra) || extra.split(' ').length <= 6) specialty = extra;
    }

    // Board members are listed just like doctors, so someone only counts if
    // they carry a medical title or we found a role for them.
    if (!MEDICAL_TITLE.test(name) && !specialty) return;

    const href = $(el).is('a') ? $(el).attr('href') : card.find('a[href]').first().attr('href');

    seen.add(key);
    people.push({
      name,
      specialty,
      // The portrait usually sits in a sibling of the block holding the
      // name, so when the card itself has none, look one level out.
      image: imageFrom($, card, baseUrl) || imageFrom($, card.parent(), baseUrl),
      profile: href ? toAbsolute(href, baseUrl) : null,
    });
  });

  return people;
}

/* ------------------------------------------------- services & facilities */

// Pulls named items out of a listing page. Works whether the name is in the
// link, in a heading beside it, or only in the address.
export function extractItems($, baseUrl, pattern, limit = 60) {
  const items = [];
  const seen = new Set();

  $('a[href]').each((i, el) => {
    if (items.length >= limit) return false;

    const href = $(el).attr('href');
    if (!href) return;

    // Test the full address rather than the raw attribute. Plenty of sites
    // write relative links like "catalogue/x.html" with no leading slash,
    // and a pattern looking for "/catalogue/" never matches those.
    const absolute = toAbsolute(href, baseUrl);
    if (!absolute || !pattern.test(absolute)) return;

    const card = climbToCard($, el);
    const anchorText = cleanText($(el).text());
    const heading = card.find('h1, h2, h3, h4, h5, h6').first();

    // best name first: the link, then a heading in its card, then the address
    let name = '';
    if (anchorText && anchorText.length < 70 && !GENERIC_LINK_TEXT.test(anchorText)) {
      name = anchorText;
    }
    if (!name && heading.length) name = cleanText(heading.text()).slice(0, 70);
    if (!name) {
      const cardText = spacedText($, card);
      if (cardText && cardText.length < 70) name = cardText;
    }
    if (!name) name = slugToName(absolute);

    name = tidyName(name);
    if (!name || name.length < 3) return;
    if (GENERIC_LINK_TEXT.test(name) || SERVICE_INDEX.test(name) || SERVICE_SKIP.test(name)) return;

    const key = name.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);

    let description = spacedText($, card)
      .replace(name, ' ')
      .replace(/read more/gi, ' ')
      .trim();

    // Some cards hold nothing but the title, so stripping the name leaves a
    // scrap of text that just restates it. Better to show no description.
    const restatesName = description.toLowerCase().startsWith(name.toLowerCase().slice(0, 15));
    if (description.length < 25 || restatesName) description = '';
    if (description.length > 220) description = description.slice(0, 220) + '…';

    // Same as the doctor portraits: the picture often sits in a sibling of
    // the block holding the title, so look one level out when the card has none.
    items.push({
      name,
      url: absolute,
      description,
      image: imageFrom($, card, baseUrl) || imageFrom($, card.parent(), baseUrl),
    });
  });

  return items;
}

// Anything living under /facility/, or named after a place or a machine,
// is a facility rather than a treatment.
// Whole words only. Plain substring matching goes wrong fast — "ot", the
// abbreviation for operation theatre, sits inside "physiotherapy", and "lab"
// sits inside "collaboration".
// The trailing "s?" matters: without it "Operation Theatres" and "Labs" stop
// matching, because the word boundary lands before the plural.
const FACILITY_PATTERN = new RegExp(`\\b(${FACILITY_WORDS.join('|')})s?\\b`, 'i');

/* ---------------------------------------------- generic collections */

// "speciality" -> "Specialities", "news" -> "News", "product" -> "Products".
// Crude pluralisation is all a tab label needs.
export function labelForSegment(segment) {
  const label = segment
    .replace(/[-_]+/g, ' ')
    .trim()
    .split(' ')
    .map((word) =>
      ACRONYMS.has(word) ? word.toUpperCase() : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(' ');

  if (/s$/i.test(label)) return label;
  if (/y$/i.test(label)) return label.slice(0, -1) + 'ies';
  return label + 's';
}

// A site's own URL structure is its taxonomy, and reading it needs no
// vocabulary at all. Links sharing a first path segment are a collection:
// /doctor/... , /speciality/... , /news/... , /product/... . That's how a
// shop or a university gets sensible tabs without us knowing the subject.
export function discoverCollections(links, minItems = 4) {
  const groups = new Map();

  for (const link of links) {
    let parts;
    try {
      parts = new URL(link.href).pathname.split('/').filter(Boolean);
    } catch {
      continue;
    }

    // needs /segment/something — a bare /news is the index page, not an item
    if (parts.length < 2) continue;

    const segment = parts[0].toLowerCase();
    if (segment.length < 3 || COLLECTION_SKIP.test(segment)) continue;

    if (!groups.has(segment)) groups.set(segment, 0);
    groups.set(segment, groups.get(segment) + 1);
  }

  return [...groups.entries()]
    .filter(([, count]) => count >= minItems)
    .sort((a, b) => b[1] - a[1])
    .map(([segment, count]) => ({ segment, label: labelForSegment(segment), count }));
}

export function isFacility(item) {
  if (FACILITY_HREF.test(item.url)) return true;

  // The name decides the rest. Letting a "/services/" address rule it out
  // doesn't work: Liaquat National files its blood bank, cath lab and ICU
  // under /services/ too, and that emptied the facilities list completely.
  return FACILITY_PATTERN.test(item.name);
}

export { SERVICE_HREF, FACILITY_HREF };
