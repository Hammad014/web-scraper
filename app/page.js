// Home page: runs the scan, then shows whichever section tab is selected.

'use client';

import { useEffect, useState } from 'react';
import SearchBar from './components/SearchBar';
import Tabs from './components/Tabs';
import StatsRow from './components/StatsRow';
import SectionView from './components/SectionView';
import EmptyState from './components/EmptyState';
import ErrorMessage from './components/ErrorMessage';
import LoadingSkeleton from './components/LoadingSkeleton';
import { addToHistory } from './lib/history';

export default function Home() {
  const [url, setUrl] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(null);

  // The history page links back here as /?url=..., so pick that up on load
  // and run the scan straight away instead of making the user click again.
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
      // the first section is always the overview, so start there
      setActiveTab(data.sections[0]?.id ?? null);

      addToHistory({
        url: data.scrapedUrl,
        title: data.title,
        siteType: data.siteType.label,
        scrapedAt: new Date().toISOString(),
      });
    } catch {
      // this only fires if our own API is unreachable, not the scanned site
      setError('Failed to reach the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${new URL(results.scrapedUrl).hostname}-report.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleClear = () => {
    setUrl('');
    setResults(null);
    setError(null);
    setActiveTab(null);
  };

  const current = results?.sections.find((section) => section.id === activeTab);

  return (
    <main className="px-4 pb-20">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-white sm:text-4xl">
            See what a website really offers
          </h1>
          <p className="text-gray-400">
            Paste a URL to find out what an organisation actually offers — its people, services,
            contact details and the features available to visitors.
          </p>
        </header>

        <SearchBar url={url} setUrl={setUrl} onScrape={() => runScrape(url)} loading={loading} />

        <ErrorMessage message={error} />

        {loading && <LoadingSkeleton />}

        {!loading && !results && !error && <EmptyState />}

        {!loading && results && (
          <div>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
              <span className="truncate">
                Scanned <span className="text-blue-400">{results.scrapedUrl}</span>
              </span>
              <div className="flex shrink-0 items-center gap-3">
                <button onClick={handleDownload} className="transition-colors hover:text-gray-300">
                  Download JSON
                </button>
                <button onClick={handleClear} className="transition-colors hover:text-gray-300">
                  Clear
                </button>
              </div>
            </div>

            {/* the stats follow whatever sections came back, so a shop shows
                Products where a hospital shows Doctors */}
            <div className="mb-6">
              <StatsRow
                items={[
                  ['Pages', results.pagesRead],
                  ...results.sections
                    .filter((section) => section.count !== undefined)
                    .slice(0, 4)
                    .map((section) => [section.label, section.count]),
                ]}
              />
            </div>

            {/* one tab per section the scan actually found */}
            <Tabs
              tabs={results.sections.map((section) => ({
                id: section.id,
                label: section.label,
                count: section.count,
              }))}
              active={activeTab}
              onChange={setActiveTab}
            />

            {current && <SectionView section={current} />}
          </div>
        )}
      </div>
    </main>
  );
}
