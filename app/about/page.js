// About page: what SiteLens does, how it decides what to show, and its limits.

export const metadata = {
  title: 'About — SiteLens',
};

const EXTRACTED = [
  ['People', 'Names, roles and photos of the people a site lists'],
  ['What they offer', 'Services, departments, products — whatever the site sells or provides'],
  ['Facilities', 'Places and equipment, kept separate from treatments'],
  ['Contact details', 'Phone numbers, emails, address and social profiles'],
  ['Key pages', 'About, Contact, Careers and the rest of the navigation'],
  ['Banner content', 'Every message in the home page slider, not just the first'],
  ['Visitor features', 'Booking, logins, payments — whichever apply to that kind of site'],
];

const TECH = [
  ['Next.js', 'The interface and the server-side API route, in one project'],
  ['React', 'Components with state handled by hooks'],
  ['Cheerio', 'Server-side HTML parsing — like jQuery, but for Node.js'],
  ['Tailwind CSS', 'Styling, written straight into the markup'],
  ['localStorage', 'Keeps your scan history in the browser, so there is no database'],
];

const LIMITATIONS = [
  'It reads the HTML a browser first receives, not the finished page. Sites that build their content with JavaScript afterwards give up far less, and getting those properly would need a headless browser like Puppeteer.',
  'A scan covers the home page plus up to five sections found in the navigation. Anything deeper is not visited, so "not found" only ever means "not on the pages I read".',
  'People, services and addresses are worked out from patterns rather than any standard the sites follow, so an unusually worded site gives thinner results.',
  'Some sites block scrapers outright, and a few start refusing once you have asked a few times in a row.',
  'Requests give up after 20 seconds so a slow site cannot hang the page.',
  'History lives in this browser only — clearing your site data wipes it.',
];

function Section({ title, children }) {
  return (
    <section className="mb-10">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-500">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Pairs({ rows, width }) {
  return (
    <ul className="space-y-2">
      {rows.map(([name, detail]) => (
        <li key={name} className="flex flex-col gap-0.5 text-sm sm:flex-row sm:gap-3">
          <span className={`${width} shrink-0 font-medium text-blue-400`}>{name}</span>
          <span className="text-gray-400">{detail}</span>
        </li>
      ))}
    </ul>
  );
}

export default function AboutPage() {
  return (
    <main className="px-4 pb-20">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10">
          <h1 className="mb-2 text-3xl font-bold text-white">About SiteLens</h1>
          <p className="text-sm text-gray-400">
            What it does, how it decides what to show you, and where it falls short.
          </p>
        </header>

        <Section title="Why I built it this way">
          <div className="max-w-3xl space-y-3 text-sm leading-relaxed text-gray-300">
            <p>
              Most scrapers hand back a pile of tags, headings and meta descriptions. That tells
              you how a page is built, but almost nothing about the organisation behind it. I
              wanted the app to answer the questions someone would actually ask: who works here,
              what do they offer, how do I get in touch, and what can I do on the site?
            </p>
            <p>
              The catch is that those questions change with the kind of site. Asking a bookshop
              whether it has a patient portal is nonsense. So nothing here is fixed in advance —
              the tabs and the questions are both decided after the scan, based on what the site
              turns out to be.
            </p>
          </div>
        </Section>

        <Section title="How it decides what to show">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
              <h3 className="mb-2 text-sm font-semibold text-white">1. It reads the structure</h3>
              <p className="text-sm leading-relaxed text-gray-400">
                A site&apos;s own web addresses are its filing system. When dozens of links sit
                under <code className="rounded bg-gray-800 px-1 py-0.5 text-xs text-blue-400">/doctor/</code>{' '}
                or <code className="rounded bg-gray-800 px-1 py-0.5 text-xs text-blue-400">/catalogue/</code>,
                that is a collection worth its own tab — and working that out needs no knowledge of
                hospitals or bookshops at all. The tab even takes its name from the site&apos;s own
                wording, so one hospital gets &ldquo;Specialities&rdquo; and another gets
                &ldquo;Departments&rdquo;.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
              <h3 className="mb-2 text-sm font-semibold text-white">2. Then it picks its questions</h3>
              <p className="text-sm leading-relaxed text-gray-400">
                Once it has guessed what kind of organisation the site belongs to, it runs a
                checklist that suits it. A hospital gets asked about appointments, patient portals
                and lab reports. A shop gets asked about carts, shipping and returns. A site it
                cannot place is only asked the handful of questions that apply to anyone, and gets
                no checklist tab at all.
              </p>
            </div>
          </div>
        </Section>

        <Section title="What it pulls out">
          <Pairs rows={EXTRACTED} width="w-40" />
        </Section>

        <Section title="How the scan works">
          <div className="max-w-3xl space-y-3 text-sm leading-relaxed text-gray-300">
            <p>
              The URL goes to{' '}
              <code className="rounded bg-gray-800 px-1.5 py-0.5 text-xs text-blue-400">
                /api/scrape
              </code>
              , a route running on the server rather than in your browser — which is what avoids
              the CORS rules that stop a page fetching another website directly.
            </p>
            <p>
              It fetches the home page, reads the navigation to work out which sections matter,
              then fetches up to five of them one at a time. One page is never enough: phone
              numbers live on the contact page and staff live on the team page, so a single-page
              scrape misses both.
            </p>
            <p>
              Fetching them all at once was the obvious idea and it was measurably worse. Pages of
              about a megabyte compete for the same connection, every one of them hit the timeout,
              and the scan came back empty. One at a time reads all six in under half a minute
              with nothing dropped.
            </p>
          </div>
        </Section>

        <Section title="Tech used">
          <Pairs rows={TECH} width="w-28" />
        </Section>

        <Section title="Where it falls short">
          <ul className="max-w-3xl space-y-2">
            {LIMITATIONS.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                <span className="mt-0.5 shrink-0 text-gray-600">—</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Built by">
          <p className="text-sm text-gray-300">Hammad</p>
        </Section>
      </div>
    </main>
  );
}
