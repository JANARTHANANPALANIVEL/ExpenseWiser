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
import { PaymentMethod } from '@/lib/types';

const AddMoneyPage = () => {
  const navigate = useNavigate();
  const { addMoney } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('hand');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amountNum = parseFloat(amount);

    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Enter valid amount');
      return;
    }

    if (!date) {
      toast.error('Select a date');
      return;
    }

    setIsLoading(true);

    try {
      await addMoney({ amount: amountNum, method, date });
      toast.success('Money added!');
      navigate('/manage');
    } catch (error) {
      toast.error('Failed to add');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto space-y-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-xl font-semibold text-foreground">Add Money</h1>
          <p className="text-xs text-muted-foreground">Deposit to wallet</p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="bg-card rounded-xl p-5 shadow-card border border-border/50 space-y-4"
        >
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
            <Label>Deposit To</Label>
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
            className="w-full gradient-success text-success-foreground font-medium"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader size="sm" />
                <span>Adding...</span>
              </div>
            ) : (
              'Add Money'
            )}
          </Button>
        </motion.form>
      </div>
    </Layout>
  );
};

export default AddMoneyPage;
