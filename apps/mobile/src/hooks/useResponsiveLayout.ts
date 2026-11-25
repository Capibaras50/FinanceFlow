import { useWindowDimensions } from 'react-native';
import { layout } from '../theme';

export interface ResponsiveLayout {
  width: number;
  height: number;
  isWide: boolean;
  contentMaxWidth: number;
  readingMaxWidth: number;
}

/**
 * Phone/tablet/desktop layout decision point.
 * Wide screens get a navigation rail and a centred content column;
 * narrow screens keep the bottom tab bar and full-width padding.
 */
export function useResponsiveLayout(): ResponsiveLayout {
  const { width, height } = useWindowDimensions();
  return {
    width,
    height,
    isWide: width >= layout.wideBreakpoint,
    contentMaxWidth: layout.contentMaxWidth,
    readingMaxWidth: layout.readingMaxWidth,
  };
}
