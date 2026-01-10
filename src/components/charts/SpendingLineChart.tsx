import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { DailySpend } from '@/lib/types';
import { format, parseISO } from 'date-fns';

interface SpendingLineChartProps {
  data: DailySpend[];
}

export const SpendingLineChart = ({ data }: SpendingLineChartProps) => {
  const formattedData = data.map((d) => ({
    ...d,
    displayDate: format(parseISO(d.date), 'MMM dd'),
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-card rounded-lg p-3 sm:p-5 shadow-card border border-border/50"
    >
      <h3 className="text-xs sm:text-sm font-semibold text-foreground mb-3 sm:mb-4">Daily Spending</h3>
      <div className="h-48 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formattedData} margin={{ left: -10, right: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(20 10% 20%)" />
            <XAxis
              dataKey="displayDate"
              stroke="hsl(30 10% 55%)"
              fontSize={9}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              stroke="hsl(30 10% 55%)"
              fontSize={9}
              tickLine={false}
              tickFormatter={(value) => `₹${value}`}
              width={45}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(20 12% 12%)',
                border: '1px solid hsl(20 10% 20%)',
                borderRadius: '8px',
                fontSize: '11px',
              }}
              formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Spent']}
              labelStyle={{ color: 'hsl(30 15% 92%)' }}
            />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="hsl(30 60% 45%)"
              strokeWidth={2}
              dot={{ fill: 'hsl(30 60% 45%)', strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5, fill: 'hsl(35 70% 50%)' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};
