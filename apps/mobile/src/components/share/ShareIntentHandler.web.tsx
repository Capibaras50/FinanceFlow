import { useEffect } from 'react';

/**
 * Cache name + key used by the service worker (public/sw.js) to stash the
 * image received through the PWA Web Share Target before the app boots.
 */
const SHARE_CACHE = 'finance-flow-shared-image';

interface ShareIntentHandlerProps {
  onSharedImage: (uri: string) => void;
}

/** Same-origin absolute key — matches exactly what the service worker writes. */
const shareKey = (): string => `${window.location.origin}/latest`;

/**
 * Web (PWA): reads the image stored by the service worker after the system
 * share sheet posted it to /share-target, then forwards it to the scanner.
 */
export function ShareIntentHandler({ onSharedImage }: ShareIntentHandlerProps) {
  useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    const MAX_ATTEMPTS = 6;

    const attempt = async () => {
      if (cancelled) return;
      try {
        const cache = await caches.open(SHARE_CACHE);
        const response = await cache.match(shareKey());
        if (!response) {
          // The service worker may still be writing the file while the app
          // boots after the share redirect — retry briefly before giving up.
          if (attempts < MAX_ATTEMPTS) {
            attempts += 1;
            setTimeout(attempt, 250);
          }
          return;
        }
        await cache.delete(shareKey());
        const blob = await response.blob();
        if (!cancelled && blob.size > 0) {
          onSharedImage(window.URL.createObjectURL(blob));
        }
      } catch {
        // Cache API unavailable or empty share: nothing to do.
      }
    };

    attempt();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on app start
  }, []);

  return null;
}
