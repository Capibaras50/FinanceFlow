import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthContext, useAuthProvider } from './src/hooks/useAuth';
import { ThemeProvider } from './src/context/ThemeContext';
import { SnackbarProvider } from './src/context/SnackbarContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { StatusBar } from 'react-native';
import { useTheme } from './src/hooks/useTheme';
import {
  useFonts,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
} from '@expo-google-fonts/outfit';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { ActivityIndicator, View } from 'react-native';

function AppContent() {
  const auth = useAuthProvider();
  const { mode, colors } = useTheme();
  const [fontsLoaded] = useFonts({
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={auth}>
      <SnackbarProvider>
        <RootNavigator />
      </SnackbarProvider>
      <ExpoStatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <StatusBar backgroundColor={colors.background} />
    </AuthContext.Provider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
