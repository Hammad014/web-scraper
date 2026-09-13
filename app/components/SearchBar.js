

'use client';

const EXAMPLES = ['example.com', 'news.ycombinator.com', 'wikipedia.org'];

export default function SearchBar({ url, setUrl, onScrape, loading }) {
  const handleSubmit = (e) => {
    e.preventDefault(); // stop the browser from reloading the page
    onScrape();
  };

  return (
    <div className="mb-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="example.com"
          disabled={loading}
          className="flex-1 rounded-lg border border-gray-800 bg-gray-900 px-4 py-3 text-sm text-white placeholder-gray-600 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-950 disabled:cursor-not-allowed disabled:bg-blue-900 disabled:text-blue-300"
        >
          {loading ? 'Scraping…' : 'Scrape'}
        </button>
      </form>

      {/* quick shortcuts so nobody has to think of a URL to test with */}
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-gray-600">Try:</span>
        {EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => setUrl(example)}
            disabled={loading}
            className="rounded-full border border-gray-800 px-3 py-1 text-gray-500 transition-colors hover:border-gray-700 hover:text-gray-300 disabled:opacity-50"
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}
