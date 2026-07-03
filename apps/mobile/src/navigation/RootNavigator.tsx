import { useRef } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { NavigationContainer, NavigationContainerRef, type LinkingOptions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
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

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer ref={navigationRef} linking={linking}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="MainTabs" component={MainTabNavigator} />
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
    </NavigationContainer>
  );
}
