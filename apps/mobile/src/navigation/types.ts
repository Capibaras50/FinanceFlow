import type { Ionicons } from '@expo/vector-icons';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Transactions: undefined;
  Add: undefined;
  Wallets: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
  AddExpense: { expenseId?: number } | undefined;
  AddEarning: { earningId?: number } | undefined;
  ReceiptScanner: undefined;
  Chat: undefined;
  Categories: undefined;
  WalletDetail: { walletId: number };
  TransactionDetail: { transactionId: number; type: 'expense' | 'earning' };
};

export type TabIconName = keyof typeof Ionicons.glyphMap;
