import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NavigatorScreenParams } from '@react-navigation/native';
import type { Ionicons } from '@expo/vector-icons';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  AddExpense: { expenseId?: number } | undefined;
  AddEarning: { earningId?: number } | undefined;
  ReceiptScanner: undefined;
  Chat: undefined;
  Categories: undefined;
  WalletDetail: { walletId: number };
  TransactionDetail: { transactionId: number; type: 'expense' | 'earning' };
  ChangePassword: undefined;
  Debts: undefined;
  DebtDetail: { debtId: number };
  AddDebt: { contactId?: number; contactName?: string; debtId?: number } | undefined;
  Contacts: undefined;
  ContactDetail: { contactId: number };
};

export type MainTabParamList = {
  Home: undefined;
  Transactions: undefined;
  Add: undefined;
  Wallets: undefined;
  Profile: undefined;
};

export type TabIconName = keyof typeof Ionicons.glyphMap;

export type AuthNavigationProp = NativeStackNavigationProp<RootStackParamList>;
export type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;
export type TabNavigationProp = BottomTabNavigationProp<MainTabParamList>;
