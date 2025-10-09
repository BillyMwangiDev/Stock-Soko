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
      // Load wallet balance
      const balanceRes = await api.get('/ledger/balance');
      const balance = balanceRes.data.available_balance || 0;
      setCashBalance(balance);

      // Load portfolio positions
      const positionsRes = await api.get('/ledger/positions');
      const positions = positionsRes.data.positions || [];

      // Calculate portfolio metrics
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
    } catch (error) {
      console.error('Error loading portfolio data:', error);
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

