import { motion } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';

interface WalletPieChartProps {
  hand: number;
  gpay: number;
}

export const WalletPieChart = ({ hand, gpay }: WalletPieChartProps) => {
  const data = [
    { name: 'Hand', value: hand },
    { name: 'GPay', value: gpay },
  ];

  const COLORS = ['hsl(30 70% 50%)', 'hsl(200 70% 50%)'];

  const total = hand + gpay;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-card rounded-lg p-5 shadow-card border border-border/50"
    >
      <h3 className="text-sm font-semibold text-foreground mb-4">Balance Distribution</h3>
      {total > 0 ? (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(20 12% 12%)',
                  border: '1px solid hsl(20 10% 20%)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, '']}
                labelStyle={{ color: 'hsl(30 15% 92%)' }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => (
                  <span style={{ color: 'hsl(30 15% 92%)', fontSize: '12px' }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-64 flex items-center justify-center">
          <p className="text-muted-foreground text-sm">No balance to display</p>
        </div>
      )}
    </motion.div>
  );
};
