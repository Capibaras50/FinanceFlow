import { useFonts } from 'expo-font';
import { Outfit_700Bold } from '@expo-google-fonts/outfit/700Bold';
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';

/**
 * Only the three faces referenced by src/theme/typography.ts are loaded.
 * Web resolves to useAppFonts.web.ts, where the system font is already used.
 */
export function useAppFonts(): [boolean, Error | null] {
  return useFonts({
    Outfit_700Bold,
    Inter_400Regular,
    Inter_500Medium,
  });
}
