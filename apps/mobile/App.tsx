import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthContext, useAuthProvider } from './src/hooks/useAuth';
import { ThemeProvider } from './src/context/ThemeContext';
import { SnackbarProvider } from './src/context/SnackbarContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from './src/hooks/useTheme';

function AppContent() {
  const auth = useAuthProvider();
  const { mode, colors } = useTheme();

  return (
    <AuthContext.Provider value={auth}>
      <SnackbarProvider>
        <RootNavigator />
      </SnackbarProvider>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
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
