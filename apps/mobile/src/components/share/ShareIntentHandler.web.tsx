import { useEffect } from 'react';

/**
 * Cache name + key used by the service worker (public/sw.js) to stash the
 * image received through the PWA Web Share Target before the app boots.
 */
const SHARE_CACHE = 'finance-flow-shared-image';
const SHARE_KEY = '/latest';

interface ShareIntentHandlerProps {
  onSharedImage: (uri: string) => void;
}

/**
 * Web (PWA): reads the image stored by the service worker after the system
 * share sheet posted it to /share-target, then forwards it to the scanner.
 */
export function ShareIntentHandler({ onSharedImage }: ShareIntentHandlerProps) {
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        if (typeof window === 'undefined' || !('caches' in window)) return;
        const cache = await caches.open(SHARE_CACHE);
        const response = await cache.match(SHARE_KEY);
        if (!response || cancelled) return;
        await cache.delete(SHARE_KEY);
        const blob = await response.blob();
        if (!cancelled && blob.size > 0) {
          onSharedImage(URL.createObjectURL(blob));
        }
      } catch {
        // Cache API unavailable or empty share: nothing to do.
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on app start
  }, []);

  return null;
}
