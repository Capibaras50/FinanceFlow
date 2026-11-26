import * as SplashScreen from 'expo-splash-screen';

// Keep the native splash up until fonts and auth hydration finish; otherwise
// users see the native splash, then a second custom loading screen.
SplashScreen.preventAutoHideAsync();

export function hideNativeSplash() {
  SplashScreen.hideAsync();
}
