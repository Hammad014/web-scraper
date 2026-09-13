import ResultCard from './ResultCard';

// Each heading level gets its own colour and a bit of indentation,
// which makes the page outline easy to read at a glance.
const levelStyles = {
  H1: { color: 'text-blue-400', indent: '' },
  H2: { color: 'text-indigo-400', indent: 'ml-4' },
  H3: { color: 'text-purple-400', indent: 'ml-8' },
};

export default function HeadingsList({ headings }) {
  return (
    <ResultCard title="Headings" badge={`${headings.length} found`}>
      {headings.length === 0 ? (
        <p className="text-sm text-gray-500">No headings found on this page.</p>
      ) : (
        <ul className="space-y-2">
          {headings.map((heading, i) => {
            const style = levelStyles[heading.level] || { color: 'text-gray-400', indent: '' };

            return (
              <li key={i} className={`flex items-start gap-3 ${style.indent}`}>
                <span
                  className={`mt-0.5 shrink-0 rounded bg-gray-800 px-2 py-0.5 font-mono text-xs ${style.color}`}
                >
                  {heading.level}
                </span>
                <span className="text-sm leading-snug text-gray-200">{heading.text}</span>
              </li>
            );
          })}
        </ul>
      )}
    </ResultCard>
  );
}
