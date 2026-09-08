import { useCallback, useEffect, useRef, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { NavigationContainer, NavigationContainerRef, type LinkingOptions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { ShareIntentHandler } from '../components/share/ShareIntentHandler';
import { setPendingSharedImage, hasPendingSharedImage } from '../services/sharedImage';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { ResetPasswordScreen } from '../screens/auth/ResetPasswordScreen';
import { MainTabNavigator } from './MainTabNavigator';
import { AddExpenseScreen } from '../screens/transactions/AddExpenseScreen';
import { AddEarningScreen } from '../screens/transactions/AddEarningScreen';
import { TransactionDetailScreen } from '../screens/transactions/TransactionDetailScreen';
import { ChatScreen } from '../screens/chat/ChatScreen';
import { ReceiptScannerScreen } from '../screens/scanner/ReceiptScannerScreen';
import { CategoriesScreen } from '../screens/categories/CategoriesScreen';
import { DebtsScreen } from '../screens/debts/DebtsScreen';
import { DebtDetailScreen } from '../screens/debts/DebtDetailScreen';
import { AddDebtScreen } from '../screens/debts/AddDebtScreen';
import { ContactsScreen } from '../screens/contacts/ContactsScreen';
import { ContactDetailScreen } from '../screens/contacts/ContactDetailScreen';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['finance-flow://'],
  config: {
    screens: {
      ResetPassword: 'reset-password',
      Login: 'login',
      Register: 'register',
      ForgotPassword: 'forgot-password',
      MainTabs: {
        screens: {
          Home: 'home',
          Transactions: 'transactions',
          Wallets: 'wallets',
          Profile: 'profile',
        },
      },
      AddExpense: 'add-expense',
      AddEarning: 'add-earning',
      TransactionDetail: 'transaction/:transactionId/:type',
      ReceiptScanner: 'scanner',
      Chat: 'chat',
      Categories: 'categories',
      Debts: 'debts',
      DebtDetail: 'debt/:debtId',
      AddDebt: 'add-debt',
      Contacts: 'contacts',
      ContactDetail: 'contact/:contactId',
    },
  },
};

function SplashScreen() {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
      <LinearGradient
        colors={colors.gradient.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ width: 72, height: 72, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}
      >
        <Ionicons name="wallet" size={36} color="#FFFFFF" />
      </LinearGradient>
      <Text style={{ color: colors.onSurface, fontSize: 22, fontWeight: '700', marginBottom: 8 }}>
        Finance Flow
      </Text>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

export function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);
  const [navReady, setNavReady] = useState(false);

  // Single delivery point: only hand the shared image to the scanner when the
  // navigator is ready AND the user is logged in. If a share arrives while on
  // the login screen, this effect refires when isAuthenticated flips to true
  // and delivers it right after sign-in.
  const deliverSharedImage = useCallback(() => {
    if (!isAuthenticated || !navReady) return;
    if (!navigationRef.current?.isReady()) return;
    if (!hasPendingSharedImage()) return;
    navigationRef.current.navigate('ReceiptScanner');
  }, [isAuthenticated, navReady]);

  useEffect(() => {
    deliverSharedImage();
  }, [deliverSharedImage]);

  // Receives an image shared into the app (share sheet / PWA share target).
  // Always stash it first — delivery happens via deliverSharedImage.
  const handleSharedImage = useCallback((uri: string) => {
    setPendingSharedImage({ uri });
    deliverSharedImage();
  }, [deliverSharedImage]);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      linking={linking}
      onReady={() => setNavReady(true)}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="MainTabs" component={MainTabNavigator} />
            <Stack.Screen name="Debts" component={DebtsScreen} options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="DebtDetail" component={DebtDetailScreen} options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="AddDebt" component={AddDebtScreen} options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="Contacts" component={ContactsScreen} options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="ContactDetail" component={ContactDetailScreen} options={{ animation: 'slide_from_right' }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ animation: 'slide_from_right' }} />
          </>
        )}
        <Stack.Screen name="AddExpense" component={AddExpenseScreen} options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="AddEarning" component={AddEarningScreen} options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="TransactionDetail" component={TransactionDetailScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="ReceiptScanner" component={ReceiptScannerScreen} options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="Chat" component={ChatScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="Categories" component={CategoriesScreen} options={{ animation: 'slide_from_right' }} />
      </Stack.Navigator>
      <ShareIntentHandler onSharedImage={handleSharedImage} />
    </NavigationContainer>
  );
}
