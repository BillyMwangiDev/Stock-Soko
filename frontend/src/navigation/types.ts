/**
 * Navigation Type Definitions
 * Defines all navigation stacks and their parameters
 */

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  OTPVerification: { phone: string };
};

export type MainTabParamList = {
  HomeTab: undefined;
  MarketsTab: undefined;
  PortfolioTab: undefined;
  NewsTab: undefined;
  ProfileTab: undefined;
};

export type TradeStackParamList = {
  Markets: undefined;
  StockDetail: { symbol: string };
  TradeOrder: { symbol: string; side: 'buy' | 'sell' };
  ReviewOrder: { 
    symbol: string; 
    side: 'buy' | 'sell'; 
    quantity: number; 
    price?: number;
    orderType: 'market' | 'limit';
  };
  OrderStatus: { 
    orderId: string; 
    status: 'pending' | 'executed' | 'failed' 
  };
};

export type PortfolioStackParamList = {
  Portfolio: undefined;
  HoldingDetail: { symbol: string; quantity: number; avgPrice: number };
};

export type ProfileStackParamList = {
  Profile: undefined;
  Settings: undefined;
  Wallet: undefined;
  KYCUpload: undefined;
  AIAssistant: undefined;
};

export type NewsStackParamList = {
  News: undefined;
  NewsDetail: { articleId: string };
};

