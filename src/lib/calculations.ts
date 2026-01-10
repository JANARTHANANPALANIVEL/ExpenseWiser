import { 
  WalletState, 
  AddMoneyRecord, 
  SpendRecord, 
  BalanceState, 
  DailySpend,
  WeeklyComparison,
  MonthlyComparison
} from './types';
import { 
  startOfWeek, 
  endOfWeek, 
  subWeeks, 
  startOfMonth, 
  endOfMonth, 
  subMonths,
  parseISO,
  isWithinInterval,
  format,
  eachDayOfInterval
} from 'date-fns';

export const calculateBalance = (
  wallet: WalletState,
  addMoneyRecords: AddMoneyRecord[],
  spendRecords: SpendRecord[]
): BalanceState => {
  const handAdded = addMoneyRecords
    .filter(r => r.method === 'hand')
    .reduce((sum, r) => sum + r.amount, 0);
  
  const gpayAdded = addMoneyRecords
    .filter(r => r.method === 'gpay')
    .reduce((sum, r) => sum + r.amount, 0);
  
  const handSpent = spendRecords
    .filter(r => r.method === 'hand')
    .reduce((sum, r) => sum + r.amount, 0);
  
  const gpaySpent = spendRecords
    .filter(r => r.method === 'gpay')
    .reduce((sum, r) => sum + r.amount, 0);

  const hand = wallet.initialHand + handAdded - handSpent;
  const gpay = wallet.initialGpay + gpayAdded - gpaySpent;

  return {
    hand,
    gpay,
    total: hand + gpay,
  };
};

export const getAvailableBalance = (
  method: 'hand' | 'gpay',
  wallet: WalletState,
  addMoneyRecords: AddMoneyRecord[],
  spendRecords: SpendRecord[]
): number => {
  const balance = calculateBalance(wallet, addMoneyRecords, spendRecords);
  return method === 'hand' ? balance.hand : balance.gpay;
};

export const getTotalSpentInRange = (
  spendRecords: SpendRecord[],
  from: Date,
  to: Date
): number => {
  return spendRecords
    .filter(r => {
      const date = parseISO(r.date);
      return isWithinInterval(date, { start: from, end: to });
    })
    .reduce((sum, r) => sum + r.amount, 0);
};

export const getTotalDepositedInRange = (
  addMoneyRecords: AddMoneyRecord[],
  from: Date,
  to: Date
): number => {
  return addMoneyRecords
    .filter(r => {
      const date = parseISO(r.date);
      return isWithinInterval(date, { start: from, end: to });
    })
    .reduce((sum, r) => sum + r.amount, 0);
};

export const getDailySpending = (
  spendRecords: SpendRecord[],
  from: Date,
  to: Date
): DailySpend[] => {
  const days = eachDayOfInterval({ start: from, end: to });
  
  return days.map(day => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const amount = spendRecords
      .filter(r => r.date === dateStr)
      .reduce((sum, r) => sum + r.amount, 0);
    
    return { date: dateStr, amount };
  });
};

export const getWeeklyComparison = (spendRecords: SpendRecord[]): WeeklyComparison => {
  const now = new Date();
  
  const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
  const thisWeekEnd = endOfWeek(now, { weekStartsOn: 1 });
  
  const lastWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
  const lastWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });

  return {
    thisWeek: getTotalSpentInRange(spendRecords, thisWeekStart, thisWeekEnd),
    lastWeek: getTotalSpentInRange(spendRecords, lastWeekStart, lastWeekEnd),
  };
};

export const getMonthlyComparison = (spendRecords: SpendRecord[]): MonthlyComparison => {
  const now = new Date();
  
  const thisMonthStart = startOfMonth(now);
  const thisMonthEnd = endOfMonth(now);
  
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(subMonths(now, 1));

  return {
    thisMonth: getTotalSpentInRange(spendRecords, thisMonthStart, thisMonthEnd),
    lastMonth: getTotalSpentInRange(spendRecords, lastMonthStart, lastMonthEnd),
  };
};
