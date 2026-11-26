import { useCallback, useEffect, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';

type ReloadFn = () => void | Promise<unknown>;

/**
 * Refetches only when the screen gains focus. The latest callback is kept in a
 * ref so changing filters or tabs does not re-subscribe the focus effect.
 * `onFocus` runs before the reload and keeps its own (usually stable) deps.
 */
export function useFocusReload(reload: ReloadFn, onFocus?: ReloadFn) {
  const reloadRef = useRef(reload);
  useEffect(() => {
    reloadRef.current = reload;
  }, [reload]);

  useFocusEffect(
    useCallback(() => {
      onFocus?.();
      reloadRef.current();
    }, [onFocus])
  );
}
