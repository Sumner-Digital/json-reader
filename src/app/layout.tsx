'use client';

import { useEffect } from 'react';

const ALLOWED_ORIGIN = 'https://websitehq.com';   // parent site

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const pushHeight = () =>
      window.parent.postMessage(
        { type: 'APP_HEIGHT', height: document.documentElement.scrollHeight },
        ALLOWED_ORIGIN
      );

    // send once + on every size change
    pushHeight();
    window.addEventListener('resize', pushHeight);
    const ro = new ResizeObserver(pushHeight);     // catches JSON accordion toggles
    ro.observe(document.documentElement);

    return () => {
      window.removeEventListener('resize', pushHeight);
      ro.disconnect();
    };
  }, []);

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}