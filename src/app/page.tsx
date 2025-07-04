'use client';

import React, { useState } from 'react';
import JsonCard from './components/JsonCard';

const styles = `
  .main-container {
    background: linear-gradient(to bottom, #f9fafb, #ffffff);
    padding: 2rem;
    min-height: 100vh;
  }

  .content-wrapper {
    width: 100%;
    max-width: 64rem;
    margin: 0 auto;
  }

  .page-title {
    font-size: 2.25rem;
    font-weight: 800;
    color: #111827;
    text-align: center;
    margin-bottom: 0.5rem;
    letter-spacing: -0.025em;
  }

  .page-subtitle {
    font-size: 1.125rem;
    color: #6b7280;
    text-align: center;
    margin-bottom: 3rem;
  }

  .search-form {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 2rem;
  }

  .search-input {
    flex: 1;
    padding: 0.875rem 1.25rem;
    font-size: 1rem;
    border: 2px solid #e5e7eb;
    border-radius: 10px;
    transition: all 0.2s ease;
    background: #ffffff;
  }

  .search-input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .search-button {
    padding: 0.875rem 2rem;
    font-size: 1rem;
    font-weight: 600;
    color: #ffffff;
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    border: none;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
  }

  .search-button:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(37, 99, 235, 0.3);
  }

  .search-button:active:not(:disabled) {
    transform: translateY(0);
  }

  .search-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .error-message {
    background: #fef2f2;
    border: 1px solid #fecaca;
    color: #dc2626;
    padding: 1rem 1.5rem;
    border-radius: 10px;
    margin-bottom: 1.5rem;
    font-weight: 500;
  }

  .empty-message {
    background: #fefce8;
    border: 1px solid #fde68a;
    color: #ca8a04;
    padding: 1rem 1.5rem;
    border-radius: 10px;
    font-weight: 500;
  }
`;

export default function Home() {
  const [url, setUrl] = useState('');
  const [blocks, setBlocks] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setBlocks(null);
    setError(null);

    try {
      const res = await fetch(`/api/scan?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Unknown error');
      setBlocks(data.json as string[]);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <main className="main-container">
        <div className="content-wrapper">
          <h1 className="page-title">
            Structured Data Checker
          </h1>
          <p className="page-subtitle">
            Scan any website to view and validate its JSON-LD structured data
          </p>

          <form onSubmit={handleSubmit} className="search-form">
            <input
              type="url"
              required
              className="search-input"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <button
              type="submit"
              className="search-button"
              disabled={loading}
            >
              {loading ? 'Scanning…' : 'Scan'}
            </button>
          </form>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {blocks && blocks.length === 0 && (
            <div className="empty-message">
              No structured data found on this page.
            </div>
          )}

          <div>
            {blocks?.map((b, i) => (
              <JsonCard key={i} block={b} />
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
