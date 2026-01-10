import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { AlertTriangle } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { BalanceCard } from '@/components/BalanceCard';
import { SummaryCard } from '@/components/SummaryCard';
import { SpendingLineChart } from '@/components/charts/SpendingLineChart';
import { ComparisonChart } from '@/components/charts/ComparisonChart';
import { FullPageLoader } from '@/components/ui/Loader';
import { useWallet } from '@/contexts/WalletContext';
import { 
  calculateBalance, 
  getTotalSpentInRange, 
  getTotalDepositedInRange,
  getDailySpending,
  getWeeklyComparison,
  getMonthlyComparison
} from '@/lib/calculations';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const Dashboard = () => {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const { wallet, addMoneyRecords, spendRecords, loading, budgetLimit } = useWallet();

  const balance = useMemo(() => 
    calculateBalance(wallet, addMoneyRecords, spendRecords),
    [wallet, addMoneyRecords, spendRecords]
  );

  const selectedDate = useMemo(() => {
    const [year, month] = selectedMonth.split('-');
    return new Date(parseInt(year), parseInt(month) - 1, 1);
  }, [selectedMonth]);

  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);

  const totalSpent = useMemo(() => 
    getTotalSpentInRange(spendRecords, monthStart, monthEnd),
    [spendRecords, monthStart, monthEnd]
  );

  const totalDeposited = useMemo(() => 
    getTotalDepositedInRange(addMoneyRecords, monthStart, monthEnd),
    [addMoneyRecords, monthStart, monthEnd]
  );

  const dailySpending = useMemo(() => 
    getDailySpending(spendRecords, monthStart, monthEnd),
    [spendRecords, monthStart, monthEnd]
  );

  const weeklyComparison = useMemo(() => 
    getWeeklyComparison(spendRecords),
    [spendRecords]
  );

  const monthlyComparison = useMemo(() => 
    getMonthlyComparison(spendRecords),
    [spendRecords]
  );

  // Current month spending for budget alert
  const currentMonthStart = startOfMonth(new Date());
  const currentMonthEnd = endOfMonth(new Date());
  const currentMonthSpent = useMemo(() => 
    getTotalSpentInRange(spendRecords, currentMonthStart, currentMonthEnd),
    [spendRecords, currentMonthStart, currentMonthEnd]
  );

  const budgetPercentage = budgetLimit > 0 ? (currentMonthSpent / budgetLimit) * 100 : 0;
  const isOverBudget = budgetLimit > 0 && currentMonthSpent > budgetLimit;
  const isNearBudget = budgetLimit > 0 && budgetPercentage >= 80 && !isOverBudget;

  // Generate month options for last 12 months
  const monthOptions = useMemo(() => {
    const options = [];
    for (let i = 0; i < 12; i++) {
      const date = subMonths(new Date(), i);
      options.push({
        value: format(date, 'yyyy-MM'),
        label: format(date, 'MMMM yyyy'),
      });
    }
    return options;
  }, []);

  if (loading) {
    return <FullPageLoader />;
  }

  return (
    <Layout>
      <div className="space-y-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-3"
        >
          <div>
            <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
            <p className="text-xs text-muted-foreground">Track your expenses</p>
          </div>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-32 h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        {/* Budget Alert */}
        {budgetLimit > 0 && (isOverBudget || isNearBudget) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-xl p-3 flex items-center gap-3 ${
              isOverBudget 
                ? 'bg-destructive/15 border border-destructive/30' 
                : 'bg-warning/15 border border-warning/30'
            }`}
          >
            <AlertTriangle className={`w-5 h-5 shrink-0 ${isOverBudget ? 'text-destructive' : 'text-warning'}`} />
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${isOverBudget ? 'text-destructive' : 'text-warning'}`}>
                {isOverBudget ? 'Budget Exceeded!' : 'Approaching Budget Limit'}
              </p>
              <p className="text-xs text-muted-foreground">
                ₹{currentMonthSpent.toLocaleString('en-IN')} / ₹{budgetLimit.toLocaleString('en-IN')} ({Math.round(budgetPercentage)}%)
              </p>
            </div>
          </motion.div>
        )}

        {/* Balance Cards */}
        <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
          <div className="min-w-[140px] flex-shrink-0">
            <BalanceCard title="Hand Cash" amount={balance.hand} type="hand" delay={0} />
          </div>
          <div className="min-w-[140px] flex-shrink-0">
            <BalanceCard title="GPay" amount={balance.gpay} type="gpay" delay={0.1} />
          </div>
          <div className="min-w-[140px] flex-shrink-0">
            <BalanceCard title="Total" amount={balance.total} type="total" delay={0.2} />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <SummaryCard
            title={`Spent in ${format(selectedDate, 'MMM')}`}
            amount={totalSpent}
            type="spent"
            delay={0.3}
          />
          <SummaryCard
            title={`Added in ${format(selectedDate, 'MMM')}`}
            amount={totalDeposited}
            type="deposited"
            delay={0.4}
          />
        </div>

        {/* Charts */}
        <SpendingLineChart data={dailySpending} />

        <div className="space-y-4">
          <ComparisonChart
            title="Weekly Comparison"
            current={weeklyComparison.thisWeek}
            previous={weeklyComparison.lastWeek}
            currentLabel="This Week"
            previousLabel="Last Week"
          />
          <ComparisonChart
            title="Monthly Comparison"
            current={monthlyComparison.thisMonth}
            previous={monthlyComparison.lastMonth}
            currentLabel="This Month"
            previousLabel="Last Month"
          />
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
