import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Receipt, 
  PlusCircle, 
  Wallet,
  Settings,
  LogOut,
  Wifi,
  WifiOff
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePinAuth } from '@/hooks/usePinAuth';
import { useWallet } from '@/contexts/WalletContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Home' },
  { path: '/spend', icon: Receipt, label: 'Spend' },
  { path: '/add-spend', icon: PlusCircle, label: 'Add' },
  { path: '/manage', icon: Wallet, label: 'Wallet' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const { logout } = usePinAuth();
  const { isOnline } = useWallet();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border/50 safe-area-top">
        <div className="px-4 h-14 flex items-center justify-between max-w-screen-xl mx-auto">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shrink-0">
              <Wallet className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-base text-foreground">ExpenseWise</span>
          </Link>
          <div className="flex items-center gap-2">
            {/* Online Status Indicator */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-secondary/50">
              {isOnline ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-[10px] font-medium text-muted-foreground">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-destructive" />
                  <span className="text-[10px] font-medium text-destructive">Offline</span>
                </>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground h-9 w-9"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-14 pb-20">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="px-4 py-4 max-w-screen-xl mx-auto"
        >
          {children}
        </motion.div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-xl border-t border-border/50 safe-area-bottom">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex items-center justify-around h-16 px-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 min-w-[60px] touch-manipulation',
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground active:text-foreground active:scale-95'
                  )}
                >
                  <div className="relative p-1">
                    <Icon className="w-5 h-5" />
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-primary/15 rounded-lg -z-10"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                  </div>
                  <span className="text-[10px] font-medium leading-none">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
};
