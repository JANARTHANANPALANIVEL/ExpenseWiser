import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wallet, Target, Lock, ArrowLeft, Download, WifiOff } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useWallet } from '@/contexts/WalletContext';
import { usePinAuth } from '@/hooks/usePinAuth';
import { ExportDialog } from '@/components/ExportDialog';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { wallet, budgetLimit, setBudgetLimit, setInitialBalance, spendRecords, isOnline } = useWallet();
  const { 
    isOnline: authOnline,
    changePin,
    lockApp
  } = usePinAuth();

  // Initial Wallet
  const [handBalance, setHandBalance] = useState('');
  const [gpayBalance, setGpayBalance] = useState('');

  // Budget Limits
  const [monthlyBudget, setMonthlyBudget] = useState('');

  // Change PIN
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');

  const handleSaveInitialBalances = async () => {
    if (!isOnline) {
      toast.error('Please go online to save changes');
      return;
    }

    const handNum = parseFloat(handBalance) || 0;
    const gpayNum = parseFloat(gpayBalance) || 0;

    if (handNum < 0 || gpayNum < 0) {
      toast.error('Values cannot be negative');
      return;
    }

    try {
      await setInitialBalance(
        handBalance ? handNum : wallet.initialHand,
        gpayBalance ? gpayNum : wallet.initialGpay
      );
      toast.success('Initial balances saved!');
      setHandBalance('');
      setGpayBalance('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save');
    }
  };

  const handleSaveBudgetLimits = async () => {
    if (!isOnline) {
      toast.error('Please go online to save changes');
      return;
    }

    const budgetNum = parseFloat(monthlyBudget) || budgetLimit;

    if (budgetNum < 0) {
      toast.error('Budget cannot be negative');
      return;
    }

    try {
      await setBudgetLimit(budgetNum);
      toast.success('Budget limit saved!');
      setMonthlyBudget('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save');
    }
  };

  const handleChangePin = async () => {
    if (!authOnline) {
      toast.error('Please go online to change PIN');
      return;
    }

    if (currentPin.length !== 4) {
      toast.error('Enter your current 4-digit PIN');
      return;
    }
    if (newPin.length !== 4) {
      toast.error('New PIN must be 4 digits');
      return;
    }
    if (newPin !== confirmNewPin) {
      toast.error('PINs do not match');
      return;
    }

    try {
      const success = await changePin(currentPin, newPin);
      if (success) {
        toast.success('PIN changed successfully!');
        setCurrentPin('');
        setNewPin('');
        setConfirmNewPin('');
      } else {
        toast.error('Current PIN is incorrect');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to change PIN');
    }
  };

  const handleLockApp = () => {
    lockApp();
    navigate('/pin');
  };

  const combinedOnline = isOnline && authOnline;

  return (
    <Layout>
      <div className="max-w-md mx-auto space-y-4 pb-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Settings</h1>
            <p className="text-sm text-muted-foreground">Manage your preferences</p>
          </div>
        </motion.div>

        {/* Offline Warning */}
        {!combinedOnline && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 bg-destructive/10 text-destructive p-4 rounded-xl"
          >
            <WifiOff className="w-5 h-5 shrink-0" />
            <p className="text-sm">You're offline. Please connect to use the app.</p>
          </motion.div>
        )}

        {/* Initial Wallet Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-card rounded-xl p-5 shadow-card border border-border/50"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-hand/10">
              <Wallet className="w-5 h-5 text-hand" />
            </div>
            <h2 className="font-medium text-foreground">Initial Wallet</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Set your starting balance for Hand and GPay</p>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <Label className="text-hand text-sm font-medium">Hand</Label>
              <p className="text-xs text-muted-foreground">
                Current: {wallet.initialHand ? `₹${wallet.initialHand.toLocaleString()}` : 'Not set'}
              </p>
              <Input
                type="number"
                placeholder="New value"
                min="0"
                value={handBalance}
                onChange={(e) => setHandBalance(e.target.value)}
                className="bg-secondary/50 border-border/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gpay text-sm font-medium">GPay</Label>
              <p className="text-xs text-muted-foreground">
                Current: {wallet.initialGpay ? `₹${wallet.initialGpay.toLocaleString()}` : 'Not set'}
              </p>
              <Input
                type="number"
                placeholder="New value"
                min="0"
                value={gpayBalance}
                onChange={(e) => setGpayBalance(e.target.value)}
                className="bg-secondary/50 border-border/50"
              />
            </div>
          </div>

          <Button
            onClick={handleSaveInitialBalances}
            disabled={!combinedOnline}
            className="w-full bg-secondary hover:bg-secondary/80 text-foreground"
          >
            Save Initial Balances
          </Button>
        </motion.div>

        {/* Budget Limits Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-xl p-5 shadow-card border border-border/50"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-destructive/10">
              <Target className="w-5 h-5 text-destructive" />
            </div>
            <h2 className="font-medium text-foreground">Budget Limit</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Set monthly spending limit to get alerts</p>

          <div className="space-y-4 mb-4">
            <div className="space-y-2">
              <Label className="text-primary text-sm font-medium">Monthly Budget</Label>
              <p className="text-xs text-muted-foreground">
                Current: {budgetLimit ? `₹${budgetLimit.toLocaleString()}` : 'Not set'}
              </p>
              <Input
                type="number"
                placeholder="Set monthly limit"
                min="0"
                step="100"
                value={monthlyBudget}
                onChange={(e) => setMonthlyBudget(e.target.value)}
                className="bg-secondary/50 border-border/50"
              />
            </div>
          </div>

          <Button
            onClick={handleSaveBudgetLimits}
            disabled={!combinedOnline}
            className="w-full bg-secondary hover:bg-secondary/80 text-foreground"
          >
            Save Budget Limit
          </Button>
        </motion.div>

        {/* Export Data Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-card rounded-xl p-5 shadow-card border border-border/50"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <Download className="w-5 h-5 text-emerald-500" />
            </div>
            <h2 className="font-medium text-foreground">Export Data</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Download your spending records as CSV or PDF</p>
          
          <ExportDialog spendRecords={spendRecords} />
        </motion.div>

        {/* Change PIN Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-xl p-5 shadow-card border border-border/50"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-muted">
              <Lock className="w-5 h-5 text-muted-foreground" />
            </div>
            <h2 className="font-medium text-foreground">Change PIN</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Update your 4-digit PIN</p>

          <div className="space-y-4 mb-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground text-sm">Current PIN</Label>
              <Input
                type="password"
                inputMode="numeric"
                maxLength={4}
                placeholder="Enter 4 digits"
                value={currentPin}
                onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="bg-secondary/50 border-border/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-destructive text-sm">New PIN</Label>
              <Input
                type="password"
                inputMode="numeric"
                maxLength={4}
                placeholder="Enter 4 digits"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="bg-secondary/50 border-border/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-destructive text-sm">Confirm PIN</Label>
              <Input
                type="password"
                inputMode="numeric"
                maxLength={4}
                placeholder="Confirm 4 digits"
                value={confirmNewPin}
                onChange={(e) => setConfirmNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="bg-secondary/50 border-border/50"
              />
            </div>
          </div>

          <Button
            onClick={handleChangePin}
            disabled={!combinedOnline}
            className="w-full bg-secondary hover:bg-secondary/80 text-foreground"
          >
            Change PIN
          </Button>
        </motion.div>

        {/* Lock App Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Button
            onClick={handleLockApp}
            variant="outline"
            className="w-full border-destructive/50 text-destructive hover:bg-destructive/10"
          >
            <Lock className="w-4 h-4 mr-2" />
            Lock App
          </Button>
        </motion.div>
      </div>
    </Layout>
  );
};

export default SettingsPage;
