'use client';

import { useLayoutEffect } from 'react';

/**
 * Root layout that reports its body height to the parent page exactly
 * once per animation frame and only when the height changes by ≥ 5 px.
 * This throttling stops the classic “postMessage ↔ reflow” infinite loop.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  useLayoutEffect(() => {
    const body = document.getElementById('app-body') as HTMLElement | null;
    if (!body) return;

    let last = 0;                 // last height sent
    let rafId: number | null = null;

    const calc = () => body.getBoundingClientRect().height | 0;

    const send = () => {
      rafId = null;
      const h = calc();
      if (Math.abs(h - last) >= 5) {            // ignore ≤ 4 px jitters
        last = h;
        window.parent.postMessage({ type: 'APP_HEIGHT', height: h }, '*');
      }
    };

    const queue = () => {
      if (rafId == null) rafId = requestAnimationFrame(send);
    };

    // first paint
    queue();

    // watch any DOM change inside the body
    const ro = new ResizeObserver(queue);
    ro.observe(body);

    // viewport resize fallback
    window.addEventListener('resize', queue);

    return () => {
      window.removeEventListener('resize', queue);
      ro.disconnect();
      if (rafId != null) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <html lang="en">
      {/* inline margin reset to avoid collapsed 8 px body margin */}
      <body id="app-body" style={{ margin: 0 }}>{children}</body>
    </html>
  );
}