import { useEffect, useState } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

/**
 * Single source for reduced-motion preference on native and web.
 * All animation components should read this before starting an animation.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let active = true;

    if (Platform.OS === 'web') {
      if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
        return;
      }
      const query = window.matchMedia('(prefers-reduced-motion: reduce)');
      const update = () => {
        if (active) setReduced(query.matches);
      };
      update();

      if (typeof query.addEventListener === 'function') {
        query.addEventListener('change', update);
        return () => {
          active = false;
          query.removeEventListener('change', update);
        };
      }

      query.addListener(update);
      return () => {
        active = false;
        query.removeListener(update);
      };
    }

    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (active) setReduced(enabled);
      })
      .catch(() => {
        if (active) setReduced(false);
      });

    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled) => {
      if (active) setReduced(enabled);
    });

    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  return reduced;
}
