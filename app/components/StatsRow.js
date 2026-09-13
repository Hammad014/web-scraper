

export default function StatsRow({ stats }) {
  const items = [
    ['Headings', stats.headings],
    ['Links', stats.links],
    ['Images', stats.images],
    ['Words', stats.words],
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map(([label, value]) => (
        <div
          key={label}
          className="rounded-lg border border-gray-800 bg-gray-900 px-4 py-3 text-center"
        >
          <p className="text-xl font-semibold text-white">
            {/* toLocaleString puts a comma in big word counts */}
            {value.toLocaleString()}
          </p>
          <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
        </div>
      ))}
    </div>
  );
}
