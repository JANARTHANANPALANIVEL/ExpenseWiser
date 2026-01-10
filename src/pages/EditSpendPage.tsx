import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wallet, Smartphone } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Loader, FullPageLoader } from '@/components/ui/Loader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useWallet } from '@/contexts/WalletContext';
import { getAvailableBalance } from '@/lib/calculations';
import { PaymentMethod, SpendRecord } from '@/lib/types';

const EditSpendPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { wallet, addMoneyRecords, spendRecords, updateSpend, getSpendById, loading: walletLoading } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [record, setRecord] = useState<SpendRecord | null>(null);
  const [purpose, setPurpose] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('hand');

  useEffect(() => {
    if (!walletLoading && id) {
      const found = getSpendById(id);
      if (found) {
        setRecord(found);
        setPurpose(found.purpose);
        setAmount(found.amount.toString());
        setMethod(found.method);
      } else {
        toast.error('Record not found');
        navigate('/spend');
      }
    }
  }, [id, walletLoading, getSpendById, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!record) return;

    if (!purpose.trim()) {
      toast.error('Enter purpose');
      return;
    }

    const amountNum = parseFloat(amount);

    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Enter valid amount');
      return;
    }

    const filteredSpendRecords = spendRecords.filter(r => r.id !== record.id);
    const availableBalance = getAvailableBalance(method, wallet, addMoneyRecords, filteredSpendRecords);

    if (amountNum > availableBalance) {
      toast.error(`Insufficient balance! Available: ₹${availableBalance.toLocaleString('en-IN')}`);
      return;
    }

    setIsLoading(true);

    try {
      await updateSpend(record.id, { purpose: purpose.trim(), amount: amountNum, method });
      toast.success('Updated!');
      navigate('/spend');
    } catch (error) {
      toast.error('Update failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (walletLoading || !record) {
    return <FullPageLoader />;
  }

  return (
    <Layout>
      <div className="max-w-md mx-auto space-y-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-xl font-semibold text-foreground">Edit Expense</h1>
          <p className="text-xs text-muted-foreground truncate">{record.purpose}</p>
        </motion.div>

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
              type="text"
              placeholder="What was this for?"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <div className="p-3 rounded-lg bg-secondary/50 text-muted-foreground text-sm">
              {record.date}
            </div>
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

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/spend')}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 gradient-primary text-primary-foreground font-medium"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader size="sm" />
                  <span>Saving...</span>
                </div>
              ) : (
                'Save'
              )}
            </Button>
          </div>
        </motion.form>
      </div>
    </Layout>
  );
};

export default EditSpendPage;
