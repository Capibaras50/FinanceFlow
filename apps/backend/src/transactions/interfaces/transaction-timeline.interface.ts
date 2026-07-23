export interface TransactionTimelineInterface {
  id: number;
  value: number;
  name: string;
  description: string;
  created_at: Date;
  type: 'expense' | 'earning';
  wallet_id: number;
  wallet_name: string;
}
