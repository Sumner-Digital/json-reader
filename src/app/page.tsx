'use client';

import React, { useState } from 'react';

/**
 * Fully flatten an object or array with improved formatting
 */
function flatten(
  node: unknown,
  prefix = '',
  depth = 0
): Array<{ path: string; value: string; type: string; depth: number }> {
  const lines: Array<{ path: string; value: string; type: string; depth: number }> = [];

  if (
    typeof node === 'string' ||
    typeof node === 'number' ||
    typeof node === 'boolean' ||
    node === null
  ) {
    const type = node === null ? 'null' : typeof node;
    const value = typeof node === 'string' ? `"${node}"` : String(node);
    lines.push({ path: prefix, value, type, depth });
    return lines;
  }

  if (Array.isArray(node)) {
    // If array of primitives → preview
    const primitives = node.filter(
      (v) =>
        typeof v === 'string' ||
        typeof v === 'number' ||
        typeof v === 'boolean' ||
        v === null
    );
    if (primitives.length === node.length) {
      const preview = primitives.slice(0, 3).map(v => 
        typeof v === 'string' ? `"${v}"` : String(v)
      ).join(', ');
      const suffix = node.length > 3 ? `, … (+${node.length - 3})` : '';
      lines.push({ 
        path: prefix, 
        value: `[${preview}${suffix}]`, 
        type: 'array-primitive',
        depth 
      });
      return lines;
    }

    // Array of objects – recurse into each element
    if (depth < 2) {
      lines.push({ 
        path: prefix, 
        value: `Array (${node.length} items)`, 
        type: 'array-complex',
        depth 
      });
      node.forEach((item, idx) => {
        const childPrefix = `${prefix}[${idx}]`;
        lines.push(...flatten(item, childPrefix, depth + 1));
      });
    } else {
      lines.push({ 
        path: prefix, 
        value: `[array ${node.length}]`, 
        type: 'array-truncated',
        depth 
      });
    }
    return lines;
  }

  if (typeof node === 'object' && node !== null) {
    if (depth >= 2) {
      lines.push({ 
        path: prefix, 
        value: '[object]', 
        type: 'object-truncated',
        depth 
      });
      return lines;
    }
    
    const entries = Object.entries(node as Record<string, unknown>);
    if (prefix) {
      lines.push({ 
        path: prefix, 
        value: `Object (${entries.length} properties)`, 
        type: 'object',
        depth 
      });
    }
    
    entries.forEach(([key, value]) => {
      const childPrefix = prefix ? `${prefix}.${key}` : key;
      lines.push(...flatten(value, childPrefix, depth + (prefix ? 1 : 0)));
    });
    return lines;
  }

  // Fallback
  lines.push({ path: prefix, value: '[unknown]', type: 'unknown', depth });
  return lines;
}

const styles = `
  .json-card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    width: 100%;
    max-width: 64rem;
    margin-bottom: 1.5rem;
  }

  .json-header {
    background: linear-gradient(to right, #f9fafb, #f3f4f6);
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .json-title {
    font-size: 0.875rem;
    font-weight: 600;
    color: #374151;
    letter-spacing: 0.025em;
    text-transform: uppercase;
  }

  .json-actions {
    display: flex;
    gap: 0.5rem;
  }

  .json-button {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: #6b7280;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.15s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .json-button:hover {
    color: #374151;
    background: #f9fafb;
    border-color: #d1d5db;
    transform: translateY(-1px);
  }

  .json-button:active {
    transform: translateY(0);
  }

  .json-content {
    padding: 1.5rem;
    background: #ffffff;
  }

  .json-raw {
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 0.875rem;
    line-height: 1.5;
    background: #f8fafc;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 1.5rem;
    overflow-x: auto;
    color: #1f2937;
  }

  .json-tree {
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 0.875rem;
    line-height: 1.8;
  }

  .json-line {
    display: flex;
    align-items: center;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    transition: background-color 0.15s ease;
  }

  .json-line:hover {
    background-color: #f3f4f6;
  }

  .json-expand-icon {
    width: 20px;
    height: 20px;
    margin-right: 0.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #9ca3af;
    transition: color 0.15s ease;
    user-select: none;
  }

  .json-expand-icon:hover {
    color: #6b7280;
  }

  .json-expand-icon svg {
    width: 12px;
    height: 12px;
  }

  .json-key {
    color: #4b5563;
    font-weight: 600;
  }

  .json-equals {
    color: #d1d5db;
    margin: 0 0.5rem;
  }

  .json-value-string { color: #059669; }
  .json-value-number { color: #2563eb; }
  .json-value-boolean { color: #7c3aed; }
  .json-value-null { color: #9ca3af; }
  .json-value-array-primitive { color: #ea580c; }
  .json-value-array-complex { color: #dc2626; font-weight: 600; }
  .json-value-object { color: #4f46e5; font-weight: 600; }
  .json-value-object-truncated { color: #9ca3af; font-style: italic; }
  .json-value-array-truncated { color: #9ca3af; font-style: italic; }

  .main-container {
    min-height: 100vh;
    background: linear-gradient(to bottom, #f9fafb, #ffffff);
    padding: 2rem;
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

  .copy-button-success {
    color: #059669 !important;
  }
`;

function JsonCard({ block }: { block: string }) {
  const [showRaw, setShowRaw] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  
  let parsed: any;
  let parseError = false;
  
  try {
    parsed = JSON.parse(block);
  } catch (e) {
    parseError = true;
    parsed = { error: 'Invalid JSON' };
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(JSON.stringify(parsed, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const togglePath = (path: string) => {
    const newExpanded = new Set(expandedPaths);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedPaths(newExpanded);
  };

  const flatData = flatten(parsed);
  
  const isChildOf = (child: string, parent: string) => {
    return child.startsWith(parent + '.') || child.startsWith(parent + '[');
  };

  const getValueClass = (type: string) => {
    return `json-value-${type}`;
  };

  if (!parsed) return null;

  return (
    <div className="json-card">
      <div className="json-header">
        <h3 className="json-title">JSON-LD Structured Data</h3>
        <div className="json-actions">
          <button
            onClick={handleCopy}
            className={`json-button ${copied ? 'copy-button-success' : ''}`}
            title="Copy JSON"
          >
            {copied ? '✓ Copied' : '📋 Copy'}
          </button>
          <button
            onClick={() => setShowRaw(!showRaw)}
            className="json-button"
          >
            {showRaw ? '👁 View formatted' : '</> View raw'}
          </button>
        </div>
      </div>

      <div className="json-content">
        {parseError ? (
          <div style={{ color: '#dc2626', fontSize: '0.875rem' }}>Error: Invalid JSON format</div>
        ) : showRaw ? (
          <pre className="json-raw">
            {JSON.stringify(parsed, null, 2)}
          </pre>
        ) : (
          <div className="json-tree">
            {flatData.map((item, idx) => {
              const isHidden = flatData.some((parent, parentIdx) => {
                if (parentIdx >= idx) return false;
                if (parent.type === 'array-complex' || parent.type === 'object') {
                  return isChildOf(item.path, parent.path) && !expandedPaths.has(parent.path);
                }
                return false;
              });

              if (isHidden) return null;

              const isExpandable = item.type === 'array-complex' || item.type === 'object';
              const isExpanded = expandedPaths.has(item.path);

              return (
                <div
                  key={idx}
                  className="json-line"
                  style={{ paddingLeft: `${item.depth * 1.5}rem` }}
                >
                  {isExpandable && (
                    <span
                      onClick={() => togglePath(item.path)}
                      className="json-expand-icon"
                    >
                      {isExpanded ? '▼' : '▶'}
                    </span>
                  )}
                  {!isExpandable && <span style={{ width: '20px', display: 'inline-block' }} />}
                  <span className="json-key">{item.path || 'root'}</span>
                  <span className="json-equals">=</span>
                  <span className={getValueClass(item.type)}>{item.value}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

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
            Scan any website to view its JSON-LD structured data
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