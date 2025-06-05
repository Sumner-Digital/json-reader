'use client';

import { useLayoutEffect } from 'react';

const ALLOWED_ORIGIN = '*'; // parent validates

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useLayoutEffect(() => {
    const target = document.getElementById('app-body') as HTMLElement | null;
    let lastHeight = 0;

    const getHeight = () => (target ? target.getBoundingClientRect().height : 0);

    const pushHeight = () => {
      const h = getHeight();
      if (h && h !== lastHeight) {
        lastHeight = h;
        window.parent.postMessage({ type: 'APP_HEIGHT', height: h }, ALLOWED_ORIGIN);
      }
    };

    // initial fire
    pushHeight();

    // watch content mutations
    const ro = new ResizeObserver(pushHeight);
    if (target) ro.observe(target);

    // safety‑net for viewport changes
    window.addEventListener('resize', pushHeight);

    return () => {
      window.removeEventListener('resize', pushHeight);
      if (target) ro.disconnect();
    };
  }, []);

  return (
    <html lang="en">
      <body id="app-body">{children}</body>
    </html>
  );
}