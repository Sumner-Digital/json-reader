'use client';

import { useLayoutEffect } from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useLayoutEffect(() => {
    const target = document.getElementById('app-body') as HTMLElement | null;
    let last = 0;

    const height = () => (target ? target.getBoundingClientRect().height : 0);

    const send = () => {
      const h = height();
      if (h && h !== last) {
        last = h;
        window.parent.postMessage({ type: 'APP_HEIGHT', height: h }, '*');
      }
    };

    send();                                 // first paint
    const ro = new ResizeObserver(send);    // any DOM changes
    if (target) ro.observe(target);
    window.addEventListener('resize', send);

    return () => {
      window.removeEventListener('resize', send);
      if (target) ro.disconnect();
    };
  }, []);

  return (
    <html lang="en">
      <body id="app-body">{children}</body>
    </html>
  );
}