'use client';

// Load the iframe-resizer contentWindow script so it can respond
// to the parent’s iFrameResize(...) calls.
import 'iframe-resizer/js/iframeResizer.contentWindow';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* Zero out margins so the library measures a clean, stable height */}
      <body id="app-body" style={{ margin: 0 }}>
        {children}
      </body>
    </html>
  );
}