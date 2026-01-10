import { motion } from 'framer-motion';
import { Wallet, Smartphone, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BalanceCardProps {
  title: string;
  amount: number;
  type: 'hand' | 'gpay' | 'total';
  delay?: number;
}

const iconMap = {
  hand: Wallet,
  gpay: Smartphone,
  total: TrendingUp,
};

const gradientMap = {
  hand: 'gradient-hand',
  gpay: 'gradient-gpay',
  total: 'gradient-primary',
};

export const BalanceCard = ({ title, amount, type, delay = 0 }: BalanceCardProps) => {
  const Icon = iconMap[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="bg-card rounded-lg p-4 sm:p-5 shadow-card border border-border/50 hover:shadow-elevated transition-shadow duration-300 h-full"
    >
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className={cn('p-2 sm:p-2.5 rounded-lg', gradientMap[type])}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
        </div>
        <span className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </span>
      </div>
      <div className="space-y-0.5 sm:space-y-1">
        <motion.p
          className="text-lg sm:text-2xl font-semibold text-foreground truncate"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: delay + 0.2 }}
        >
          ₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </motion.p>
        <p className="text-[10px] sm:text-xs text-muted-foreground">Current Balance</p>
      </div>
    </motion.div>
  );
};
