import ResultCard from './ResultCard';

export default function LinksList({ links }) {
  return (
    <ResultCard title="Links" badge={`${links.length} shown`}>
      {links.length === 0 ? (
        <p className="text-sm text-gray-500">No links found on this page.</p>
      ) : (
        <ul className="divide-y divide-gray-800">
          {links.map((link, i) => (
            <li key={i}>
              <a
                href={link.href}
                target="_blank"
                // noreferrer stops the new tab from getting a handle on this one
                rel="noopener noreferrer"
                className="group block rounded px-2 py-2.5 transition-colors hover:bg-gray-800/50"
              >
                {/* min-w-0 is what actually lets truncate work inside a flex row */}
                <div className="flex min-w-0 items-center gap-2">
                  <span className="truncate text-sm text-gray-200">{link.text}</span>
                  <span className="shrink-0 text-xs text-gray-600 opacity-0 transition-opacity group-hover:opacity-100">
                    ↗
                  </span>
                </div>
                <p className="truncate text-xs text-blue-400/80">{link.href}</p>
              </a>
            </li>
          ))}
        </ul>
      )}
    </ResultCard>
  );
}
