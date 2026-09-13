// One red banner used for every failure — bad URL, blocked site, timeout.
// Returning null when there's no error keeps the check out of the pages.

export default function ErrorMessage({ message }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="mb-6 flex items-start gap-3 rounded-lg border border-red-900 bg-red-950/60 px-4 py-3 text-sm text-red-200"
    >
      <span aria-hidden="true">⚠</span>
      <span>{message}</span>
    </div>
  );
}
