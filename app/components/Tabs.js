// Three tabs across the top of the results.
// The parent owns which one is active so it survives a new scrape.

'use client';

export default function Tabs({ tabs, active, onChange }) {
  return (
    <div className="mb-6 flex gap-1 overflow-x-auto border-b border-gray-800">
      {tabs.map((tab) => {
        const isActive = tab.id === active;

        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            // -mb-px pulls the button down so its border sits on top of the
            // container's border instead of next to it
            className={`-mb-px whitespace-nowrap border-b-2 px-4 py-2.5 text-sm transition-colors ${
              isActive
                ? 'border-blue-500 font-medium text-white'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className={`ml-2 text-xs ${isActive ? 'text-blue-400' : 'text-gray-600'}`}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
