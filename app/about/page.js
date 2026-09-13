
export const metadata = {
  title: 'About — Web Scraper',
};

const TECH = [
  ['Next.js', 'Frontend UI and the server-side API route — one codebase'],
  ['React', 'Component-based UI with state handled by hooks'],
  ['Cheerio', 'Server-side HTML parsing — like jQuery, but for Node.js'],
  ['Tailwind CSS', 'Styling, written straight in the markup'],
  ['localStorage', 'Keeps the scrape history in the browser — no database needed'],
];

const LIMITATIONS = [
  'Works on static websites. Pages that load their content with JavaScript after the initial load will come back incomplete — that would need a headless browser like Puppeteer.',
  'Some sites block scrapers no matter what, even with a browser User-Agent header.',
  'Image previews can fail when the source site blocks hotlinking. Those show a placeholder instead.',
  'Requests time out after 15 seconds so a slow site cannot hang the page.',
  'History lives in your browser only — clearing site data erases it.',
];

export default function AboutPage() {
  return (
    <main className="px-4 pb-20">
      <div className="mx-auto max-w-3xl">
        <header className="mb-10">
          <h1 className="mb-2 text-3xl font-bold text-white">About</h1>
          <p className="text-sm text-gray-400">What this app is, how it works, and what it can&apos;t do.</p>
        </header>

        <section className="mb-10">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-500">
            What it does
          </h2>
          <p className="text-sm leading-relaxed text-gray-300">
            Web Scraper lets you paste any website URL and pull out its content — page title, meta
            description, headings, images, links and a text preview. It&apos;s handy for a quick
            content audit or an SEO check without digging through the page source by hand.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-500">
            How it works
          </h2>
          <p className="text-sm leading-relaxed text-gray-300">
            When you hit Scrape, the URL goes to <code className="rounded bg-gray-800 px-1.5 py-0.5 text-xs text-blue-400">/api/scrape</code>,
            a server-side route inside the app. That route fetches the raw HTML of the target page —
            the same HTML a browser would get — and uses Cheerio to pull out the useful parts. The
            results come back as JSON and React renders them. Because the fetch happens on the
            server and not in your browser, there are no CORS problems.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-500">
            Tech used
          </h2>
          <ul className="space-y-2">
            {TECH.map(([tech, description]) => (
              <li key={tech} className="flex flex-col gap-1 text-sm sm:flex-row sm:gap-3">
                <span className="w-28 shrink-0 font-medium text-blue-400">{tech}</span>
                <span className="text-gray-400">{description}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-500">
            Known limitations
          </h2>
          <ul className="space-y-2">
            {LIMITATIONS.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                <span className="mt-0.5 shrink-0 text-gray-600">—</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-500">
            Built by
          </h2>
          <p className="text-sm text-gray-300">Hammad</p>
        </section>
      </div>
    </main>
  );
}
