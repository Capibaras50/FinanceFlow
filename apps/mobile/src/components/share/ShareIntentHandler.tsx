import { useEffect } from 'react';
import { useShareIntent } from 'expo-share-intent';

interface ShareIntentHandlerProps {
  onSharedImage: (uri: string) => void;
}

/**
 * Native (Android/iOS): listens for images shared into the app via the system
 * share sheet and forwards them to the receipt scanner flow.
 */
export function ShareIntentHandler({ onSharedImage }: ShareIntentHandlerProps) {
  const { isReady, hasShareIntent, shareIntent, resetShareIntent } = useShareIntent();

  useEffect(() => {
    if (!isReady || !hasShareIntent) return;
    const image = shareIntent?.files?.find((f) => f.mimeType?.startsWith('image/'));
    const target = image ?? shareIntent?.files?.[0];
    if (target?.path) {
      onSharedImage(target.path);
    }
    resetShareIntent();
  }, [isReady, hasShareIntent, shareIntent, resetShareIntent, onSharedImage]);

  return null;
}
