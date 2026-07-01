import { useEffect, useRef } from 'react';
import { NavigationContainer, NavigationContainerRef, type LinkingOptions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuth';
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
    },
  },
};

export function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);
  const prevAuth = useRef<boolean | null>(null);

  useEffect(() => {
    if (isLoading) return;
    const nav = navigationRef.current;
    if (!nav) return;

    if (prevAuth.current === null) {
      prevAuth.current = isAuthenticated;
      if (isAuthenticated) {
        nav.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
      }
      return;
    }

    if (prevAuth.current !== isAuthenticated) {
      prevAuth.current = isAuthenticated;
      nav.reset({ index: 0, routes: [{ name: isAuthenticated ? 'MainTabs' : 'Login' }] });
    }
  }, [isAuthenticated, isLoading]);

  return (
    <NavigationContainer ref={navigationRef} linking={linking}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        <Stack.Screen name="MainTabs" component={MainTabNavigator} />
        <Stack.Screen name="AddExpense" component={AddExpenseScreen} options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="AddEarning" component={AddEarningScreen} options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="TransactionDetail" component={TransactionDetailScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="ReceiptScanner" component={ReceiptScannerScreen} options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="Chat" component={ChatScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="Categories" component={CategoriesScreen} options={{ animation: 'slide_from_right' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
