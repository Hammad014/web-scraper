// A quick summary strip above the detailed cards, so the size and shape
// of a site is visible at a glance. The caller decides what goes in it.

export default function StatsRow({ items }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-5">
      {items.map(([label, value]) => (
        <div
          key={label}
          className="rounded-lg border border-gray-800 bg-gray-900 px-3 py-3 text-center"
        >
          <p className="text-xl font-semibold text-white">
            {/* toLocaleString puts a comma in big word counts */}
            {value.toLocaleString()}
          </p>
          <p className="truncate text-[11px] uppercase tracking-wide text-gray-500" title={label}>
            {label}
          </p>
        </div>
      ))}
    </div>
  );
}
