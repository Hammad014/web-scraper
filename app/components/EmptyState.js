// Shown before the user has scraped anything.

export default function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-gray-800 px-6 py-20 text-center">
      <p className="mb-1 text-sm text-gray-400">Nothing scraped yet</p>
      <p className="text-sm text-gray-600">
        Paste a URL above and hit Scrape to see what a page is made of.
      </p>
    </div>
  );
}
