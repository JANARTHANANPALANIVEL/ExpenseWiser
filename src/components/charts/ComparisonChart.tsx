import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface ComparisonChartProps {
  title: string;
  current: number;
  previous: number;
  currentLabel: string;
  previousLabel: string;
}

export const ComparisonChart = ({
  title,
  current,
  previous,
  currentLabel,
  previousLabel,
}: ComparisonChartProps) => {
  const data = [
    { name: previousLabel, amount: previous },
    { name: currentLabel, amount: current },
  ];

  const percentChange = previous > 0 
    ? ((current - previous) / previous * 100).toFixed(1)
    : current > 0 ? '+100' : '0';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-card rounded-lg p-3 sm:p-5 shadow-card border border-border/50"
    >
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-xs sm:text-sm font-semibold text-foreground">{title}</h3>
        <span className={`text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full ${
          Number(percentChange) > 0 
            ? 'bg-destructive/10 text-destructive' 
            : 'bg-success/10 text-success'
        }`}>
          {Number(percentChange) > 0 ? '+' : ''}{percentChange}%
        </span>
      </div>
      <div className="h-32 sm:h-40">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap="25%" margin={{ left: -15, right: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(20 10% 20%)" />
            <XAxis
              dataKey="name"
              stroke="hsl(30 10% 55%)"
              fontSize={9}
              tickLine={false}
            />
            <YAxis
              stroke="hsl(30 10% 55%)"
              fontSize={9}
              tickLine={false}
              tickFormatter={(value) => `₹${value}`}
              width={40}
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
            <Bar
              dataKey="amount"
              fill="hsl(30 60% 45%)"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};
