export interface User {
  id: number;
  email: string;
  profile: Profile;
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  id: number;
  name: string;
  avatarUrl: string | null;
}

export interface Category {
  id: number;
  name: string;
  description: string | null;
  color: string;
}

export interface Wallet {
  id: number;
  name: string;
  balance?: number;
}

export interface WalletBalance {
  id: number;
  name: string;
  totalExpenses: number;
  totalEarnings: number;
  balance: number;
}

export interface Transaction {
  id: number;
  name: string;
  description: string | null;
  value: number;
  wallet: Wallet;
  categories: Category[];
  createdAt: string;
}

export interface Expense extends Transaction {}

export interface Earning extends Transaction {}

export interface TransactionTotals {
  total: number;
  count: number;
}

export interface TopCategory {
  id: number;
  name: string;
  total: number;
  count: number;
}

export type ReceiptStatus = 'PENDING' | 'PROCESSING' | 'PROCESSED' | 'FAILED';

export interface Receipt {
  id: number;
  fileUrl: string;
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  status: ReceiptStatus;
  extractionConfidence: number | null;
  createdAt: string;
}

export interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  message: string;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

export interface MonthlySummary {
  totalEarnings: number;
  totalExpenses: number;
  balance: number;
  earningsCount: number;
  expensesCount: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}
