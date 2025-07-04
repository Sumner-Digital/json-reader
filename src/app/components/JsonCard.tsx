'use client';

import { useState, lazy, Suspense, useEffect, useCallback } from 'react';
import { ChevronRight, ChevronDown, Code, Eye, Copy, Check, AlertCircle, AlertTriangle } from 'lucide-react';
import type { ValidationResult } from '../utils/validator';

const JsonLdValidator = lazy(() => import('./JsonLdValidator'));

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
  }

  .json-header-top {
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

  .json-validation-summary {
    margin-top: 0.75rem;
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .json-validation-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.375rem 0.875rem;
    font-size: 0.875rem;
    font-weight: 500;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .json-validation-badge:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .json-validation-badge-error {
    background: #fee;
    border: 1px solid #fcc;
    color: #dc2626;
  }

  .json-validation-badge-warning {
    background: #fef3c7;
    border: 1px solid #fde68a;
    color: #d97706;
  }

  .json-validation-badge-success {
    background: #d1fae5;
    border: 1px solid #a7f3d0;
    color: #059669;
  }

  .json-collapse-controls {
    margin-left: auto;
    display: flex;
    gap: 0.5rem;
  }

  .json-collapse-button {
    padding: 0.25rem 0.75rem;
    font-size: 0.75rem;
    font-weight: 500;
    color: #6b7280;
    background: transparent;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .json-collapse-button:hover {
    color: #374151;
    background: #f9fafb;
    border-color: #d1d5db;
  }

  .json-content {
    padding: 1.5rem;
    background: #ffffff;
  }

  .json-error-list {
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .json-error-list-title {
    font-size: 0.875rem;
    font-weight: 600;
    color: #991b1b;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .json-error-item {
    font-size: 0.8125rem;
    color: #dc2626;
    padding: 0.25rem 0;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  }

  .json-warning-item {
    font-size: 0.8125rem;
    color: #d97706;
    padding: 0.25rem 0;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
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
    align-items: flex-start;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    transition: background-color 0.15s ease;
    flex-direction: column;
  }

  .json-line:hover {
    background-color: #f3f4f6;
  }

  .json-line-content {
    display: flex;
    align-items: center;
    width: 100%;
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
  .json-value-array-primitive { color:rgb(24, 25, 27); }
  .json-value-array-complex { color:rgb(49, 38, 38); font-weight: 600; }
  .json-value-object { color: #4f46e5; font-weight: 600; }
  .json-value-object-truncated { color: #9ca3af; font-style: italic; }
  .json-value-array-truncated { color: #9ca3af; font-style: italic; }

  .json-inline-error {
    color: #dc2626;
    font-size: 0.75rem;
    font-weight: 500;
    margin-top: 0.25rem;
    padding-left: 1.5rem;
  }

  .json-inline-warning {
    color: #d97706;
    font-size: 0.75rem;
    font-weight: 500;
    margin-top: 0.25rem;
    padding-left: 1.5rem;
  }

  .copy-button-success {
    color: #059669 !important;
  }
`;

export default function JsonCard({ block }: { block: string }) {
  const [showRaw, setShowRaw] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [errorsCollapsed, setErrorsCollapsed] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  
  let parsed: any;
  let parseError = false;
  
  try {
    parsed = JSON.parse(block);
  } catch (e) {
    parseError = true;
    parsed = { error: 'Invalid JSON' };
  }

  // Start validation when component mounts
  useEffect(() => {
    if (!parseError) {
      setIsValidating(true);
    }
  }, [parseError]);

  const handleValidationComplete = useCallback((result: ValidationResult) => {
    setValidationResult(result);
    setIsValidating(false);
  }, []);

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

  const toggleAllPaths = (expand: boolean) => {
    if (expand) {
      const allPaths = flatData
        .filter(item => item.type === 'array-complex' || item.type === 'object')
        .map(item => item.path);
      setExpandedPaths(new Set(allPaths));
    } else {
      setExpandedPaths(new Set());
    }
  };

  const flatData = flatten(parsed);
  
  const isChildOf = (child: string, parent: string) => {
    return child.startsWith(parent + '.') || child.startsWith(parent + '[');
  };

  const getValueClass = (type: string) => {
    return `json-value-${type}`;
  };

  // Find errors/warnings for a specific path
  const getErrorsForPath = (path: string) => {
    if (!validationResult) return [];
    return validationResult.errors.filter(e => e.path === path);
  };

  const getWarningsForPath = (path: string) => {
    if (!validationResult) return [];
    return validationResult.warnings.filter(w => w.path === path);
  };

  if (!parsed) return null;

  const errorCount = validationResult?.errors.length || 0;
  const warningCount = validationResult?.warnings.length || 0;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="json-card">
        <div className="json-header">
          <div className="json-header-top">
            <h3 className="json-title">JSON-LD Structured Data</h3>
            <div className="json-actions">
              <button
                onClick={handleCopy}
                className={`json-button ${copied ? 'copy-button-success' : ''}`}
                title="Copy JSON"
              >
                {copied ? (
                  <>
                    <Check style={{ width: '16px', height: '16px' }} />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy style={{ width: '16px', height: '16px' }} />
                    Copy
                  </>
                )}
              </button>
              <button
                onClick={() => setShowRaw(!showRaw)}
                className="json-button"
              >
                {showRaw ? (
                  <>
                    <Eye style={{ width: '16px', height: '16px' }} />
                    View formatted
                  </>
                ) : (
                  <>
                    <Code style={{ width: '16px', height: '16px' }} />
                    View raw
                  </>
                )}
              </button>
              {!showRaw && (
                <>
                  <button
                    onClick={() => toggleAllPaths(false)}
                    className="json-button"
                  >
                    Collapse All
                  </button>
                  <button
                    onClick={() => toggleAllPaths(true)}
                    className="json-button"
                  >
                    Expand All
                  </button>
                </>
              )}
            </div>
          </div>
          {!parseError && (
            <div className="json-validation-summary">
              <div
                className={`json-validation-badge ${
                  errorCount > 0 
                    ? 'json-validation-badge-error' 
                    : warningCount > 0 
                    ? 'json-validation-badge-warning' 
                    : 'json-validation-badge-success'
                }`}
                onClick={() => setErrorsCollapsed(!errorsCollapsed)}
                style={{ cursor: errorCount > 0 || warningCount > 0 ? 'pointer' : 'default' }}
              >
                {errorCount > 0 ? (
                  <>
                    <AlertCircle style={{ width: '16px', height: '16px' }} />
                    {errorCount} Error{errorCount !== 1 ? 's' : ''}
                  </>
                ) : warningCount > 0 ? (
                  <>
                    <AlertTriangle style={{ width: '16px', height: '16px' }} />
                    {warningCount} Warning{warningCount !== 1 ? 's' : ''}
                  </>
                ) : (
                  <>
                    <Check style={{ width: '16px', height: '16px' }} />
                    Valid
                  </>
                )}
                {warningCount > 0 && errorCount > 0 && (
                  <>
                    <span style={{ margin: '0 0.25rem' }}>•</span>
                    <AlertTriangle style={{ width: '16px', height: '16px' }} />
                    {warningCount} Warning{warningCount !== 1 ? 's' : ''}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="json-content">
          {/* Validation trigger */}
          {isValidating && !parseError && (
            <Suspense fallback={null}>
              <JsonLdValidator 
                jsonString={block}
                onValidationComplete={handleValidationComplete}
              />
            </Suspense>
          )}

          {/* Error list (collapsible) */}
          {!errorsCollapsed && validationResult && (errorCount > 0 || warningCount > 0) && (
            <div className="json-error-list">
              <div className="json-error-list-title">
                <AlertCircle style={{ width: '16px', height: '16px' }} />
                Validation Issues
              </div>
              {validationResult.errors.map((error, idx) => (
                <div key={`e-${idx}`} className="json-error-item">
                  [error] {error.path}: {error.message}
                </div>
              ))}
              {validationResult.warnings.map((warning, idx) => (
                <div key={`w-${idx}`} className="json-warning-item">
                  [warning] {warning.path}: <span dangerouslySetInnerHTML={{ __html: warning.message }} />
                </div>
              ))}
            </div>
          )}

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
                const pathErrors = getErrorsForPath(item.path);
                const pathWarnings = getWarningsForPath(item.path);

                return (
                  <div
                    key={idx}
                    className="json-line"
                    style={{ paddingLeft: `${item.depth * 1.5}rem` }}
                  >
                    <div className="json-line-content">
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
                    {pathErrors.map((error, eidx) => (
                      <div key={eidx} className="json-inline-error">
                        Error: {error.message}
                      </div>
                    ))}
                    {pathWarnings.map((warning, widx) => (
                      <div key={widx} className="json-inline-warning">
                        Warning: <span dangerouslySetInnerHTML={{ __html: warning.message }} />
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
