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
  RiskProfile: undefined;
  ChooseBroker: undefined;
  AccountSetup: undefined;
  FeatureWalkthrough: undefined;
  Login: undefined;
  Register: undefined;
  OTPVerification: { phone: string };
  ForgotPassword: undefined;
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
  Watchlist: undefined;
};

export type PortfolioStackParamList = {
  Portfolio: undefined;
  HoldingDetail: { symbol: string; quantity: number; avgPrice: number };
  TradeHistory: undefined;
  TaxReports: undefined;
  DividendTracker: undefined;
};

export type ProfileStackParamList = {
  Profile: undefined;
  Dashboard: undefined;
  Settings: undefined;
  Wallet: undefined;
  KYCUpload: undefined;
  AIAssistant: undefined;
  EducationalContent: undefined;
  LessonDetail: { lessonId: string; title: string; description: string; level: string };
  NotificationCenter: undefined;
  FractionalShares: undefined;
  CustomerSupport: undefined;
  PriceAlerts: undefined;
  MarketCalendar: undefined;
  ChooseBroker: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  TwoFactorSetup: undefined;
  PaymentMethods: undefined;
  AddPaymentMethod: { type: 'mpesa' | 'bank' };
  PrivacyPolicy: undefined;
  TermsConditions: undefined;
  LanguageSelection: undefined;
  DeleteAccount: undefined;
  LiveChat: undefined;
};

export type NewsStackParamList = {
  News: undefined;
  NewsDetail: { articleId: string };
};