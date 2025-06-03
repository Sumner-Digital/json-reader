'use client';

import React, { useState } from 'react';

/**
 * Extremely small client-side page to hit /api/scan and pretty-print the JSON.
 * Tailwind / global styles are not assumed – only minimal utility classes.
 */
export default function Home() {
  const [url, setUrl] = useState('');
  const [output, setOutput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setOutput(null);

    try {
      const res = await fetch(`/api/scan?url=${encodeURIComponent(url)}`);
      const text = await res.text();
      setOutput(text);
    } catch (err) {
      setOutput((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center p-8 gap-6">
      <h1 className="text-2xl font-semibold">Structured Data Checker</h1>

      <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-xl">
        <input
          type="url"
          required
          className="flex-1 border rounded p-2"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Loading…' : 'Scan'}
        </button>
      </form>

      {output && (
        <pre className="w-full max-w-xl bg-gray-100 p-4 overflow-auto">
          {output}
        </pre>
      )}
    </main>
  );
}