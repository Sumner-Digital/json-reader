'use client'; 

import { useEffect } from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const postHeight = () =>
      window.parent?.postMessage(
        { type: 'APP_HEIGHT', height: document.documentElement.scrollHeight },
        '*'
      );

    postHeight();                              // initial
    window.addEventListener('resize', postHeight);

    // Watch for DOM size changes (JSON expands/collapses)
    const ro = new ResizeObserver(postHeight);
    ro.observe(document.documentElement);

    return () => {
      window.removeEventListener('resize', postHeight);
      ro.disconnect();
    };
  }, []);

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
