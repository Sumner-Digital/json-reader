'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  
  .bookmarklet-banner {
    background: linear-gradient(135deg, #f97316, #ea580c);
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 10px;
    margin-bottom: 2rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 2px 4px rgba(249, 115, 22, 0.2);
  }
  
  .bookmarklet-banner-text {
    font-weight: 500;
  }
  
  .bookmarklet-banner-link {
    color: white;
    text-decoration: underline;
    font-weight: 600;
  }
  
  .bookmarklet-source {
    background: #f3f4f6;
    border: 1px solid #e5e7eb;
    padding: 1rem 1.5rem;
    border-radius: 10px;
    margin-bottom: 2rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .bookmarklet-source-label {
    font-weight: 600;
    color: #4b5563;
  }
  
  .bookmarklet-source-url {
    color: #6b7280;
    word-break: break-all;
  }
  
  .loading-message {
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    color: #1e40af;
    padding: 1rem 1.5rem;
    border-radius: 10px;
    margin-bottom: 1.5rem;
    font-weight: 500;
    text-align: center;
  }
`;

export default function Home() {
  const [url, setUrl] = useState('');
  const [blocks, setBlocks] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookmarkletMode, setBookmarkletMode] = useState(false);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [waitingForData, setWaitingForData] = useState(false);
  
  // Use a ref to store the timeout ID so we can clear it from anywhere
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messageHandlerRef = useRef<((event: MessageEvent) => void) | null>(null);

  useEffect(() => {
    // Check if we're receiving bookmarklet data
    const urlParams = new URLSearchParams(window.location.search);
    const bookmarkletData = urlParams.get('bookmarklet');
    const sessionId = urlParams.get('session');

    if (bookmarkletData === 'pending' && sessionId) {
      // Large payload coming via postMessage
      setBookmarkletMode(true);
      setWaitingForData(true);

      // Create the message handler function and store it in the ref
      messageHandlerRef.current = (event: MessageEvent) => {
        // For bookmarklet data, we need to accept messages from any origin
        // since the bookmarklet runs on the website being validated
        if (event.data.type === 'bookmarklet-data' && event.data.session === sessionId) {
          const { data } = event.data;
          setSourceUrl(data.url);
          setBlocks(data.blocks);
          setWaitingForData(false);
          
          // Clear the timeout since we successfully received data
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
          
          // Remove the event listener
          if (messageHandlerRef.current) {
            window.removeEventListener('message', messageHandlerRef.current);
            messageHandlerRef.current = null;
          }
        }
      };

      // Add the event listener
      window.addEventListener('message', messageHandlerRef.current);

      // Set timeout and store the ID in the ref
      timeoutRef.current = setTimeout(() => {
        // Only show timeout error if we're still waiting for data
        setWaitingForData((stillWaiting) => {
          if (stillWaiting) {
            setError('Timeout waiting for bookmarklet data. Please try again.');
            // Clean up the event listener
            if (messageHandlerRef.current) {
              window.removeEventListener('message', messageHandlerRef.current);
              messageHandlerRef.current = null;
            }
          }
          return false;
        });
      }, 10000);

    } else if (bookmarkletData && bookmarkletData !== 'pending') {
      // Small payload via URL parameter
      try {
        const decoded = JSON.parse(decodeURIComponent(bookmarkletData));
        setBookmarkletMode(true);
        setSourceUrl(decoded.url);
        setBlocks(decoded.blocks);
      } catch (err) {
        setError('Failed to decode bookmarklet data. Please try again.');
        console.error('Bookmarklet decode error:', err);
      }
    }

    // Cleanup function to run when component unmounts or dependencies change
    return () => {
      // Clear any pending timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      // Remove any active event listener
      if (messageHandlerRef.current) {
        window.removeEventListener('message', messageHandlerRef.current);
        messageHandlerRef.current = null;
      }
    };
  }, []); // Empty dependency array since we only want this to run once on mount

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

          {/* Show special banner if not in bookmarklet mode */}
          {!bookmarkletMode && error?.includes('403') && (
            <div className="bookmarklet-banner">
              <span className="bookmarklet-banner-text">
                Getting blocked? Try our bookmarklet for sites that block automated access
              </span>
              <a href="/bookmarklet" className="bookmarklet-banner-link">
                Install Bookmarklet →
              </a>
            </div>
          )}

          {/* Show source URL if coming from bookmarklet */}
          {bookmarkletMode && sourceUrl && (
            <div className="bookmarklet-source">
              <span className="bookmarklet-source-label">Source:</span>
              <span className="bookmarklet-source-url">{sourceUrl}</span>
            </div>
          )}

          {/* Show loading message if waiting for postMessage data */}
          {waitingForData && (
            <div className="loading-message">
              Receiving structured data from bookmarklet...
            </div>
          )}

          {/* Only show form if not in bookmarklet mode and not waiting for data */}
          {!bookmarkletMode && !waitingForData && (
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
          )}

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

          {/* Helpful link to bookmarklet for first-time users */}
          {!bookmarkletMode && blocks && blocks.length > 0 && (
            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
              <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
                Need to validate sites that block our scanner?
              </p>
              <a 
                href="/bookmarklet" 
                style={{ 
                  color: '#f97316', 
                  fontWeight: 600, 
                  textDecoration: 'none' 
                }}
              >
                Install our bookmarklet →
              </a>
            </div>
          )}
        </div>
      </main>
    </>
  );
}