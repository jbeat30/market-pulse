'use client';

import { useEffect } from 'react';

/**
 * localhost / 127.0.0.1 제외 환경에서 개발자 도구 단축키를 차단.
 * Mac: Cmd+Option+I/J/C, Cmd+Shift+C
 * Windows/Linux: F12, Ctrl+Shift+I/J/C
 */
export const DevToolsGuard = () => {
  useEffect(() => {
    const { hostname } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') return;

    const handler = (e: KeyboardEvent) => {
      const isMac = /mac/i.test(navigator.platform);

      if (isMac) {
        if (e.metaKey && e.altKey && ['i', 'j', 'c'].includes(e.key.toLowerCase())) {
          e.preventDefault();
          return;
        }
        if (e.metaKey && e.shiftKey && e.key.toLowerCase() === 'c') {
          e.preventDefault();
        }
      } else {
        if (e.key === 'F12') {
          e.preventDefault();
          return;
        }
        if (e.ctrlKey && e.shiftKey && ['i', 'j', 'c'].includes(e.key.toLowerCase())) {
          e.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return null;
};
