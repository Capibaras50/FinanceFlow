import { AuthContext, useAuthProvider } from './src/hooks/useAuth';
import { ThemeProvider } from './src/context/ThemeContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from './src/hooks/useTheme';

function AppContent() {
  const auth = useAuthProvider();
  const { mode, colors } = useTheme();

  return (
    <AuthContext.Provider value={auth}>
      <RootNavigator />
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
    </AuthContext.Provider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
