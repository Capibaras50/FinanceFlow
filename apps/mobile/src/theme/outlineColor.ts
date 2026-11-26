import { Platform, type ViewStyle } from 'react-native';

/** Visible keyboard focus ring. No-op on native, where focus is handled by the OS. */
export function outlineColor(color: string): ViewStyle {
  if (Platform.OS !== 'web') return {};
  return {
    outlineStyle: 'solid',
    outlineColor: color,
    outlineWidth: 2,
    outlineOffset: 2,
  };
}
