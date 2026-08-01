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
  type: 'expense' | 'earning';
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
  category: Category;
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

export interface TransactionSummary {
  totalEarnings: number;
  totalExpenses: number;
  balance: number;
}

export interface CategoryBreakdownItem {
  categoryId: number;
  name: string;
  color: string;
  value: number;
  count: number;
  type: 'expense' | 'earning';
}

export interface PendingCount {
  count: number;
}

export interface DebtSummary {
  receivableTotal: number;
  payableTotal: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

export type ContactStatus = 'pending' | 'accepted' | 'rejected';

export interface Contact {
  id: number;
  requester: Profile;
  addressee: Profile;
  status: ContactStatus;
  createdAt: string;
  updatedAt: string;
}

export type DebtDirection = 'receivable' | 'payable';
export type DebtStatus = 'pending' | 'cancelled' | 'overdue' | 'paid';
export type DebtType =
  | 'personal'
  | 'bank'
  | 'credit_card'
  | 'loan'
  | 'commercial'
  | 'fiscal'
  | 'other';
export type DebtPriority = 'low' | 'medium' | 'high';

export interface Debt {
  id: number;
  name: string;
  description: string | null;
  contactName: string;
  contact: Contact | null;
  amount: number;
  direction: DebtDirection;
  debtType: DebtType;
  status: DebtStatus;
  priority: DebtPriority;
  receiptUrl: string | null;
  interestRate: number | null;
  dueDate: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
}
