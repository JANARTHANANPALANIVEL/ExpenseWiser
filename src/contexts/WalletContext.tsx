import { createContext, useContext, ReactNode } from 'react';
import { useSupabaseWalletData } from '@/hooks/useSupabaseWalletData';
import { WalletState, AddMoneyRecord, SpendRecord } from '@/lib/types';

interface WalletContextType {
  wallet: WalletState;
  addMoneyRecords: AddMoneyRecord[];
  spendRecords: SpendRecord[];
  loading: boolean;
  budgetLimit: number;
  isOnline: boolean;
  addMoney: (record: Omit<AddMoneyRecord, 'id' | 'createdAt'>) => Promise<AddMoneyRecord>;
  addSpend: (record: Omit<SpendRecord, 'id' | 'createdAt'>) => Promise<SpendRecord>;
  updateSpend: (id: string, updates: Partial<Omit<SpendRecord, 'id' | 'createdAt'>>) => Promise<SpendRecord | null>;
  getSpendById: (id: string) => SpendRecord | undefined;
  setBudgetLimit: (limit: number) => Promise<void>;
  setInitialBalance: (hand: number, gpay: number) => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const walletData = useSupabaseWalletData();

  const getSpendById = (id: string) => {
    return walletData.spendRecords.find(r => r.id === id);
  };

  return (
    <WalletContext.Provider value={{ ...walletData, getSpendById }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
