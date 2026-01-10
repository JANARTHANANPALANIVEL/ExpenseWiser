import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wallet, Delete, WifiOff } from 'lucide-react';
import { usePinAuth } from '@/hooks/usePinAuth';
import { FullPageLoader } from '@/components/ui/Loader';
import { toast } from 'sonner';

const PinPage = () => {
  const navigate = useNavigate();
  const { 
    isAuthenticated, 
    isPinSet, 
    loading, 
    isOnline,
    setPin, 
    verifyPin,
  } = usePinAuth();
  const [pin, setLocalPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, loading, navigate]);

  const handleNumberPress = async (num: string) => {
    // Check online status for setting new PIN
    if (!isPinSet && !isOnline) {
      toast.error('Please go online to set your PIN');
      return;
    }

    if (isConfirming) {
      if (confirmPin.length < 4) {
        const newPinValue = confirmPin + num;
        setConfirmPin(newPinValue);
        
        if (newPinValue.length === 4) {
          setTimeout(async () => {
            if (newPinValue === pin) {
              try {
                await setPin(newPinValue);
                toast.success('PIN set successfully!');
                navigate('/');
              } catch (error) {
                toast.error(error instanceof Error ? error.message : 'Failed to set PIN');
                setConfirmPin('');
                setLocalPin('');
                setIsConfirming(false);
              }
            } else {
              setShake(true);
              setTimeout(() => setShake(false), 500);
              toast.error('PINs do not match. Try again.');
              setConfirmPin('');
              setLocalPin('');
              setIsConfirming(false);
            }
          }, 200);
        }
      }
    } else {
      if (pin.length < 4) {
        const newPinValue = pin + num;
        setLocalPin(newPinValue);
        
        if (newPinValue.length === 4) {
          if (isPinSet) {
            setTimeout(() => {
              if (verifyPin(newPinValue)) {
                toast.success('Welcome back!');
                navigate('/');
              } else {
                setShake(true);
                setTimeout(() => setShake(false), 500);
                toast.error('Incorrect PIN. Try again.');
                setLocalPin('');
              }
            }, 200);
          } else {
            setTimeout(() => {
              setIsConfirming(true);
            }, 200);
          }
        }
      }
    }
  };

  const handleDelete = () => {
    if (isConfirming) {
      setConfirmPin(prev => prev.slice(0, -1));
    } else {
      setLocalPin(prev => prev.slice(0, -1));
    }
  };

  const currentPin = isConfirming ? confirmPin : pin;

  if (loading) {
    return <FullPageLoader />;
  }

  // Offline state - show message if PIN not set or need to verify online
  if (!isOnline && !isPinSet) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 safe-area-inset">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-destructive/10 mb-4">
            <WifiOff className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-xl font-semibold text-foreground mb-2">You're Offline</h1>
          <p className="text-sm text-muted-foreground max-w-xs">
            Please connect to the internet to set up your PIN and use ExpenseWise.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 safe-area-inset">
      {/* Offline indicator */}
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-destructive/10 text-destructive px-4 py-2 rounded-full text-sm"
        >
          <WifiOff className="w-4 h-4" />
          <span>Offline - Limited functionality</span>
        </motion.div>
      )}

      {/* Logo */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mb-8 text-center"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary mb-4">
          <Wallet className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="text-xl font-semibold text-foreground">ExpenseWise</h1>
        <p className="text-sm text-muted-foreground mt-2">
          {isPinSet 
            ? 'Enter your 4-digit PIN' 
            : isConfirming 
              ? 'Confirm your PIN'
              : 'Set your 4-digit PIN'
          }
        </p>
      </motion.div>

      {/* PIN Dots */}
      <motion.div
        animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="flex gap-4 mb-10"
      >
        {[0, 1, 2, 3].map((index) => (
          <motion.div
            key={index}
            initial={{ scale: 0.8 }}
            animate={{ 
              scale: currentPin.length > index ? 1.1 : 1,
              backgroundColor: currentPin.length > index ? 'hsl(var(--primary))' : 'hsl(var(--secondary))'
            }}
            className="w-4 h-4 rounded-full border-2 border-primary/30"
          />
        ))}
      </motion.div>

      {/* Number Pad */}
      <div className="grid grid-cols-3 gap-4 max-w-[280px] w-full">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <motion.button
            key={num}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleNumberPress(num.toString())}
            className="w-20 h-20 rounded-full bg-secondary/50 text-foreground text-2xl font-semibold flex items-center justify-center hover:bg-secondary/70 active:bg-primary/20 transition-colors touch-manipulation"
          >
            {num}
          </motion.button>
        ))}
        
        {/* Empty space */}
        <div className="w-20 h-20" />
        
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => handleNumberPress('0')}
          className="w-20 h-20 rounded-full bg-secondary/50 text-foreground text-2xl font-semibold flex items-center justify-center hover:bg-secondary/70 active:bg-primary/20 transition-colors touch-manipulation"
        >
          0
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleDelete}
          disabled={currentPin.length === 0}
          className="w-20 h-20 rounded-full bg-secondary/30 text-muted-foreground flex items-center justify-center hover:bg-secondary/50 active:bg-destructive/20 transition-colors disabled:opacity-30 touch-manipulation"
        >
          <Delete className="w-6 h-6" />
        </motion.button>
      </div>

      {/* Step indicator for new PIN setup */}
      {!isPinSet && (
        <div className="flex gap-2 mt-8">
          <div className={`w-2 h-2 rounded-full transition-colors ${!isConfirming ? 'bg-primary' : 'bg-secondary'}`} />
          <div className={`w-2 h-2 rounded-full transition-colors ${isConfirming ? 'bg-primary' : 'bg-secondary'}`} />
        </div>
      )}
    </div>
  );
};

export default PinPage;
