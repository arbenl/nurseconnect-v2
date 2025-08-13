'use client';

export default function GlobalError({
  error, reset,
}: { error: Error; reset: () => void }) {
  return (
    <html>
      <body style={{ padding: 20 }}>
        <h2>App crashed</h2>
        <pre style={{ whiteSpace: 'pre-wrap' }}>{error.message}</pre>
        <button onClick={() => reset()}>Reload</button>
      </body>
    </html>
  );
}