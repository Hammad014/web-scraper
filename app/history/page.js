// Lists the pages scraped earlier, newest first.


'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getHistory, removeFromHistory, clearHistory } from '../lib/history';

// "2 hours ago" reads better than a raw timestamp
function timeAgo(isoDate) {
  const seconds = Math.floor((Date.now() - new Date(isoDate)) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}

export default function HistoryPage() {
  const [items, setItems] = useState([]);
  // localStorage isn't available during the server render, so we start empty
  // and fill the list once the component is actually in the browser
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(getHistory());
    setReady(true);
  }, []);

  const handleRemove = (url) => {
    setItems(removeFromHistory(url));
  };

  const handleClearAll = () => {
    clearHistory();
    setItems([]);
  };

  return (
    <main className="px-4 pb-20">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-white">History</h1>
            <p className="text-sm text-gray-400">
              The last 20 pages you scraped, saved in this browser.
            </p>
          </div>

          {items.length > 0 && (
            <button
              onClick={handleClearAll}
              className="shrink-0 rounded-lg border border-gray-800 px-3 py-1.5 text-xs text-gray-400 transition-colors hover:border-red-900 hover:text-red-300"
            >
              Clear all
            </button>
          )}
        </header>

        {/* nothing to show until the browser has handed us localStorage */}
        {!ready ? null : items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-800 px-6 py-20 text-center">
            <p className="mb-1 text-sm text-gray-400">No history yet</p>
            <p className="mb-5 text-sm text-gray-600">
              Anything you scrape will show up here automatically.
            </p>
            <Link
              href="/"
              className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500"
            >
              Scrape a page
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((item) => (
              <li
                key={item.url}
                className="flex items-center justify-between gap-4 rounded-xl border border-gray-800 bg-gray-900 p-4 transition-colors hover:border-gray-700"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">{item.title}</p>
                  <p className="truncate text-xs text-blue-400/80">{item.url}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-gray-600">
                    <span>{timeAgo(item.scrapedAt)}</span>
                    {/* older entries were saved before site type existed */}
                    {item.siteType && (
                      <span className="rounded-full bg-gray-800 px-2 py-0.5 text-gray-400">
                        {item.siteType}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {/* sending the URL as a query param makes the home page re-run it */}
                  <Link
                    href={`/?url=${encodeURIComponent(item.url)}`}
                    className="rounded-lg bg-gray-800 px-3 py-1.5 text-xs text-gray-200 transition-colors hover:bg-gray-700"
                  >
                    Scrape again
                  </Link>
                  <button
                    onClick={() => handleRemove(item.url)}
                    aria-label="Remove from history"
                    className="rounded-lg px-2 py-1.5 text-xs text-gray-600 transition-colors hover:text-red-400"
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
