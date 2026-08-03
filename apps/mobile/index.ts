import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);

if (Platform.OS === 'web' && typeof window !== 'undefined' && 'serviceWorker' in navigator && !__DEV__) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
