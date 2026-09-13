# Web Scraper

A small Next.js app where you paste a website URL and it pulls out the page's
content — title, meta description, headings, images, links and a text preview.

Built as an assignment project.

## Running it

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## How it works

The scraping runs on the server, not in the browser. Browsers block requests to
other websites because of CORS, so the page sends the URL to the API route at
`app/api/scrape/route.js`, which fetches the HTML with a browser `User-Agent`
header and parses it with Cheerio. The results go back to the page as JSON.

Relative links and image sources (`/about`, `images/logo.png`) are turned into
full URLs against the page's final address, so they're actually clickable.
Requests time out after 15 seconds.


## Limitations

- Static pages only. Sites that render their content with JavaScript after load
  come back mostly empty — that needs a headless browser like Puppeteer.
- Some sites block scrapers regardless of the `User-Agent` header.
- Image previews can fail if the source site blocks hotlinking; those show a
  placeholder instead of a broken icon.
- History is per-browser and disappears when site data is cleared.

## Tech

Next.js (App Router), React, Cheerio, Tailwind CSS.
