'use client';

export default function Error({
  error, reset,
}: { error: Error; reset: () => void }) {
  return (
    <div style={{ padding: 20 }}>
      <h2>Something went wrong</h2>
      <pre style={{ whiteSpace: 'pre-wrap' }}>{error.message}</pre>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}