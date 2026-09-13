// Reusable card wrapper — every result section uses this.

export default function ResultCard({ title, badge, action, children }) {
  return (
    <section className="rounded-xl border border-gray-800 bg-gray-900 p-5 transition-colors hover:border-gray-700">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500">
            {title}
          </h2>
          {/* badge is optional — shows counts like "12 found" */}
          {badge !== undefined && (
            <span className="rounded-full bg-gray-800 px-2 py-0.5 text-xs text-blue-400">
              {badge}
            </span>
          )}
        </div>
        {/* action is for things like the Copy button on the title card */}
        {action}
      </div>

      {children}
    </section>
  );
}
