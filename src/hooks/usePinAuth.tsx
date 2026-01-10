import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PinAuthContextType {
  isAuthenticated: boolean;
  isPinSet: boolean;
  loading: boolean;
  isOnline: boolean;
  setPin: (pin: string) => Promise<void>;
  changePin: (currentPin: string, newPin: string) => Promise<boolean>;
  verifyPin: (pin: string) => boolean;
  logout: () => void;
  lockApp: () => void;
}

const PinAuthContext = createContext<PinAuthContextType | undefined>(undefined);

// Simple hash function for PIN
const hashPin = (pin: string): string => {
  let hash = 0;
  for (let i = 0; i < pin.length; i++) {
    const char = pin.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString();
};

export const PinAuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isPinSet, setIsPinSet] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const pinHashRef = useRef<string | null>(null);
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

  // Load data from database on mount
  useEffect(() => {
    const loadData = async () => {
      if (!navigator.onLine) {
        setLoading(false);
        return;
      }

      try {
        const { data: settings } = await supabase
          .from('app_settings')
          .select('*')
          .limit(1)
          .maybeSingle();

        if (settings) {
          pinHashRef.current = settings.pin_hash;
          settingsIdRef.current = settings.id;
          setIsPinSet(true);
        }
      } catch (error) {
        console.error('Error loading auth data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const setPin = useCallback(async (pin: string) => {
    if (!navigator.onLine) {
      throw new Error('Please go online to set PIN');
    }

    const hashedPin = hashPin(pin);
    
    try {
      if (settingsIdRef.current) {
        // Update existing
        await supabase
          .from('app_settings')
          .update({ pin_hash: hashedPin })
          .eq('id', settingsIdRef.current);
      } else {
        // Create new
        const { data } = await supabase
          .from('app_settings')
          .insert({ pin_hash: hashedPin })
          .select()
          .single();
        
        if (data) {
          settingsIdRef.current = data.id;
        }
      }

      pinHashRef.current = hashedPin;
      setIsPinSet(true);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error setting PIN:', error);
      throw new Error('Failed to set PIN. Please try again.');
    }
  }, []);

  const changePin = useCallback(async (currentPin: string, newPin: string): Promise<boolean> => {
    if (!navigator.onLine) {
      throw new Error('Please go online to change PIN');
    }

    const hashedCurrentPin = hashPin(currentPin);
    
    if (pinHashRef.current === hashedCurrentPin) {
      const hashedNewPin = hashPin(newPin);
      
      try {
        if (settingsIdRef.current) {
          await supabase
            .from('app_settings')
            .update({ pin_hash: hashedNewPin })
            .eq('id', settingsIdRef.current);
        }
        
        pinHashRef.current = hashedNewPin;
        return true;
      } catch (error) {
        console.error('Error changing PIN:', error);
        throw new Error('Failed to change PIN. Please try again.');
      }
    }
    return false;
  }, []);

  const verifyPin = useCallback((pin: string): boolean => {
    const hashedPin = hashPin(pin);
    
    if (pinHashRef.current === hashedPin) {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  }, []);

  const logout = () => {
    setIsAuthenticated(false);
  };

  const lockApp = () => {
    setIsAuthenticated(false);
  };

  return (
    <PinAuthContext.Provider value={{ 
      isAuthenticated, 
      isPinSet, 
      loading, 
      isOnline,
      setPin, 
      changePin,
      verifyPin, 
      logout,
      lockApp,
    }}>
      {children}
    </PinAuthContext.Provider>
  );
};

export const usePinAuth = () => {
  const context = useContext(PinAuthContext);
  if (context === undefined) {
    throw new Error('usePinAuth must be used within a PinAuthProvider');
  }
  return context;
};
