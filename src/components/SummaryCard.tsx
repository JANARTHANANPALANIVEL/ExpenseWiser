import { motion } from 'framer-motion';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SummaryCardProps {
  title: string;
  amount: number;
  type: 'spent' | 'deposited';
  delay?: number;
}

export const SummaryCard = ({ title, amount, type, delay = 0 }: SummaryCardProps) => {
  const Icon = type === 'spent' ? ArrowUpRight : ArrowDownLeft;
  const colorClass = type === 'spent' ? 'text-destructive' : 'text-success';
  const bgClass = type === 'spent' ? 'bg-destructive/10' : 'bg-success/10';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="bg-card rounded-lg p-3 sm:p-5 shadow-card border border-border/50"
    >
      <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
        <div className={cn('p-1.5 sm:p-2 rounded-lg', bgClass)}>
          <Icon className={cn('w-3 h-3 sm:w-4 sm:h-4', colorClass)} />
        </div>
        <span className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
          {title}
        </span>
      </div>
      <motion.p
        className={cn('text-base sm:text-xl font-semibold truncate', colorClass)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: delay + 0.2 }}
      >
        ₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
      </motion.p>
    </motion.div>
  );
};
