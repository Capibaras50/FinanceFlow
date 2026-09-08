/**
 * In-memory handoff of an image shared into the app (Android share intent or
 * PWA Web Share Target). The share handler stores the payload here and
 * navigates to ReceiptScanner, which consumes it on focus.
 *
 * Not persisted on purpose: a lost share is better than a stale one. A TTL
 * expires shares that couldn't be delivered in time (e.g. slow cold start),
 * so a day-old receipt never pops up unexpectedly.
 */
export interface SharedImagePayload {
  /** Native: file path from expo-share-intent. Web: object URL (blob:). */
  uri: string;
}

const SHARE_TTL_MS = 120_000;

interface PendingShare {
  payload: SharedImagePayload;
  at: number;
}

let pending: PendingShare | null = null;

export function setPendingSharedImage(payload: SharedImagePayload): void {
  pending = { payload, at: Date.now() };
}

export function consumePendingSharedImage(): SharedImagePayload | null {
  if (!pending) return null;
  if (Date.now() - pending.at > SHARE_TTL_MS) {
    pending = null;
    return null;
  }
  const payload = pending.payload;
  pending = null;
  return payload;
}

export function hasPendingSharedImage(): boolean {
  return (
    !!pending && Date.now() - pending.at <= SHARE_TTL_MS
  );
}
