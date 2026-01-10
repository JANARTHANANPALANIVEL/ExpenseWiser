import { useState, useEffect, useCallback, useRef } from 'react';
import { WalletState, AddMoneyRecord, SpendRecord, PaymentMethod } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';

export const useSupabaseWalletData = () => {
  const [wallet, setWallet] = useState<WalletState>({
    initialHand: 0,
    initialGpay: 0,
    createdAt: new Date().toISOString(),
  });
  const [addMoneyRecords, setAddMoneyRecords] = useState<AddMoneyRecord[]>([]);
  const [spendRecords, setSpendRecords] = useState<SpendRecord[]>([]);
  const [budgetLimit, setBudgetLimitState] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [walletId, setWalletId] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const settingsIdRef = useRef<string | null>(null);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load data from database
  useEffect(() => {
    const loadData = async () => {
      if (!navigator.onLine) {
        setLoading(false);
        return;
      }

      try {
        // Load wallet state
        const { data: walletData } = await supabase
          .from('wallet_state')
          .select('*')
          .limit(1)
          .maybeSingle();

        if (walletData) {
          setWallet({
            initialHand: Number(walletData.initial_hand),
            initialGpay: Number(walletData.initial_gpay),
            createdAt: walletData.created_at,
          });
          setWalletId(walletData.id);
        }

        // Load add money records
        const { data: addMoneyData } = await supabase
          .from('add_money_records')
          .select('*')
          .order('created_at', { ascending: false });

        if (addMoneyData) {
          setAddMoneyRecords(addMoneyData.map(r => ({
            id: r.id,
            amount: Number(r.amount),
            method: r.method as PaymentMethod,
            date: r.date,
            createdAt: r.created_at,
          })));
        }

        // Load spend records
        const { data: spendData } = await supabase
          .from('spend_records')
          .select('*')
          .order('created_at', { ascending: false });

        if (spendData) {
          setSpendRecords(spendData.map(r => ({
            id: r.id,
            purpose: r.purpose,
            amount: Number(r.amount),
            method: r.method as PaymentMethod,
            date: r.date,
            createdAt: r.created_at,
          })));
        }

        // Load budget limit from app_settings
        const { data: settings } = await supabase
          .from('app_settings')
          .select('*')
          .limit(1)
          .maybeSingle();

        if (settings) {
          setBudgetLimitState(Number(settings.budget_limit) || 0);
          settingsIdRef.current = settings.id;
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const setInitialBalance = useCallback(async (hand: number, gpay: number) => {
    if (!navigator.onLine) {
      throw new Error('Please go online to update balance');
    }

    try {
      if (walletId) {
        await supabase
          .from('wallet_state')
          .update({ initial_hand: hand, initial_gpay: gpay })
          .eq('id', walletId);
      } else {
        const { data } = await supabase
          .from('wallet_state')
          .insert({ initial_hand: hand, initial_gpay: gpay })
          .select()
          .single();
        
        if (data) setWalletId(data.id);
      }

      setWallet(prev => ({
        ...prev,
        initialHand: hand,
        initialGpay: gpay,
      }));
    } catch (error) {
      console.error('Error saving wallet state:', error);
      throw new Error('Failed to save. Please try again.');
    }
  }, [walletId]);

  const setBudgetLimit = useCallback(async (limit: number) => {
    if (!navigator.onLine) {
      throw new Error('Please go online to update budget');
    }

    try {
      if (settingsIdRef.current) {
        await supabase
          .from('app_settings')
          .update({ budget_limit: limit })
          .eq('id', settingsIdRef.current);
      }
      setBudgetLimitState(limit);
    } catch (error) {
      console.error('Error saving budget limit:', error);
      throw new Error('Failed to save. Please try again.');
    }
  }, []);

  const addMoney = useCallback(async (record: Omit<AddMoneyRecord, 'id' | 'createdAt'>): Promise<AddMoneyRecord> => {
    if (!navigator.onLine) {
      throw new Error('Please go online to add money');
    }

    const newRecord: AddMoneyRecord = {
      ...record,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };

    try {
      await supabase
        .from('add_money_records')
        .insert({
          id: newRecord.id,
          amount: record.amount,
          method: record.method,
          date: record.date,
        });

      setAddMoneyRecords(prev => [newRecord, ...prev]);
      return newRecord;
    } catch (error) {
      console.error('Error adding money:', error);
      throw new Error('Failed to add money. Please try again.');
    }
  }, []);

  const addSpend = useCallback(async (record: Omit<SpendRecord, 'id' | 'createdAt'>): Promise<SpendRecord> => {
    if (!navigator.onLine) {
      throw new Error('Please go online to add spend');
    }

    const newRecord: SpendRecord = {
      ...record,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };

    try {
      await supabase
        .from('spend_records')
        .insert({
          id: newRecord.id,
          purpose: record.purpose,
          amount: record.amount,
          method: record.method,
          date: record.date,
        });

      setSpendRecords(prev => [newRecord, ...prev]);
      return newRecord;
    } catch (error) {
      console.error('Error adding spend:', error);
      throw new Error('Failed to add spend. Please try again.');
    }
  }, []);

  const updateSpend = useCallback(async (id: string, updates: Partial<Omit<SpendRecord, 'id' | 'createdAt'>>): Promise<SpendRecord | null> => {
    if (!navigator.onLine) {
      throw new Error('Please go online to update spend');
    }

    const existingRecord = spendRecords.find(r => r.id === id);
    if (!existingRecord) return null;

    const updatedRecord: SpendRecord = { ...existingRecord, ...updates };

    try {
      await supabase
        .from('spend_records')
        .update({
          ...(updates.purpose && { purpose: updates.purpose }),
          ...(updates.amount && { amount: updates.amount }),
          ...(updates.method && { method: updates.method }),
          ...(updates.date && { date: updates.date }),
        })
        .eq('id', id);

      setSpendRecords(prev => prev.map(r => r.id === id ? updatedRecord : r));
      return updatedRecord;
    } catch (error) {
      console.error('Error updating spend:', error);
      throw new Error('Failed to update. Please try again.');
    }
  }, [spendRecords]);

  return {
    wallet,
    addMoneyRecords,
    spendRecords,
    budgetLimit,
    loading,
    isOnline,
    setInitialBalance,
    setBudgetLimit,
    addMoney,
    addSpend,
    updateSpend,
  };
};
