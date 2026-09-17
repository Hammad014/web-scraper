# Web Scraper

Paste a website URL and get back what the organisation behind it actually
offers — its people, services, facilities, contact details and the features
available to visitors.

Most scrapers return a pile of tags, headings and meta descriptions, which says
very little about the organisation. This one is built to answer the questions
someone would really ask. Point it at a hospital and it reports the doctors and
their specialities, the departments, the facilities, the phone numbers and
address, and whether patients can book an appointment or log in to a portal.

## Getting started

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## What it pulls out

| Section | Details |
| --- | --- |
| Doctors and profiles | Names, specialities, photos and profile links |
| Services offered | Treatments, specialities and departments |
| Facilities available | ICUs, labs, pharmacy, blood bank, theatres |
| Contact information | Phone numbers, emails, address and social profiles |
| Key pages | About, Contact, Services, Careers and the rest |
| Banner content | The main message on the home page |
| Patient features | Appointment booking, patient portal, lab reports, telemedicine and more |

The tabs are built from whatever the scan actually found, so a hospital and a
university end up with different ones, and a section only appears when there is
something in it. The whole report can be downloaded as JSON.

## How it works

The scraping runs on the server, not in the browser. Browsers block requests to
other websites because of CORS, so the page sends the URL to the API route at
`app/api/scrape/route.js`.

That route fetches the home page, reads the navigation to work out which
sections matter, then fetches up to five of them — About, Contact, Services,
Doctors, Facilities — one at a time. Cheerio parses each page and the results
are merged into a single report.

Fetching them all at once was tried first and measured worse, not better. Pages
of around a megabyte compete for the same connection, so every one of them hit
the timeout and the scan came back empty. Two at a time still lost a page and
took 53 seconds; one at a time reads all six in 28 seconds with nothing
dropped.

**One page is never enough.** Phone numbers live on the contact page and
doctors live on the doctors page, so a single-page scrape misses both.

### Why link text, not CSS classes

Extraction leans on link text and link addresses rather than class names. Real
sites were checked before this was written: Shifa and Mayo Clinic have
essentially no `doctor` or `service` class names because their class names are
generated, and none of the sites tested used `<address>` tags. Link text, by
contrast, is rich — Liaquat National Hospital's entire service catalogue is
sitting in its navigation as `/services/pharmacy || Pharmacy Services`.

The word lists that drive all of this live in `app/lib/keywords.js`, so adding
a new service keyword or a new feature to look for is a one-line change.

### Guarding against false positives

A naive phone regex pulls in dates, bank account numbers, PO boxes and map
coordinates — all of which turned up during testing. A naive address regex
matches the CSS property `padding-block` and the phrase "a trip down memory
lane". Both extractors validate what they find rather than trusting a pattern
match, which is why `app/lib/extract.js` is stricter than it first looks.

## Project structure

```
app/
├── api/scrape/route.js   server-side fetching and merging
├── lib/
│   ├── crawl.js          fetching pages, timeouts, same-site checks
│   ├── extract.js        turning HTML into information
│   ├── keywords.js       every word list used by the extractors
│   └── history.js        localStorage helper
├── components/           the UI, one file per piece
├── page.js               the analyser
├── history/page.js       past scans
└── about/page.js         what it does and what it can't
```

## Limitations

- Works on static HTML. Sites that build their content with JavaScript after
  loading — Shifa and Mayo Clinic, for example — return far less, because the
  scraper reads the HTML a browser first receives, not the finished page.
  Handling those would need a headless browser like Puppeteer.
- The scan reads the home page plus up to five sections found in the
  navigation. Anything deeper is not visited.
- Doctors, services and addresses are worked out from patterns, not from a
  standard the sites follow, so an unusually worded site gives thinner results.
- Some sites block scrapers outright, and a few start refusing after several
  requests in a row.
- Requests time out after 20 seconds so a slow site cannot hang the page.
- History lives in the browser only — clearing site data erases it.

Built with Next.js and Cheerio by Hammad.
