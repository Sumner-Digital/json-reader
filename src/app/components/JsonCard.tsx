import { useState } from 'react';
import { ChevronRight, ChevronDown, Code, Eye, Copy, Check } from 'lucide-react';

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

    // Array of objects – recurse into each element (limit two levels)
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
  
  // Group items by parent path for collapsible display
  const isChildOf = (child: string, parent: string) => {
    return child.startsWith(parent + '.') || child.startsWith(parent + '[');
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'string': return 'text-green-600';
      case 'number': return 'text-blue-600';
      case 'boolean': return 'text-purple-600';
      case 'null': return 'text-gray-500';
      case 'array-primitive': return 'text-orange-600';
      case 'array-complex': return 'text-orange-700';
      case 'object': return 'text-indigo-600';
      default: return 'text-gray-700';
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg shadow-sm bg-white overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">JSON Data</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
            title="Copy JSON"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setShowRaw(!showRaw)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
          >
            {showRaw ? (
              <>
                <Eye className="w-4 h-4" />
                <span>View formatted</span>
              </>
            ) : (
              <>
                <Code className="w-4 h-4" />
                <span>View raw</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {parseError ? (
          <div className="text-red-600 text-sm">Error: Invalid JSON format</div>
        ) : showRaw ? (
          <pre className="text-sm font-mono overflow-x-auto bg-gray-50 p-4 rounded border border-gray-200">
            {JSON.stringify(parsed, null, 2)}
          </pre>
        ) : (
          <div className="space-y-1 font-mono text-sm">
            {flatData.map((item, idx) => {
              // Check if this item is hidden by a collapsed parent
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
                  className="flex items-start hover:bg-gray-50 px-2 py-1 rounded"
                  style={{ marginLeft: `${item.depth * 1.5}rem` }}
                >
                  {isExpandable && (
                    <button
                      onClick={() => togglePath(item.path)}
                      className="mr-1 text-gray-400 hover:text-gray-600"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                  )}
                  <div className="flex-1 flex items-baseline gap-2">
                    <span className="text-gray-600">{item.path || 'root'}</span>
                    <span className="text-gray-400">=</span>
                    <span className={getTypeColor(item.type)}>{item.value}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Example usage
export default function App() {
  const jsonData = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "name": "Website HQ",
    "image": "https://websitehq.com/wp-content/uploads/2022/06/Jeane-Sumner-WordPress-Expert.webp",
    "@id": "https://websitehq.com/",
    "url": "https://websitehq.com/",
    "telephone": "904-239-8401",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "",
      "addressLocality": "Jacksonville",
      "addressRegion": "FL",
      "postalCode": "",
      "addressCountry": "US"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 30.3321838,
      "longitude": -81.6556510
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday"
      ],
      "opens": "09:00",
      "closes": "17:00"
    },
    "sameAs": [
      "https://www.facebook.com/websitehq",
      "https://twitter.com/websitehq",
      "https://www.linkedin.com/company/websitehq"
    ]
  });

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">JSON Viewer Demo</h1>
        <JsonCard block={jsonData} />
      </div>
    </div>
  );
}