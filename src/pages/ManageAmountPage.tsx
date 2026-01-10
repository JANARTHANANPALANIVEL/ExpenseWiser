import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { Wallet, Smartphone, TrendingUp, Plus } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { FullPageLoader } from '@/components/ui/Loader';
import { WalletPieChart } from '@/components/charts/WalletPieChart';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/contexts/WalletContext';
import { calculateBalance } from '@/lib/calculations';

const ManageAmountPage = () => {
  const navigate = useNavigate();
  const { wallet, addMoneyRecords, spendRecords, loading } = useWallet();

  const balance = useMemo(() => 
    calculateBalance(wallet, addMoneyRecords, spendRecords),
    [wallet, addMoneyRecords, spendRecords]
  );

  const sortedRecords = useMemo(() => 
    [...addMoneyRecords].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ),
    [addMoneyRecords]
  );

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
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-xl font-semibold text-foreground">Wallet</h1>
            <p className="text-xs text-muted-foreground">Overview</p>
          </div>
          <Button
            onClick={() => navigate('/add-money')}
            size="sm"
            className="gradient-primary text-primary-foreground"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </motion.div>

        {/* Balance Cards */}
        <div className="grid grid-cols-3 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl p-4 shadow-card border border-border/50"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg gradient-hand">
                <Wallet className="w-3 h-3 text-foreground" />
              </div>
              <span className="text-xs text-muted-foreground">Hand</span>
            </div>
            <p className="text-lg font-semibold text-foreground">
              ₹{balance.hand.toLocaleString('en-IN')}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-xl p-4 shadow-card border border-border/50"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg gradient-gpay">
                <Smartphone className="w-3 h-3 text-foreground" />
              </div>
              <span className="text-xs text-muted-foreground">GPay</span>
            </div>
            <p className="text-lg font-semibold text-foreground">
              ₹{balance.gpay.toLocaleString('en-IN')}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-xl p-4 shadow-card border border-border/50"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg gradient-primary">
                <TrendingUp className="w-3 h-3 text-foreground" />
              </div>
              <span className="text-xs text-muted-foreground">Total</span>
            </div>
            <p className="text-lg font-semibold text-foreground">
              ₹{balance.total.toLocaleString('en-IN')}
            </p>
          </motion.div>
        </div>

        {/* Pie Chart */}
        <WalletPieChart hand={balance.hand} gpay={balance.gpay} />

        {/* History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-xl shadow-card border border-border/50 overflow-hidden"
        >
          <div className="p-4 border-b border-border/50">
            <h3 className="text-sm font-semibold text-foreground">Money Added</h3>
          </div>
          {sortedRecords.length > 0 ? (
            <div className="divide-y divide-border/50">
              {sortedRecords.slice(0, 10).map((record, index) => (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.03 }}
                  className="p-4 flex items-center gap-3"
                >
                  <div className={`p-2 rounded-lg ${record.method === 'hand' ? 'bg-hand/15' : 'bg-gpay/15'}`}>
                    {record.method === 'hand' ? (
                      <Wallet className="w-4 h-4 text-hand" />
                    ) : (
                      <Smartphone className="w-4 h-4 text-gpay" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">
                      {format(parseISO(record.date), 'MMM dd')} • {record.method === 'gpay' ? 'GPay' : 'Hand'}
                    </p>
                  </div>
                  <span className="text-success font-semibold">
                    +₹{record.amount.toLocaleString('en-IN')}
                  </span>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-muted-foreground text-sm mb-4">No money added yet</p>
              <Button variant="outline" onClick={() => navigate('/add-money')}>
                Add Money
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
};

export default ManageAmountPage;
