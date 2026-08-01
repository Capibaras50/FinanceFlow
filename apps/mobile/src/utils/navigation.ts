import type { RootNavigationProp } from '../navigation/types';

export function goBackOrHome(navigation: RootNavigationProp) {
  if (navigation.canGoBack()) {
    navigation.goBack();
    return;
  }
  navigation.reset({
    index: 0,
    routes: [{ name: 'MainTabs', params: { screen: 'Home' } }],
  });
}
