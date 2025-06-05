'use client';

import { useLayoutEffect, useRef } from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const lastHeightRef = useRef(0);
  const rafRef        = useRef<number | null>(null);

  useLayoutEffect(() => {
    // 1. Grab a dedicated, margin-free wrapper
    const container = document.getElementById('app-body') as HTMLElement | null;
    if (!container) return;

    // 2. Inline CSS to zero-out default margins & avoid collapse ✔
    container.style.margin = '0';

    // 3. Calc function: uses getBoundingClientRect to drop decimals
    const calcHeight = () => container.getBoundingClientRect().height | 0;

    // 4. Send only when ≥ 5px difference
    const sendHeight = () => {
      rafRef.current = null;
      const newH = calcHeight();
      if (Math.abs(newH - lastHeightRef.current) >= 5) {
        lastHeightRef.current = newH;
        window.parent.postMessage({ type: 'APP_HEIGHT', height: newH }, '*');
      }
    };

    // 5. Queue on next animation frame if none pending
    const queueUpdate = () => {
      if (rafRef.current == null) {
        rafRef.current = requestAnimationFrame(sendHeight);
      }
    };

    // 6. Observe only child-content mutations (DOM, attributes, subtree)
    const mo = new MutationObserver(queueUpdate);
    mo.observe(container, {
      childList:   true,
      subtree:     true,
      attributes:  true,
      characterData: true
    });

    // 7. Also queue on window resize
    window.addEventListener('resize', queueUpdate);

    // 8. Fire once initially
    queueUpdate();

    return () => {
      window.removeEventListener('resize', queueUpdate);
      mo.disconnect();
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <html lang="en">
      {/* Give the parent a known hook to measure */}
      <body id="app-body">
        {children}
      </body>
    </html>
  );
}