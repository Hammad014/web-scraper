

'use client';

import { useEffect, useState } from 'react';
import SearchBar from './components/SearchBar';
import StatsRow from './components/StatsRow';
import HeadingsList from './components/HeadingsList';
import ImagesList from './components/ImagesList';
import LinksList from './components/LinksList';
import ResultCard from './components/ResultCard';
import EmptyState from './components/EmptyState';
import ErrorMessage from './components/ErrorMessage';
import LoadingSkeleton from './components/LoadingSkeleton';
import { addToHistory } from './lib/history';

export default function Home() {
  const [url, setUrl] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // The history page links back here as /?url=..., so pick that up on load
  // and run the scrape straight away instead of making the user click again.
  useEffect(() => {
    const fromLink = new URLSearchParams(window.location.search).get('url');
    if (fromLink) {
      setUrl(fromLink);
      runScrape(fromLink);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runScrape = async (targetUrl) => {
    if (!targetUrl.trim()) {
      setError('Please enter a URL first.');
      return;
    }

    // clear out whatever was showing before
    setError(null);
    setResults(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/scrape?url=${encodeURIComponent(targetUrl)}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong.');
        return;
      }

      setResults(data);
      addToHistory({
        url: data.scrapedUrl,
        title: data.title,
        scrapedAt: new Date().toISOString(),
      });
    } catch {
      // this only fires if our own API is unreachable, not the scraped site
      setError('Failed to reach the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setUrl('');
    setResults(null);
    setError(null);
  };

  const handleCopyTitle = async () => {
    await navigator.clipboard.writeText(results.title);
    setCopied(true);
    // flip the label back after a moment so it can be used again
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <main className="px-4 pb-20">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-white sm:text-4xl">Web Scraper</h1>
          <p className="text-gray-400">
            Paste any website URL to extract its content — title, headings, links, images and more.
          </p>
        </header>

        <SearchBar url={url} setUrl={setUrl} onScrape={() => runScrape(url)} loading={loading} />

        <ErrorMessage message={error} />

        {loading && <LoadingSkeleton />}

        {!loading && !results && !error && <EmptyState />}

        {!loading && results && (
          <div className="space-y-6">
            {/* small strip showing what was just scraped */}
            <div className="flex items-center justify-between gap-3 text-xs text-gray-500">
              <span className="truncate">
                Scraped <span className="text-blue-400">{results.scrapedUrl}</span>
              </span>
              <button
                onClick={handleClear}
                className="shrink-0 transition-colors hover:text-gray-300"
              >
                Clear
              </button>
            </div>

            <StatsRow stats={results.stats} />

            <ResultCard
              title="Page Title"
              action={
                <button
                  onClick={handleCopyTitle}
                  className="text-xs text-gray-500 transition-colors hover:text-gray-300"
                >
                  {copied ? 'Copied' : 'Copy'}
                </button>
              }
            >
              <p className="text-white">{results.title}</p>
            </ResultCard>

            <ResultCard title="Meta Description">
              <p className="text-sm leading-relaxed text-gray-300">{results.metaDescription}</p>
            </ResultCard>

            <HeadingsList headings={results.headings} />
            <ImagesList images={results.images} />
            <LinksList links={results.links} />

            <ResultCard title="Page Text Preview">
              <p className="text-sm leading-relaxed text-gray-400">
                {results.bodyText || 'No readable text found on this page.'}
                {results.bodyText && <span className="text-gray-600"> … (truncated)</span>}
              </p>
            </ResultCard>
          </div>
        )}
      </div>
    </main>
  );
}
