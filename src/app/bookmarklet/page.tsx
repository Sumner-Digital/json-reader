'use client';

import React, { useState, useEffect, useRef } from 'react';

const styles = `
  .bookmarklet-container {
    background: linear-gradient(to bottom, #f9fafb, #ffffff);
    padding: 2rem;
    min-height: 100vh;
  }

  .bookmarklet-wrapper {
    width: 100%;
    max-width: 48rem;
    margin: 0 auto;
  }

  .bookmarklet-title {
    font-size: 2.25rem;
    font-weight: 800;
    color: #111827;
    text-align: center;
    margin-bottom: 0.5rem;
    letter-spacing: -0.025em;
  }

  .bookmarklet-subtitle {
    font-size: 1.125rem;
    color: #6b7280;
    text-align: center;
    margin-bottom: 3rem;
    line-height: 1.75;
  }

  .warning-banner {
    background: #fef3c7;
    border: 1px solid #fbbf24;
    color: #92400e;
    padding: 1rem 1.5rem;
    border-radius: 10px;
    margin-bottom: 2rem;
    font-weight: 500;
  }

  .bookmarklet-section {
    background: white;
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    padding: 2rem;
    margin-bottom: 2rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .section-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #111827;
    margin-bottom: 1rem;
  }

  .bookmarklet-button-wrapper {
    text-align: center;
    padding: 2rem;
    background: #fef3c7;
    border-radius: 10px;
    margin: 1.5rem 0;
  }

  .bookmarklet-link {
    display: inline-block;
    padding: 1.25rem 3rem;
    font-size: 1.25rem;
    font-weight: 700;
    color: white;
    background: linear-gradient(135deg, #f97316, #ea580c);
    border-radius: 12px;
    text-decoration: none;
    box-shadow: 0 4px 6px rgba(249, 115, 22, 0.3);
    transition: all 0.2s ease;
    cursor: grab;
  }

  .bookmarklet-link:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(249, 115, 22, 0.4);
  }

  .bookmarklet-link:active {
    cursor: grabbing;
  }

  .drag-instruction {
    font-size: 0.875rem;
    color: #92400e;
    margin-top: 1rem;
    font-weight: 500;
  }

  .step-list {
    list-style: none;
    padding: 0;
  }

  .step-item {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .step-number {
    flex-shrink: 0;
    width: 2rem;
    height: 2rem;
    background: linear-gradient(135deg, #f97316, #ea580c);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
  }

  .step-content {
    flex: 1;
    color: #374151;
    line-height: 1.6;
  }

  .browser-note {
    background: #f3f4f6;
    padding: 1rem;
    border-radius: 8px;
    margin-top: 1rem;
    font-size: 0.875rem;
    color: #4b5563;
  }

  .back-link {
    display: inline-block;
    color: #3b82f6;
    text-decoration: none;
    font-weight: 500;
    margin-bottom: 2rem;
    transition: color 0.2s ease;
  }

  .back-link:hover {
    color: #2563eb;
    text-decoration: underline;
  }

  .demo-section {
    background: #f9fafb;
    padding: 1.5rem;
    border-radius: 10px;
    margin-top: 1.5rem;
  }

  .demo-title {
    font-weight: 600;
    color: #111827;
    margin-bottom: 0.5rem;
  }

  .demo-text {
    color: #6b7280;
    font-size: 0.875rem;
    line-height: 1.6;
  }
  
  .manual-install {
    background: #f3f4f6;
    padding: 1.5rem;
    border-radius: 10px;
    margin-top: 2rem;
  }
  
  .code-box {
    background: #1f2937;
    color: #f3f4f6;
    padding: 1rem;
    border-radius: 6px;
    font-family: monospace;
    font-size: 0.875rem;
    margin: 1rem 0;
    overflow-x: auto;
    white-space: pre-wrap;
    word-break: break-all;
  }
  
  .copy-button {
    background: #3b82f6;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .copy-button:hover {
    background: #2563eb;
  }
  
  .copy-button:active {
    transform: scale(0.95);
  }
`;

export default function BookmarkletPage() {
  const [browserName, setBrowserName] = useState<string>('your browser');
  const [showManualInstructions, setShowManualInstructions] = useState(false);
  const [copyButtonText, setCopyButtonText] = useState('Copy Code');
  const bookmarkletLinkRef = useRef<HTMLAnchorElement>(null);
  
  useEffect(() => {
    // Detect browser for customized instructions
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) setBrowserName('Chrome');
    else if (userAgent.includes('Firefox')) setBrowserName('Firefox');
    else if (userAgent.includes('Safari')) setBrowserName('Safari');
    else if (userAgent.includes('Edge')) setBrowserName('Edge');
  }, []);

  // The bookmarklet code as a string (not a javascript: URL yet)
  const bookmarkletCode = `(function(){
    const VALIDATOR_URL = 'https://json-reader.vercel.app';
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    const jsonldData = [];
    
    /* Show loading overlay */
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:white;padding:2rem;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,0.2);z-index:99999;font-family:system-ui,-apple-system,sans-serif;';
    overlay.innerHTML = '<div style="color:#f97316;font-size:1.25rem;font-weight:700;margin-bottom:0.5rem;">Scanning for JSON-LD...</div><div style="color:#6b7280;">Please wait a moment</div>';
    document.body.appendChild(overlay);
    
    /* Extract JSON-LD data */
    scripts.forEach(script => {
      try {
        const content = script.textContent.trim();
        if (content) {
          JSON.parse(content); /* Validate it's proper JSON */
          jsonldData.push(content);
        }
      } catch(e) {
        console.error('Invalid JSON-LD found:', e);
      }
    });
    
    setTimeout(() => {
      document.body.removeChild(overlay);
      
      if (jsonldData.length === 0) {
        alert('No structured data found on this page.');
        return;
      }
      
      /* Prepare data for transmission */
      const data = {
        url: window.location.href,
        blocks: jsonldData,
        timestamp: Date.now()
      };
      
      /* Check payload size */
      const encoded = encodeURIComponent(JSON.stringify(data));
      
      if (encoded.length < 2000) {
        /* Small payload - use URL parameter */
        window.open(VALIDATOR_URL + '?bookmarklet=' + encoded, '_blank');
      } else {
        /* Large payload - use postMessage */
        const sessionId = 'bm_' + Date.now();
        const newWindow = window.open(VALIDATOR_URL + '?bookmarklet=pending&session=' + sessionId, '_blank');
        
        /* Wait for new window to load, then send data */
        setTimeout(() => {
          newWindow.postMessage({
            type: 'bookmarklet-data',
            session: sessionId,
            data: data
          }, VALIDATOR_URL);
        }, 2000);
      }
    }, 1000);
  })();`;

  // Create the full javascript: URL
  const fullBookmarkletUrl = `javascript:${bookmarkletCode}`;

  useEffect(() => {
    // After the component mounts, we'll dynamically set the href to bypass React's sanitization
    if (bookmarkletLinkRef.current) {
      // Use setAttribute to bypass React's sanitization
      bookmarkletLinkRef.current.setAttribute('href', fullBookmarkletUrl);
    }
  }, [fullBookmarkletUrl]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(fullBookmarkletUrl);
      setCopyButtonText('Copied!');
      setTimeout(() => setCopyButtonText('Copy Code'), 2000);
    } catch (err) {
      alert('Failed to copy. Please select and copy the code manually.');
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <main className="bookmarklet-container">
        <div className="bookmarklet-wrapper">
          <a href="/" className="back-link">← Back to Validator</a>
          
          <h1 className="bookmarklet-title">
            Install the JSON-LD Validator Bookmarklet
          </h1>
          <p className="bookmarklet-subtitle">
            Validate structured data from any website directly in your browser, even if the site blocks our servers.
          </p>

          <div className="warning-banner">
            ⚡ This bookmarklet solves the 403 error issue by extracting data directly from your browser instead of our servers trying to fetch it.
          </div>

          <div className="bookmarklet-section">
            <h2 className="section-title">Quick Install</h2>
            
            <div className="bookmarklet-button-wrapper">
              <a 
                ref={bookmarkletLinkRef}
                href="#"
                className="bookmarklet-link"
                onClick={(e) => {
                  e.preventDefault();
                  setShowManualInstructions(true);
                }}
              >
                🔍 JSON-LD Validator
              </a>
              <div className="drag-instruction">
                ↑ Drag this orange button to your bookmarks bar
              </div>
            </div>

            <div className="browser-note">
              <strong>Can't see your bookmarks bar?</strong> 
              {browserName === 'Chrome' && ' Press Ctrl+Shift+B (Windows) or Cmd+Shift+B (Mac) to show it.'}
              {browserName === 'Firefox' && ' Press Ctrl+B (Windows) or Cmd+B (Mac) to show it.'}
              {browserName === 'Safari' && ' Go to View → Show Favorites Bar or press Cmd+Shift+B.'}
              {browserName === 'Edge' && ' Press Ctrl+Shift+B (Windows) or Cmd+Shift+B (Mac) to show it.'}
            </div>

            {showManualInstructions && (
              <div className="manual-install">
                <div className="demo-title">⚠️ Having trouble? Try manual installation:</div>
                <div className="demo-text">
                  If dragging doesn't work, you can manually create the bookmarklet:
                  <ol style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                    <li>Right-click your bookmarks bar and choose "Add page" or "Add bookmark"</li>
                    <li>Name it: <strong>JSON-LD Validator</strong></li>
                    <li>For the URL, paste this code:</li>
                  </ol>
                  <div className="code-box">{fullBookmarkletUrl}</div>
                  <button onClick={copyToClipboard} className="copy-button">
                    {copyButtonText}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="bookmarklet-section">
            <h2 className="section-title">How to Use</h2>
            <ol className="step-list">
              <li className="step-item">
                <div className="step-number">1</div>
                <div className="step-content">
                  <strong>Visit any website</strong> you want to check for structured data. This can be your own site, a competitor's site, or any page you're curious about.
                </div>
              </li>
              <li className="step-item">
                <div className="step-number">2</div>
                <div className="step-content">
                  <strong>Click the bookmarklet</strong> in your bookmarks bar. You'll see a brief orange notification that says "Scanning for JSON-LD..."
                </div>
              </li>
              <li className="step-item">
                <div className="step-number">3</div>
                <div className="step-content">
                  <strong>View your results</strong> in a new tab. The validator will open automatically with all the structured data from the page, ready for validation.
                </div>
              </li>
            </ol>

            <div className="demo-section">
              <div className="demo-title">💡 Pro Tip</div>
              <div className="demo-text">
                The bookmarklet works on any website you can access, including sites behind logins, local development servers, and sites that block automated tools. Since it runs in your browser, it sees exactly what you see!
              </div>
            </div>
          </div>

          <div className="bookmarklet-section">
            <h2 className="section-title">Why Use the Bookmarklet?</h2>
            <p style={{ color: '#4b5563', lineHeight: 1.6 }}>
              Many websites block requests from cloud services like Vercel to prevent scraping. When you try to validate these sites using our regular URL scanner, you'll get a 403 error. The bookmarklet solves this by running directly in your browser, where the website is already loaded and accessible.
            </p>
            <p style={{ color: '#4b5563', lineHeight: 1.6, marginTop: '1rem' }}>
              This approach is perfect for validating competitor sites, sites with aggressive security, or any page that gives you trouble with the regular scanner.
            </p>
          </div>

          <div className="bookmarklet-section">
            <h2 className="section-title">Alternative: Console Method</h2>
            <div className="demo-section">
              <div className="demo-title">For Advanced Users</div>
              <div className="demo-text">
                If the bookmarklet doesn't work on a particular site due to security restrictions, you can run the validator directly in your browser's console:
                <ol style={{ marginTop: '0.5rem' }}>
                  <li>Open Developer Tools (F12)</li>
                  <li>Go to the Console tab</li>
                  <li>Paste the bookmarklet code (without the "javascript:" prefix)</li>
                  <li>Press Enter to run</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="bookmarklet-section">
            <h2 className="section-title">Troubleshooting</h2>
            <div className="demo-section">
              <div className="demo-title">The bookmarklet isn't working</div>
              <div className="demo-text">
                Make sure you're dragging the button to your bookmarks bar, not clicking it. If you see a React error when hovering over the button, try the manual installation method shown above.
              </div>
            </div>
            <div className="demo-section" style={{ marginTop: '1rem' }}>
              <div className="demo-title">I can't see any structured data</div>
              <div className="demo-text">
                Not all websites use JSON-LD structured data. Some use other formats like Microdata or RDFa, which this tool doesn't detect. The page might genuinely have no structured data.
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}