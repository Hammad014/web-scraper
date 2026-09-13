

export default function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="h-16 rounded-lg border border-gray-800 bg-gray-900" />
        ))}
      </div>

      {[1, 2, 3].map((n) => (
        <div key={n} className="rounded-xl border border-gray-800 bg-gray-900 p-5">
          <div className="mb-4 h-3 w-24 rounded bg-gray-800" />
          <div className="mb-2 h-3 w-full rounded bg-gray-800" />
          <div className="h-3 w-2/3 rounded bg-gray-800" />
        </div>
      ))}
    </div>
  );
}
