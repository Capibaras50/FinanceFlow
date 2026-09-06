/**
 * In-memory handoff of an image shared into the app (Android share intent or
 * PWA Web Share Target). The share handler stores the payload here and
 * navigates to ReceiptScanner, which consumes it on focus.
 *
 * Not persisted on purpose: a lost share is better than a stale one.
 */
export interface SharedImagePayload {
  /** Native: file path from expo-share-intent. Web: object URL (blob:). */
  uri: string;
}

let pending: SharedImagePayload | null = null;

export function setPendingSharedImage(payload: SharedImagePayload): void {
  pending = payload;
}

export function consumePendingSharedImage(): SharedImagePayload | null {
  const payload = pending;
  pending = null;
  return payload;
}
