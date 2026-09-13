// Small helper around localStorage so the scraper page and the history page

const STORAGE_KEY = 'scrapeHistory';
const MAX_ITEMS = 20;

export function getHistory() {
  // localStorage doesn't exist while Next renders on the server
  if (typeof window === 'undefined') return [];

  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    // if the stored value is somehow broken, start over instead of crashing
    return [];
  }
}

export function addToHistory(entry) {
  if (typeof window === 'undefined') return;

  const existing = getHistory();
  // scraping the same URL twice shouldn't create two rows
  const withoutDuplicate = existing.filter((item) => item.url !== entry.url);
  const updated = [entry, ...withoutDuplicate].slice(0, MAX_ITEMS);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function removeFromHistory(url) {
  if (typeof window === 'undefined') return [];

  const updated = getHistory().filter((item) => item.url !== url);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function clearHistory() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
