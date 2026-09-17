// Draws one section of the report, choosing a layout from the section's type.

'use client';

import { useState } from 'react';

const PAGE_SIZE = 12;

function Card({ title, badge, children }) {
  return (
    <section className="rounded-2xl border border-gray-800 bg-gray-900 p-4 sm:p-5">
      {title && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500">{title}</h2>
          {badge !== undefined && (
            <span className="rounded-full bg-gray-800 px-2 py-0.5 text-xs text-blue-400">{badge}</span>
          )}
        </div>
      )}
      {children}
    </section>
  );
}

// Long lists are cut to one page with a button to reveal more, because forty
// cards in one go is a wall.
function ShowMore({ shown, total, onMore, onLess }) {
  if (total <= PAGE_SIZE) return null;

  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
      {shown < total && (
        <button
          onClick={onMore}
          className="rounded-lg border border-gray-700 px-5 py-2 text-sm text-gray-200 transition-colors hover:border-blue-700 hover:text-white"
        >
          Show {Math.min(PAGE_SIZE, total - shown)} more
        </button>
      )}
      {shown > PAGE_SIZE && (
        <button onClick={onLess} className="text-sm text-gray-500 transition-colors hover:text-gray-300">
          Show less
        </button>
      )}
      <span className="text-xs text-gray-600">
        showing {shown} of {total}
      </span>
    </div>
  );
}

// Used when there's no photo: the first letter of the actual name, so every
// title in front of it has to come off first ("Prof. Dr. Abdul" has two).
function initial(name) {
  const bare = name.replace(/^((?:Professor|Prof|Brig|Col|Maj|Capt|Mrs|Ms|Mr|Dr)\.?\s*)+/i, '').trim();
  return (bare.charAt(0) || name.charAt(0) || '?').toUpperCase();
}

function FeatureRow({ feature }) {
  return (
    <li className="flex min-w-0 items-start gap-3 rounded-xl border border-green-800/50 bg-green-950/20 px-4 py-3">
      <span
        aria-hidden="true"
        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-500/20 text-xs text-green-400"
      >
        ✓
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-sm text-white">{feature.label}</p>
        {feature.evidence && (
          <a
            href={feature.evidence}
            target="_blank"
            rel="noopener noreferrer"
            className="block truncate text-xs text-blue-400 hover:text-blue-300"
          >
            {feature.evidence}
          </a>
        )}
      </div>
    </li>
  );
}

/* ------------------------------------------------------------- overview */

function Overview({ data }) {
  const { title, description, siteType, banner, about, highlights, pagesScanned } = data;

  // The headline answers for this kind of site. Only the ones it actually
  // has get a card; the rest are named in a single quiet line underneath.
  const present = highlights.filter((item) => item.found);
  const missing = highlights.filter((item) => !item.found);

  return (
    <div className="space-y-6">
      <Card title="About this organisation">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <h3 className="text-base font-semibold text-white sm:text-lg">{title}</h3>
          <span className="rounded-full bg-blue-950 px-2.5 py-1 text-xs font-medium text-blue-300">
            {siteType.label}
          </span>
        </div>

        {description && <p className="mb-4 text-sm leading-relaxed text-gray-400">{description}</p>}

        {about.length > 0 && (
          <div className="space-y-2 border-l-2 border-gray-800 pl-4">
            {about.map((paragraph, i) => (
              <p key={i} className="text-sm leading-relaxed text-gray-300">
                {paragraph}
              </p>
            ))}
          </div>
        )}
      </Card>

      {banner.headings.length > 0 && (
        <Card title="Banner content" badge={banner.headings.length}>
          <ul className="space-y-2">
            {banner.headings.map((heading, i) => (
              <li
                key={i}
                className="rounded-xl border-l-2 border-blue-600 bg-gray-950/50 px-4 py-2.5 text-sm text-gray-200"
              >
                {heading}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {present.length > 0 && (
        <Card title="At a glance" badge={present.length}>
          <ul className="grid gap-2 sm:grid-cols-2">
            {present.map((item) => (
              <li
                key={item.id}
                className="flex min-w-0 items-start gap-3 rounded-xl border border-green-800/50 bg-green-950/20 px-4 py-3"
              >
                <span
                  aria-hidden="true"
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-500/20 text-xs text-green-400"
                >
                  ✓
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-white">{item.label}</p>
                  {item.evidence && (
                    <a
                      href={item.evidence}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block truncate text-xs text-blue-400 hover:text-blue-300"
                    >
                      {item.evidence}
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>

          {missing.length > 0 && (
            <p className="mt-3 text-xs text-gray-600">
              Not found: {missing.map((item) => item.label).join(', ')}
            </p>
          )}
        </Card>
      )}

      <Card title="Pages read">
        <ul className="flex flex-wrap gap-2">
          {pagesScanned.map((page) => (
            <li
              key={page.url + page.label}
              className={`rounded-full border px-3 py-1 text-xs ${
                page.ok ? 'border-gray-700 text-gray-300' : 'border-gray-800 text-gray-600'
              }`}
              title={page.reason || page.url}
            >
              {page.label}
              {!page.ok && ' (not reached)'}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

/* --------------------------------------------------------------- people */

function People({ items }) {
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [broken, setBroken] = useState([]);
  const visible = items.slice(0, limit);

  return (
    <div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {visible.map((person, i) => (
          <li
            key={person.name + i}
            className="group overflow-hidden rounded-2xl border border-gray-800 bg-gray-900 transition-colors hover:border-blue-800/70"
          >
            <div className="aspect-square overflow-hidden bg-gray-800">
              {person.image && !broken.includes(i) ? (
                // plain <img> because next/image needs every external domain
                // listed up front, and we can't know them in advance
                <img
                  src={person.image}
                  alt={person.name}
                  loading="lazy"
                  onError={() => setBroken((prev) => [...prev, i])}
                  className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-950/70 to-gray-900 text-3xl font-semibold text-blue-300/70">
                  {initial(person.name)}
                </div>
              )}
            </div>

            <div className="p-3 sm:p-3.5">
              <p className="truncate text-sm font-medium text-white" title={person.name}>
                {person.name}
              </p>
              {person.specialty && (
                <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-blue-400">
                  {person.specialty}
                </p>
              )}
              {person.profile && (
                <a
                  href={person.profile}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-xs text-gray-500 transition-colors hover:text-gray-300"
                >
                  View profile ↗
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>

      <ShowMore
        shown={visible.length}
        total={items.length}
        onMore={() => setLimit((l) => l + PAGE_SIZE)}
        onLess={() => setLimit(PAGE_SIZE)}
      />
    </div>
  );
}

/* ----------------------------------------------------------------- list */

function ItemList({ items }) {
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [broken, setBroken] = useState([]);
  const visible = items.slice(0, limit);

  return (
    <div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {visible.map((item, i) => (
          <li
            key={item.name + i}
            className="group overflow-hidden rounded-2xl border border-gray-800 bg-gray-900 transition-colors hover:border-blue-800/70"
          >
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="block">
              <div className="aspect-[4/3] overflow-hidden bg-gray-800">
                {item.image && !broken.includes(i) ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    loading="lazy"
                    onError={() => setBroken((prev) => [...prev, i])}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 text-2xl font-semibold text-gray-600">
                    {initial(item.name)}
                  </div>
                )}
              </div>

              <div className="p-3 sm:p-3.5">
                <p className="text-sm font-semibold leading-snug text-white transition-colors group-hover:text-blue-300">
                  {item.name}
                </p>
                {/* only shown when there's a real description behind it */}
                {item.description && (
                  <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-gray-400">
                    {item.description}
                  </p>
                )}
              </div>
            </a>
          </li>
        ))}
      </ul>

      <ShowMore
        shown={visible.length}
        total={items.length}
        onMore={() => setLimit((l) => l + PAGE_SIZE)}
        onLess={() => setLimit(PAGE_SIZE)}
      />
    </div>
  );
}

/* ------------------------------------------------------------- features */

function Features({ items }) {
  const [limit, setLimit] = useState(PAGE_SIZE);
  const found = items.filter((feature) => feature.found);
  const visible = found.slice(0, limit);

  if (found.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-gray-800 px-6 py-12 text-center text-sm text-gray-500">
        No visitor features were found on the pages that were read.
      </p>
    );
  }

  return (
    <div>
      <ul className="grid gap-2 sm:grid-cols-2">
        {visible.map((feature) => (
          <FeatureRow key={feature.id} feature={feature} />
        ))}
      </ul>
      <ShowMore
        shown={visible.length}
        total={found.length}
        onMore={() => setLimit((l) => l + PAGE_SIZE)}
        onLess={() => setLimit(PAGE_SIZE)}
      />
    </div>
  );
}

/* -------------------------------------------------------------- contact */

function Contact({ data }) {
  const rows = [
    ['Phone', data.phones.map((p) => ({ label: p, href: `tel:${p.replace(/\s/g, '')}` }))],
    ['Email', data.emails.map((e) => ({ label: e, href: `mailto:${e}` }))],
    ['Social', data.socials.map((s) => ({ label: s.name, href: s.url }))],
  ];

  return (
    <Card title="Contact information">
      <div className="divide-y divide-gray-800">
        {data.addresses.length > 0 && (
          <div className="flex flex-col gap-1 py-3 sm:flex-row sm:gap-4">
            <span className="w-20 shrink-0 text-xs uppercase tracking-wide text-gray-500">
              Address
            </span>
            <div className="min-w-0 space-y-1">
              {data.addresses.map((address) => (
                <p key={address} className="text-sm text-gray-300">
                  {address}
                </p>
              ))}
            </div>
          </div>
        )}

        {rows.map(([label, links]) =>
          links.length === 0 ? null : (
            <div key={label} className="flex flex-col gap-1 py-3 sm:flex-row sm:gap-4">
              <span className="w-20 shrink-0 text-xs uppercase tracking-wide text-gray-500">
                {label}
              </span>
              <div className="flex min-w-0 flex-wrap gap-x-4 gap-y-1">
                {links.map((link) => (
                  <a
                    key={link.href + link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all text-sm text-blue-400 hover:text-blue-300"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          )
        )}
      </div>
    </Card>
  );
}

/* ---------------------------------------------------------------- pages */

function Pages({ items }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((page) => (
        <li key={page.id} className="min-w-0">
          <a
            href={page.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-xl border border-gray-800 bg-gray-900 px-4 py-3 transition-colors hover:border-blue-800/70"
          >
            <p className="truncate text-sm text-white">{page.siteLabel || page.label}</p>
            <p className="truncate text-xs text-blue-400/70">{page.url}</p>
          </a>
        </li>
      ))}
    </ul>
  );
}

/* --------------------------------------------------------------- picker */

export default function SectionView({ section }) {
  switch (section.type) {
    case 'overview':
      return <Overview data={section.data} />;
    case 'people':
      // keyed so switching between two list-style tabs resets "show more"
      return <People key={section.id} items={section.items} />;
    case 'list':
      return <ItemList key={section.id} items={section.items} />;
    case 'features':
      return <Features key={section.id} items={section.items} />;
    case 'contact':
      return <Contact data={section.data} />;
    case 'pages':
      return <Pages items={section.items} />;
    default:
      return null;
  }
}
