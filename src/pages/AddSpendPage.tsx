import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Wallet, Smartphone } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Loader } from '@/components/ui/Loader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useWallet } from '@/contexts/WalletContext';
import { getAvailableBalance } from '@/lib/calculations';
import { PaymentMethod } from '@/lib/types';

const AddSpendPage = () => {
  const navigate = useNavigate();
  const { wallet, addMoneyRecords, spendRecords, addSpend } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [purpose, setPurpose] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('hand');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amountNum = parseFloat(amount);

    if (!purpose.trim()) {
      toast.error('Enter a purpose');
      return;
    }

    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Enter valid amount');
      return;
    }

    if (!date) {
      toast.error('Select a date');
      return;
    }

    const availableBalance = getAvailableBalance(method, wallet, addMoneyRecords, spendRecords);

    if (amountNum > availableBalance) {
      toast.error(`Insufficient balance! Available: ₹${availableBalance.toLocaleString('en-IN')}`);
      return;
    }

    setIsLoading(true);

    try {
      await addSpend({
        purpose: purpose.trim(),
        amount: amountNum,
        method,
        date,
      });

      toast.success('Expense added!');
      navigate('/spend');
    } catch (error) {
      toast.error('Failed to add expense');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto space-y-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-xl font-semibold text-foreground">Add Expense</h1>
          <p className="text-xs text-muted-foreground">Record spending</p>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="bg-card rounded-xl p-5 shadow-card border border-border/50 space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose</Label>
            <Input
              id="purpose"
              placeholder="e.g., Groceries, Bills"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label>Method</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMethod('hand')}
                disabled={isLoading}
                className={cn(
                  'flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all touch-manipulation',
                  method === 'hand'
                    ? 'border-hand bg-hand/10 text-hand'
                    : 'border-border bg-secondary/30 text-muted-foreground'
                )}
              >
                <Wallet className="w-5 h-5" />
                <span className="font-medium">Hand</span>
              </button>
              <button
                type="button"
                onClick={() => setMethod('gpay')}
                disabled={isLoading}
                className={cn(
                  'flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all touch-manipulation',
                  method === 'gpay'
                    ? 'border-gpay bg-gpay/10 text-gpay'
                    : 'border-border bg-secondary/30 text-muted-foreground'
                )}
              >
                <Smartphone className="w-5 h-5" />
                <span className="font-medium">GPay</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full gradient-primary text-primary-foreground font-medium"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader size="sm" />
                <span>Adding...</span>
              </div>
            ) : (
              'Add Expense'
            )}
          </Button>
        </motion.form>
      </div>
    </Layout>
  );
};

export default AddSpendPage;
