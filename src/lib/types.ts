export type PaymentMethod = 'hand' | 'gpay';

export interface WalletState {
  initialHand: number;
  initialGpay: number;
  createdAt: string;
}

export interface AddMoneyRecord {
  id: string;
  amount: number;
  method: PaymentMethod;
  date: string;
  createdAt: string;
}

export interface SpendRecord {
  id: string;
  purpose: string;
  amount: number;
  method: PaymentMethod;
  date: string;
  createdAt: string;
}

export interface BalanceState {
  hand: number;
  gpay: number;
  total: number;
}

export interface MonthFilter {
  from: string;
  to: string;
}

export interface DailySpend {
  date: string;
  amount: number;
}

export interface WeeklyComparison {
  thisWeek: number;
  lastWeek: number;
}

export interface MonthlyComparison {
  thisMonth: number;
  lastMonth: number;
}
