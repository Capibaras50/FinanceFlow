import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthContext, useAuthProvider } from './src/hooks/useAuth';
import { ThemeProvider } from './src/context/ThemeContext';
import { SnackbarProvider } from './src/context/SnackbarContext';
import { AppAlertProvider } from './src/components/ui/AppAlert';
import { RootNavigator } from './src/navigation/RootNavigator';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { StatusBar } from 'react-native';
import { useTheme } from './src/hooks/useTheme';
import { useAppFonts } from './src/hooks/useAppFonts';
import { ActivityIndicator, Text, View } from 'react-native';
import { SkeletonBlock } from './src/components/ui/Skeleton';
import { useReducedMotion } from './src/hooks/useReducedMotion';
import { hideNativeSplash } from './src/utils/nativeSplash';
import { borderRadius, spacing, typography } from './src/theme';

function AppContent() {
  const auth = useAuthProvider();
  const { mode, colors, isHydrated } = useTheme();
  const reduceMotion = useReducedMotion();
  const [fontsLoaded, fontError] = useAppFonts();
  const bootReady = (fontsLoaded || !!fontError) && isHydrated;

  useEffect(() => {
    if (bootReady && !auth.isLoading) {
      hideNativeSplash();
    }
  }, [bootReady, auth.isLoading]);

  if (!bootReady) {
    return (
      <View
        accessible
        accessibilityLabel="Cargando la aplicación"
        style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', gap: spacing.md }}
      >
        <View
          accessible={false}
          style={{
            width: 64,
            height: 64,
            borderRadius: borderRadius.md,
            backgroundColor: colors.surface,
            borderWidth: 3,
            borderColor: colors.strokeStrong,
            padding: 8,
          }}
        >
          <SkeletonBlock height={12} radius={4} />
          <SkeletonBlock height={8} width="60%" radius={4} style={{ marginTop: 8 }} />
        </View>
        {reduceMotion ? (
          <Text accessibilityLiveRegion="polite" style={[typography.bodySm, { color: colors.onSurfaceVariant }]}>
            Cargando…
          </Text>
        ) : (
          <ActivityIndicator size="small" color={colors.primary} />
        )}
      </View>
    );
  }

  return (
    <AuthContext.Provider value={auth}>
      <SnackbarProvider>
        <AppAlertProvider>
          <RootNavigator />
        </AppAlertProvider>
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
