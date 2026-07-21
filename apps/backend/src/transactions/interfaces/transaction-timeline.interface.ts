export interface TransactionTimelineInterface {
  id: number;
  amount: number;
  name: string;
  description: string;
  createdAt: Date;
  type: 'expense' | 'earning';
}
