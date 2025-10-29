/**
 * App Context
 * Global state management for Stock Soko
 */
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../api/client';

interface AppContextType {
  // User State
  hasCompletedOnboarding: boolean;
  userName: string;
  userEmail: string;
  
  // Portfolio State
  totalPortfolioValue: number;
  totalGainLoss: number;
  gainLossPercent: number;
  cashBalance: number;
  
  // App State
  isLoading: boolean;
  
  // Actions
  completeOnboarding: (name: string) => Promise<void>;
  refreshPortfolio: () => Promise<void>;
  setUserData: (name: string, email: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [userName, setUserName] = useState('Investor');
  const [userEmail, setUserEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Portfolio metrics
  const [totalPortfolioValue, setTotalPortfolioValue] = useState(0);
  const [totalGainLoss, setTotalGainLoss] = useState(0);
  const [gainLossPercent, setGainLossPercent] = useState(0);
  const [cashBalance, setCashBalance] = useState(0);

  useEffect(() => {
    loadAppState();
  }, []);

  const loadAppState = async () => {
    try {
      // Initialize demo cash balance on first app launch
      const demoCashInitialized = await AsyncStorage.getItem('demo_cash_initialized');
      if (!demoCashInitialized) {
        console.log('[AppContext] Initializing demo cash balance to KES 100,000');
        await AsyncStorage.setItem('demo_cash_balance', '100000');
        await AsyncStorage.setItem('demo_cash_initialized', 'true');
      }
      
      // Load onboarding status
      const onboardingStatus = await AsyncStorage.getItem('hasCompletedOnboarding');
      const storedUserName = await AsyncStorage.getItem('userName');
      const storedUserEmail = await AsyncStorage.getItem('userEmail');

      if (onboardingStatus === 'true') {
        setHasCompletedOnboarding(true);
      }
      if (storedUserName) {
        setUserName(storedUserName);
      }
      if (storedUserEmail) {
        setUserEmail(storedUserEmail);
      }

      // Load portfolio data if user is authenticated
      const email = await AsyncStorage.getItem('userEmail');
      if (email) {
        await loadPortfolioData();
      }
    } catch (error) {
      console.error('Error loading app state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPortfolioData = async () => {
    try {
      console.log('[AppContext] Loading portfolio data...');
      
      // Load wallet balance
      const balanceRes = await api.get('/ledger/balance');
      const balance = balanceRes.data.available_balance || 0;

      // Load portfolio positions
      const positionsRes = await api.get('/ledger/positions');
      const positions = positionsRes.data.positions || [];

      // If user has no positions and is not authenticated, use demo mode
      if (positions.length === 0 && balance === 0) {
        console.log('[AppContext] Demo mode - initializing portfolio from AsyncStorage');
        
        // Load demo cash balance
        const cashStr = await AsyncStorage.getItem('demo_cash_balance');
        const demoCash = cashStr ? parseFloat(cashStr) : 100000;
        
        // Load demo positions (from actual demo trades)
        const demoPositionsStr = await AsyncStorage.getItem('demo_positions');
        const demoPositions = demoPositionsStr ? JSON.parse(demoPositionsStr) : [];
        
        let totalVal = 0;
        let totalPL = 0;
        let totalInv = 0;
        
        // Calculate portfolio metrics from demo positions
        for (const position of demoPositions) {
          try {
            const stockRes = await api.get(`/markets/stocks/${position.symbol}`);
            const currentPrice = stockRes.data.last_price || 0;
            
            const positionValue = position.quantity * currentPrice;
            const costBasis = position.avg_price * position.quantity;
            const profitLoss = positionValue - costBasis;
            
            totalVal += positionValue;
            totalInv += costBasis;
            totalPL += profitLoss;
          } catch (err) {
            console.error(`Failed to load price for demo position ${position.symbol}:`, err);
          }
        }
        
        setCashBalance(demoCash);
        setTotalPortfolioValue(totalVal + demoCash);
        setTotalGainLoss(totalPL);
        setGainLossPercent(totalInv > 0 ? (totalPL / totalInv) * 100 : 0);
        
        console.log(`[AppContext] Demo portfolio loaded: Cash KES ${demoCash.toFixed(2)}, Holdings ${demoPositions.length}, Total Value KES ${(totalVal + demoCash).toFixed(2)}`);
        return;
      }

      // User has real positions, calculate metrics
      setCashBalance(balance);

      let totalValue = balance;
      let totalInvested = 0;
      let totalPL = 0;

      for (const position of positions) {
        try {
          const stockRes = await api.get(`/markets/stocks/${position.symbol}`);
          const currentPrice = stockRes.data.last_price || 0;
          
          const positionValue = position.quantity * currentPrice;
          const costBasis = position.avg_price * position.quantity;
          const profitLoss = positionValue - costBasis;
          
          totalValue += positionValue;
          totalInvested += costBasis;
          totalPL += profitLoss;
        } catch (error) {
          console.error(`Failed to load price for ${position.symbol}:`, error);
        }
      }

      const plPercent = totalInvested > 0 ? (totalPL / totalInvested) * 100 : 0;

      setTotalPortfolioValue(totalValue);
      setTotalGainLoss(totalPL);
      setGainLossPercent(plPercent);
      
      console.log('[AppContext] Real portfolio data loaded successfully');
    } catch (error: any) {
      // Handle errors - fallback to demo data
      if (error.response?.status === 401) {
        console.log('[AppContext] User not authenticated - using demo portfolio data');
      } else {
        console.error('[AppContext] Error loading portfolio data:', error.message);
      }
      
      // Use demo data as fallback
      const mockHoldings = [
        { symbol: 'KCB', quantity: 100, avg_price: 32.50, current_price: 35.20, total_value: 3520, profit_loss: 270 },
        { symbol: 'SCOM', quantity: 200, avg_price: 28.00, current_price: 29.50, total_value: 5900, profit_loss: 300 },
        { symbol: 'EQTY', quantity: 150, avg_price: 48.00, current_price: 46.50, total_value: 6975, profit_loss: -225 },
      ];
      
      const totalVal = mockHoldings.reduce((sum, h) => sum + h.total_value, 0); // 16,395
      const totalPL = mockHoldings.reduce((sum, h) => sum + h.profit_loss, 0);  // 345
      const totalInv = mockHoldings.reduce((sum, h) => sum + (h.avg_price * h.quantity), 0); // 16,050
      const cashBal = 50000;
      
      setCashBalance(cashBal);
      setTotalPortfolioValue(totalVal + cashBal); // 66,395
      setTotalGainLoss(totalPL);
      setGainLossPercent(totalInv > 0 ? (totalPL / totalInv) * 100 : 0);
    }
  };

  const completeOnboarding = useCallback(async (name: string) => {
    try {
      await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
      await AsyncStorage.setItem('userName', name);
      setHasCompletedOnboarding(true);
      setUserName(name);
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  }, []);

  const refreshPortfolio = useCallback(async () => {
    await loadPortfolioData();
  }, []);

  const setUserData = useCallback((name: string, email: string) => {
    setUserName(name);
    setUserEmail(email);
    AsyncStorage.setItem('userName', name);
    AsyncStorage.setItem('userEmail', email);
  }, []);

  const contextValue = useMemo(() => ({
    hasCompletedOnboarding,
    userName,
    userEmail,
    totalPortfolioValue,
    totalGainLoss,
    gainLossPercent,
    cashBalance,
    isLoading,
    completeOnboarding,
    refreshPortfolio,
    setUserData,
  }), [
    hasCompletedOnboarding,
    userName,
    userEmail,
    totalPortfolioValue,
    totalGainLoss,
    gainLossPercent,
    cashBalance,
    isLoading,
    completeOnboarding,
    refreshPortfolio,
    setUserData,
  ]);

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};