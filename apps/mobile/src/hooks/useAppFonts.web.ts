/**
 * Caja Fuerte typography maps every web font family to `System`, so loading
 * the native TTFs here would download ~1.6 MB before first paint for nothing.
 */
export function useAppFonts(): [boolean, Error | null] {
  return [true, null];
}
